<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'conexion.php';

$sql = "SELECT p.id_producto, p.nombre_producto AS nombre, p.descripcion, p.precio, 
               p.id_categoria, c.nombre_categoria AS categoria_nombre 
        FROM productos p 
        JOIN categorias c ON p.id_categoria = c.id_categoria 
        WHERE p.disponible = 1 
        ORDER BY p.id_categoria, p.id_producto";

$resultado = $conexion->query($sql);

if (!$resultado) {
    http_response_code(500);
    echo json_encode(["error" => "Error en consulta: " . $conexion->error]);
    exit;
}

$productos = [];
while ($fila = $resultado->fetch_assoc()) {
    $productos[] = $fila;
}

echo json_encode($productos);
?>
