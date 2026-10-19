<?php
session_set_cookie_params(86400 * 30);
session_start();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

if (!isset($_SESSION['id_cliente'])) {
    http_response_code(401);
    echo json_encode(["error" => "No autenticado"]);
    exit;
}

require_once 'conexion.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "Payload JSON inválido"]);
    exit;
}

$idCliente = $_SESSION['id_cliente'];


$tipoEntregaMap = ['Delivery' => 'Delivery', 'Retiro en tienda' => 'Retiro'];
$tipoEntrega = $tipoEntregaMap[$data['pedido']['tipo_entrega'] ?? ''] ?? 'Retiro';

$idMetodo = intval($data['checkout']['metodo_pago'] ?? 1);
$totalFinal = floatval($data['checkout']['total_final'] ?? 0);
$detalles = $data['detalle_pedidos'] ?? [];
$deliveryInfo = $data['delivery'] ?? null;

if (empty($detalles)) {
    http_response_code(400);
    echo json_encode(["error" => "El pedido no tiene productos"]);
    exit;
}

$conexion->begin_transaction();

try {
    $idDelivery = null;

    // 1. Insertar delivery si aplica
    if ($tipoEntrega === 'Delivery' && $deliveryInfo) {
        $dirEntrega = trim($deliveryInfo['direccion_entrega'] ?? '');
        $stmtDelivery = $conexion->prepare(
            "INSERT INTO Deliveries (direccion_entrega, estado_envio) VALUES (?, 'En preparación')"
        );
        $stmtDelivery->bind_param("s", $dirEntrega);
        $stmtDelivery->execute();
        $idDelivery = $stmtDelivery->insert_id;
    }

    // 2. Insertar pedido
    $stmtPedido = $conexion->prepare("INSERT INTO Pedidos (id_cliente, id_delivery, estado_preparacion, tipo_entrega) VALUES (?, ?, 'Pendiente', ?)");
    $stmtPedido->bind_param("iis", $idCliente, $idDelivery, $tipoEntrega);
    $stmtPedido->execute();
    $idPedido = $stmtPedido->insert_id;

    if (!$idPedido) throw new Exception("Error al crear pedido");

    // 3. Insertar detalles
    $stmtDetalle = $conexion->prepare(
        "INSERT INTO Detalle_Pedidos (id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)"
    );
    $stmtMod = $conexion->prepare(
        "INSERT INTO Modificaciones_Detalle (id_detalle, opcion_elegida, precio_adicional) VALUES (?, ?, 0)"
    );

    $sumaProductos = 0;

    foreach ($detalles as $det) {
        $idProducto = intval($det['id_producto']);
        $cantidad = intval($det['cantidad']);
        $precioUnit = floatval($det['precio_unitario']);
        $subtotal = $precioUnit * $cantidad; // Cálculo seguro en backend
        $sumaProductos += $subtotal;

        $observaciones = trim($det['observaciones'] ?? '');

        $stmtDetalle->bind_param("iiidd", $idPedido, $idProducto, $cantidad, $precioUnit, $subtotal);
        $stmtDetalle->execute();
        $idDetalle = $stmtDetalle->insert_id;

        if (!$idDetalle) throw new Exception("Error al insertar detalle");

        if ($observaciones) {
            $stmtMod->bind_param("is", $idDetalle, $observaciones);
            $stmtMod->execute();
        }
    }

    $costoEnvio = ($tipoEntrega === 'Delivery') ? 5.00 : 0.00;
    $totalSinDescuento = $sumaProductos + $costoEnvio;

    // Verificar descuento de bienvenida
    $stmtPedidosCount = $conexion->prepare("SELECT COUNT(*) AS total FROM Pedidos WHERE id_cliente = ?");
    $stmtPedidosCount->bind_param("i", $idCliente);
    $stmtPedidosCount->execute();
    $pedidosCount = $stmtPedidosCount->get_result()->fetch_assoc()['total'];

    $montoDescuento = 0;
    if ($pedidosCount == 0) {
        $montoDescuento = $sumaProductos * 0.15; // 15% de descuento solo a productos
    }

    $totalFinalReal = $totalSinDescuento - $montoDescuento;

    // 4. Insertar checkout
    $stmtCheckout = $conexion->prepare(
        "INSERT INTO Checkout_Ordenes (id_pedido, id_metodo, monto_descuento, total_final, estado_pago) VALUES (?, ?, ?, ?, 'Pendiente')"
    );
    $stmtCheckout->bind_param("iidd", $idPedido, $idMetodo, $montoDescuento, $totalFinalReal);
    $stmtCheckout->execute();

    $conexion->commit();
    echo json_encode(["success" => true, "id_pedido" => $idPedido]);

} catch (Exception $e) {
    $conexion->rollback();
    http_response_code(500);
    echo json_encode(["error" => "Error al procesar pedido: " . $e->getMessage()]);
}
?>
