-- 1. REINICIO DE LA BASE DE DATOS
DROP DATABASE IF EXISTS ramen_master_db;
CREATE DATABASE ramen_master_db DEFAULT CHARACTER SET utf8mb4;
USE ramen_master_db;

-- BLOQUE 1: LOCALES, PERSONAL Y CLIENTES
CREATE TABLE Sedes (
    id_sede INT AUTO_INCREMENT PRIMARY KEY,
    nombre_sede VARCHAR(50) NOT NULL,
    direccion VARCHAR(150) NOT NULL,
    telefono_sede VARCHAR(15)
);

CREATE TABLE Repartidores (
    id_repartidor INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(15),
    id_sede INT NOT NULL,
    FOREIGN KEY (id_sede) REFERENCES Sedes(id_sede)
);

CREATE TABLE Clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(15)
);

-- BLOQUE 2: EL MENÚ Y FINANZAS
CREATE TABLE Categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL
);

CREATE TABLE Productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    id_categoria INT NOT NULL,
    disponible BOOLEAN DEFAULT 1,
    FOREIGN KEY (id_categoria) REFERENCES Categorias(id_categoria)
);

CREATE TABLE Metodos_Pago (
    id_metodo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_metodo VARCHAR(30) NOT NULL
);

CREATE TABLE Descuentos (
    id_descuento INT AUTO_INCREMENT PRIMARY KEY,
    nombre_descuento VARCHAR(50) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL
);

-- BLOQUE 3: EL CORAZÓN DE LA COMPRA

CREATE TABLE Pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_preparacion VARCHAR(30) DEFAULT 'En cocina',
    tipo_entrega VARCHAR(30) NOT NULL, 
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente)
);

CREATE TABLE Detalle_Pedidos (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

CREATE TABLE Modificaciones_Detalle (
    id_modificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_detalle INT NOT NULL,
    opcion_elegida VARCHAR(100) NOT NULL, 
    precio_adicional DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (id_detalle) REFERENCES Detalle_Pedidos(id_detalle) ON DELETE CASCADE
);

-- BLOQUE 4: CAJA Y LOGÍSTICA
CREATE TABLE Checkout_Ordenes (
    id_checkout INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT UNIQUE NOT NULL, 
    id_metodo INT NOT NULL,
    id_descuento INT NULL,
    monto_descuento DECIMAL(10,2) DEFAULT 0.00,
    total_final DECIMAL(10,2) NOT NULL,
    estado_pago VARCHAR(20) DEFAULT 'Pagado',
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_metodo) REFERENCES Metodos_Pago(id_metodo),
    FOREIGN KEY (id_descuento) REFERENCES Descuentos(id_descuento)
);

CREATE TABLE Deliveries (
    id_delivery INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT UNIQUE NOT NULL, 
    id_repartidor INT NOT NULL, 
    direccion_entrega VARCHAR(255) NOT NULL,
    estado_envio VARCHAR(30) DEFAULT 'En camino',
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_repartidor) REFERENCES Repartidores(id_repartidor)
);






SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Deliveries;
TRUNCATE TABLE Checkout_Ordenes;
TRUNCATE TABLE Modificaciones_Detalle;
TRUNCATE TABLE Detalle_Pedidos;
TRUNCATE TABLE Pedidos;
TRUNCATE TABLE Productos;
TRUNCATE TABLE Categorias;
TRUNCATE TABLE Descuentos;
TRUNCATE TABLE Metodos_Pago;
TRUNCATE TABLE Clientes;
TRUNCATE TABLE Repartidores;
TRUNCATE TABLE Sedes;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. SEDES, REPARTIDORES, CLIENTES
INSERT INTO Sedes (nombre_sede, direccion, telefono_sede) VALUES 
('Sede Santa Anita', 'Av. Cascanueces 2221, Santa Anita', '+51 942 888 275'),
('Sede Miraflores', 'Av. Larco 123, Miraflores', '+51 999 888 777');

INSERT INTO Repartidores (nombre, apellido, correo, telefono, id_sede) VALUES 
('Frank', 'Chambergo', 'fchambergo@ramenmaster.com', '987333444', 1),
('Jair', 'Nolasco', 'jnolasco@ramenmaster.com', '987111222', 1);

-- ERROR CORREGIDO AQUI: Faltaba una coma y sobraba un id manual.
INSERT INTO Clientes (nombre, apellido, correo, telefono) VALUES 
('Luis', 'Perez', 'luis.perez@email.com', '912345678'),
('Ana', 'Gomez', 'ana.gomez@email.com', '988777666'),
('Carlos', 'Ruiz', 'cruiz@email.com', '977666555'),
('Maria', 'Salas', 'msalas@email.com', '966555444');

-- 2. FINANZAS Y CATEGORÍAS
INSERT INTO Metodos_Pago (nombre_metodo) VALUES 
('Tarjeta Credito/Debito'), ('Yape/Plin'), ('Efectivo');

INSERT INTO Descuentos (nombre_descuento, porcentaje) VALUES 
('BIENVENIDA_RAMEN', 15.00);

INSERT INTO Categorias (nombre_categoria) VALUES 
('Ramen'), ('Sushi'), ('Arroz Frito'), ('Omelets');

-- 3. INSERTS DE LA CARTA COMPLETA (PRODUCTOS)
-- RAMEN (id_categoria = 1)
INSERT INTO Productos (nombre_producto, descripcion, precio, id_categoria, disponible) VALUES 
('Tonkotsu Ramen', 'Caldo de cerdo insignia (18h). Chashu, huevo ajitama, fideos frescos.', 32.00, 1, 1),
('Shoyu Ramen', 'Caldo ligero a base de soya, con pollo, menma y espinaca.', 30.00, 1, 1),
('Miso Ramen', 'Caldo a base de miso, con maíz, mantequilla y chashu.', 31.00, 1, 1),
('Tantanmen (Picante)', 'Caldo cremoso y picante de sésamo con carne de cerdo molida.', 34.00, 1, 1),
('Veggie Ramen', 'Caldo de vegetales y hongos shiitake, con tofu y verduras de estación.', 29.00, 1, 1);

-- SUSHI (id_categoria = 2)
INSERT INTO Productos (nombre_producto, descripcion, precio, id_categoria, disponible) VALUES 
('Maki Acevichado', 'Relleno de langostino furai y palta, cubierto con atún y salsa acevichada.', 28.00, 2, 1),
('California Roll', 'Clásico roll con palta, kani kama (cangrejo) y pepino, cubierto de sésamo.', 24.00, 2, 1),
('Nigiri Salmón (2u)', 'Cortes frescos de salmón sobre arroz de sushi sazonado.', 12.00, 2, 1),
('Maki Furai', 'Roll empanizado y frito, relleno de queso crema y salmón.', 26.00, 2, 1),
('Sashimi Atún (5 cortes)', 'Cortes puros y frescos de atún, servidos con wasabi y kion.', 20.00, 2, 1);

-- ARROZ FRITO (id_categoria = 3)
INSERT INTO Productos (nombre_producto, descripcion, precio, id_categoria, disponible) VALUES 
('Chaufa de Pollo', 'Clásico arroz frito con trozos de pollo, tortilla y cebollita china.', 25.00, 3, 1),
('Chaufa de Mariscos', 'Arroz frito saltado al wok con langostinos, calamar y conchas.', 35.00, 3, 1),
('Chaufa Especial', 'Combinación de pollo, cerdo y langostinos en nuestro arroz frito.', 30.00, 3, 1),
('Yakimeshi', 'Arroz frito japonés con verduras, mantequilla y un toque de soya.', 28.00, 3, 1),
('Arroz Vegetariano', 'Arroz frito con hongos, tofu, brócoli y pimientos.', 24.00, 3, 1);

-- OMELETS (id_categoria = 4)
INSERT INTO Productos (nombre_producto, descripcion, precio, id_categoria, disponible) VALUES 
('Omelet de Cangrejo', 'Tortilla japonesa rellena de pulpa de cangrejo fresca.', 25.00, 4, 1),
('Omurice Clásico', 'Omelet tierno sobre arroz frito, bañado en salsa demiglace.', 27.00, 4, 1),
('Tamagoyaki (Dulce)', 'Clásica tortilla japonesa enrollada con un toque dulce.', 15.00, 4, 1),
('Tortilla de Langostinos', 'Tortilla esponjosa con langostinos y cebollita china.', 29.00, 4, 1),
('Omelet con Queso', 'Omelet relleno de queso mozzarella derretido.', 20.00, 4, 1);

-- 4. PEDIDOS Y TRANSACCIONES
-- Pedido 1
INSERT INTO Pedidos (id_pedido, id_cliente, estado_preparacion, tipo_entrega) VALUES 
(1, 1, 'Listo para entregar', 'Delivery');
INSERT INTO Detalle_Pedidos (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES 
(1, 1, 1, 2, 32.00, 64.00), 
(2, 1, 6, 1, 28.00, 28.00); 
INSERT INTO Modificaciones_Detalle (id_detalle, opcion_elegida, precio_adicional) VALUES 
(1, 'Sin cebollita china', 0.00);
INSERT INTO Checkout_Ordenes (id_pedido, id_metodo, id_descuento, monto_descuento, total_final, estado_pago) VALUES 
(1, 2, 1, 13.80, 78.20, 'Pagado');
INSERT INTO Deliveries (id_pedido, id_repartidor, direccion_entrega, estado_envio) VALUES 
(1, 1, 'Av. Los Ficus 456, Santa Anita', 'En camino');

-- Pedido 2
INSERT INTO Pedidos (id_pedido, id_cliente, estado_preparacion, tipo_entrega) VALUES 
(2, 2, 'En cocina', 'Retiro en tienda');
INSERT INTO Detalle_Pedidos (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES 
(3, 2, 2, 1, 30.00, 30.00), 
(4, 2, 14, 1, 28.00, 28.00); 
INSERT INTO Modificaciones_Detalle (id_detalle, opcion_elegida, precio_adicional) VALUES 
(4, 'Extra tortilla de huevo', 2.00); 
INSERT INTO Checkout_Ordenes (id_pedido, id_metodo, id_descuento, monto_descuento, total_final, estado_pago) VALUES 
(2, 1, NULL, 0.00, 60.00, 'Pagado');

-- Pedido 3
INSERT INTO Pedidos (id_pedido, id_cliente, estado_preparacion, tipo_entrega) VALUES 
(3, 3, 'Listo para entregar', 'Delivery');
INSERT INTO Detalle_Pedidos (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES 
(5, 3, 1, 3, 32.00, 96.00), 
(6, 3, 10, 2, 20.00, 40.00); 
INSERT INTO Checkout_Ordenes (id_pedido, id_metodo, id_descuento, monto_descuento, total_final, estado_pago) VALUES 
(3, 3, 1, 20.40, 115.60, 'Pagado');
INSERT INTO Deliveries (id_pedido, id_repartidor, direccion_entrega, estado_envio) VALUES 
(3, 2, 'Av. Universitaria 123, San Miguel', 'En camino');

-- Pedido 4
INSERT INTO Pedidos (id_pedido, id_cliente, estado_preparacion, tipo_entrega) VALUES 
(4, 4, 'Entregado', 'Retiro en tienda');
INSERT INTO Detalle_Pedidos (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES 
(7, 4, 17, 2, 27.00, 54.00), 
(8, 4, 12, 1, 35.00, 35.00); 
INSERT INTO Checkout_Ordenes (id_pedido, id_metodo, id_descuento, monto_descuento, total_final, estado_pago) VALUES 
(4, 2, NULL, 0.00, 89.00, 'Pagado');

-- Pedido 5
INSERT INTO Pedidos (id_pedido, id_cliente, estado_preparacion, tipo_entrega) VALUES 
(5, 1, 'Entregado', 'Delivery');
INSERT INTO Detalle_Pedidos (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES 
(9, 5, 4, 1, 34.00, 34.00); 
INSERT INTO Checkout_Ordenes (id_pedido, id_metodo, id_descuento, monto_descuento, total_final, estado_pago) VALUES 
(5, 1, NULL, 0.00, 34.00, 'Pagado');
INSERT INTO Deliveries (id_pedido, id_repartidor, direccion_entrega, estado_envio) VALUES 
(5, 1, 'Calle Los Pinos 444, Miraflores', 'Entregado');