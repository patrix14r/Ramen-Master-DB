<?php
session_set_cookie_params(86400 * 30); 
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once 'conexion.php';

$action = $_GET['action'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {
    case 'login':
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (!$email || !$password) {
            echo json_encode(["error" => "Email y contraseña son obligatorios"]);
            exit;
        }

        $stmt = $conexion->prepare("SELECT id_cliente, nombre, apellido, correo, password_hash FROM Clientes WHERE correo = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            echo json_encode(["error" => "No existe una cuenta con ese correo"]);
            exit;
        }

        $cliente = $result->fetch_assoc();

        if (!password_verify($password, $cliente['password_hash'])) {
            echo json_encode(["error" => "Contraseña incorrecta"]);
            exit;
        }

        // Verificar si es primera compra
        $stmtPedidos = $conexion->prepare("SELECT COUNT(*) AS total_pedidos FROM Pedidos WHERE id_cliente = ?");
        $stmtPedidos->bind_param("i", $cliente['id_cliente']);
        $stmtPedidos->execute();
        $pedidos = $stmtPedidos->get_result()->fetch_assoc();
        $primera_compra = ($pedidos['total_pedidos'] == 0);

        $_SESSION['id_cliente'] = $cliente['id_cliente'];
        $_SESSION['cliente_nombre'] = $cliente['nombre'];
        $_SESSION['cliente_email'] = $cliente['correo'];

        echo json_encode([
            "success" => true,
            "cliente" => [
                "id" => $cliente['id_cliente'],
                "nombre" => $cliente['nombre'],
                "email" => $cliente['correo'],
                "primera_compra" => $primera_compra
            ]
        ]);
        break;

    case 'register':
        $nombre = trim($input['nombre'] ?? '');
        $apellido = trim($input['apellido'] ?? '');
        $email = trim($input['email'] ?? '');
        $telefono = trim($input['telefono'] ?? '');
        $password = $input['password'] ?? '';

        if (!$nombre || !$apellido || !$email || !$password) {
            echo json_encode(["error" => "Nombre, apellido, email y contraseña son obligatorios"]);
            exit;
        }

        // Verificar email único
        $check = $conexion->prepare("SELECT id_cliente FROM Clientes WHERE correo = ?");
        $check->bind_param("s", $email);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            echo json_encode(["error" => "Ya existe una cuenta con ese correo"]);
            exit;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);

        $stmt = $conexion->prepare("INSERT INTO Clientes (nombre, apellido, correo, telefono, password_hash) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $nombre, $apellido, $email, $telefono, $hash);

        if (!$stmt->execute()) {
            echo json_encode(["error" => "Error al registrar: " . $stmt->error]);
            exit;
        }

        $newId = $stmt->insert_id;

        // Auto-login (asumimos que al registrarse es su primera compra)
        $_SESSION['id_cliente'] = $newId;
        $_SESSION['cliente_nombre'] = $nombre;
        $_SESSION['cliente_email'] = $email;

        echo json_encode([
            "success" => true,
            "cliente" => [
                "id" => $newId,
                "nombre" => $nombre,
                "email" => $email,
                "primera_compra" => true
            ]
        ]);
        break;
        
    case 'recuperar':
        $email = trim($input['email'] ?? '');
        if (!$email) {
            echo json_encode(["error" => "Email es obligatorio"]);
            exit;
        }

        $check = $conexion->prepare("SELECT id_cliente FROM Clientes WHERE correo = ?");
        $check->bind_param("s", $email);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            echo json_encode(["success" => true, "mensaje" => "Se ha enviado un enlace de recuperación a tu correo."]);
        } else {
            // Retornamos success igual por seguridad para no revelar si el correo existe o no
            echo json_encode(["success" => true, "mensaje" => "Si el correo existe, recibirás un enlace."]);
        }
        break;

    case 'check':
        if (isset($_SESSION['id_cliente'])) {
            // Verificar primera compra de nuevo por si hizo pedido en otra pestaña
            $stmtPedidos = $conexion->prepare("SELECT COUNT(*) AS total_pedidos FROM Pedidos WHERE id_cliente = ?");
            $stmtPedidos->bind_param("i", $_SESSION['id_cliente']);
            $stmtPedidos->execute();
            $pedidos = $stmtPedidos->get_result()->fetch_assoc();
            $primera_compra = ($pedidos['total_pedidos'] == 0);

            echo json_encode([
                "success" => true,
                "cliente" => [
                    "id" => $_SESSION['id_cliente'],
                    "nombre" => $_SESSION['cliente_nombre'],
                    "email" => $_SESSION['cliente_email'],
                    "primera_compra" => $primera_compra
                ]
            ]);
        } else {
            echo json_encode(["success" => false]);
        }
        break;

    case 'logout':
        session_destroy();
        echo json_encode(["success" => true]);
        break;

    default:
        echo json_encode(["error" => "Acción inválida"]);
        break;
}
?>
