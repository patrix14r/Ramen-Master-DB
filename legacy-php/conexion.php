<?php
$host = "127.0.0.1";
$user = "root";
$password = "12345678"; 
$db   = "ramen_master_db";
$port = 3306;

$conexion = new mysqli($host, $user, $password, $db, $port);

if ($conexion->connect_error) {
    die(json_encode(["error" => "Fallo de conexion: " . $conexion->connect_error]));
}

$conexion->set_charset("utf8mb4");
?>