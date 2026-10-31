DROP DATABASE IF EXISTS ramen_master_db;
CREATE DATABASE ramen_master_db DEFAULT CHARACTER SET utf8mb4;
USE ramen_master_db;

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
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(9)
);

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
    imagen VARCHAR(255) NULL,
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
    porcentaje DECIMAL(5,2) NOT NULL,
    descripcion VARCHAR(255)
);

CREATE TABLE Deliveries (
    id_delivery INT PRIMARY KEY AUTO_INCREMENT,
    id_repartidor INT,
    direccion_entrega VARCHAR(255),
    estado_envio VARCHAR(50),
    FOREIGN KEY (id_repartidor) REFERENCES Repartidores(id_repartidor)
);

CREATE TABLE Pedidos (
    id_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT NOT NULL,
    id_delivery INT NULL UNIQUE,
    estado_preparacion VARCHAR(50),
    tipo_entrega VARCHAR(50),
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente),
    FOREIGN KEY (id_delivery) REFERENCES Deliveries(id_delivery)
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

INSERT INTO Sedes (nombre_sede, direccion, telefono_sede) VALUES 
('Sede Santa Anita', 'Av. Cascanueces 2221, Santa Anita', '+51 942 888 275'),
('Sede Miraflores', 'Av. Larco 123, Miraflores', '+51 999 888 777');

INSERT INTO Repartidores (nombre, apellido, correo, telefono, id_sede) VALUES 
('Frank', 'Chambergo', 'fchambergo@ramenmaster.com', '987333444', 1),
('Jair', 'Nolasco', 'jnolasco@ramenmaster.com', '987111222', 1);

INSERT INTO Clientes (nombre, apellido, correo, password_hash, telefono) VALUES
('Luis', 'Perez', 'luis.perez@email.com', '$2y$10$abcdefghijklmnopqrstuv', '912345678'),
('Ana', 'Gomez', 'ana.gomez@email.com', '$2y$10$abcdefghijklmnopqrstuv', '988777666'),
('Carlos', 'Ruiz', 'cruiz@email.com', '$2y$10$abcdefghijklmnopqrstuv', '977666555'),
('Maria', 'Salas', 'msalas@email.com', '$2y$10$abcdefghijklmnopqrstuv', '966555444');

INSERT INTO Metodos_Pago (nombre_metodo) VALUES 
('Tarjeta Credito/Debito'), ('Yape/Plin'), ('Efectivo');

INSERT INTO Descuentos (nombre_descuento, porcentaje, descripcion) VALUES
('BIENVENIDA_RAMEN', 15.00, '15% de descuento automático en tu primera compra'),
('PROMO_ESTUDIANTE', 10.00, '10% de descuento con carné universitario'),
('FIDELIDAD_RAMEN', 20.00, '20% de descuento para clientes frecuentes');

INSERT INTO Categorias (nombre_categoria) VALUES 
('Ramen'), ('Sushi'), ('Arroz Frito'), ('Omelets');


INSERT INTO Productos (id_producto, nombre_producto, descripcion, precio, id_categoria, imagen, disponible) VALUES 
(1, 'Tonkotsu Ramen', 'Caldo de cerdo insignia (18h). Chashu, huevo ajitama, fideos frescos.', 32.00, 1, 'imagenes/ramen/tonkotsu-ramen.jpg', 1),
(2, 'Shoyu Ramen', 'Caldo ligero a base de soya, con pollo, menma y espinaca.', 30.00, 1, 'imagenes/ramen/shoyu-ramen.jpg', 1),
(3, 'Miso Ramen', 'Caldo a base de miso, con maíz, mantequilla y chashu.', 31.00, 1, 'imagenes/ramen/miso-ramen.jpg', 1),
(4, 'Tantanmen (Picante)', 'Caldo cremoso y picante de sésamo con carne de cerdo molida.', 34.00, 1, 'imagenes/ramen/tantanmen.jpg', 1),
(5, 'Veggie Ramen', 'Caldo de vegetales y hongos shiitake, con tofu y verduras de estación.', 29.00, 1, 'imagenes/ramen/veggie-ramen.jpg', 1);


INSERT INTO Productos (id_producto, nombre_producto, descripcion, precio, id_categoria, imagen, disponible) VALUES 
(6, 'Maki Acevichado', 'Relleno de langostino furai y palta, cubierto con atún y salsa acevichada.', 28.00, 2, 'imagenes/sushi/maki-acevichado.jpg', 1),
(7, 'California Roll', 'Clásico roll con palta, kani kama (cangrejo) y pepino, cubierto de sésamo.', 24.00, 2, 'imagenes/sushi/california-roll.jpg', 1),
(8, 'Nigiri Salmón (2u)', 'Cortes frescos de salmón sobre arroz de sushi sazonado.', 12.00, 2, 'imagenes/sushi/nigiri-salmon.jpg', 1),
(9, 'Maki Furai', 'Roll empanizado y frito, relleno de queso crema y salmón.', 26.00, 2, 'imagenes/sushi/maki-furai.jpg', 1),
(10, 'Sashimi Atún (5 cuts)', 'Cortes puros y frescos de atún, servidos con wasabi y kion.', 20.00, 2, 'imagenes/sushi/sashimi-atun.jpg', 1);

INSERT INTO Productos (id_producto, nombre_producto, descripcion, precio, id_categoria, imagen, disponible) VALUES 
(11, 'Chaufa de Pollo', 'Clásico arroz frito con trozos de pollo, tortilla y cebollita china.', 25.00, 3, 'imagenes/arroz/chaufa-de-pollo.png', 1),
(12, 'Chaufa de Mariscos', 'Arroz frito saltado al wok con langostinos, calamar y conchas.', 35.00, 3, 'imagenes/arroz/chaufa-de-mariscos.webp', 1),
(13, 'Chaufa Especial', 'Combinación de pollo, cerdo y langostinos en nuestro arroz frito.', 30.00, 3, 'imagenes/arroz/chaufa-especial.jpg', 1),
(14, 'Yakimeshi', 'Arroz frito japonés con verduras, mantequilla y un toque de soya.', 28.00, 3, 'imagenes/arroz/yakimeshi.jpg', 1),
(15, 'Arroz Vegetariano', 'Arroz frito con hongos, tofu, brócoli y pimientos.', 24.00, 3, 'imagenes/arroz/arroz-vegetariano.webp', 1);

INSERT INTO Productos (id_producto, nombre_producto, descripcion, precio, id_categoria, imagen, disponible) VALUES 
(16, 'Omelet de Cangrejo', 'Tortilla japonesa rellena de pulpa de cangrejo fresca.', 25.00, 4, 'imagenes/omelets/omelet-de-cangrejo.webp', 1),
(17, 'Omurice Clásico', 'Omelet tierno sobre arroz frito, bañado en salsa demiglace.', 27.00, 4, 'imagenes/omelets/omurice-clasico.jpg', 1),
(18, 'Tamagoyaki (Dulce)', 'Clásica tortilla japonesa enrollada con un toque dulce.', 15.00, 4, 'imagenes/omelets/tamagoyaki-dulce.webp', 1),
(19, 'Tortilla de Langostinos', 'Tortilla esponjosa con langostinos y cebollita china.', 29.00, 4, 'imagenes/omelets/tortilla-de-langostinos.jpg', 1),
(20, 'Omelet con Queso', 'Omelet relleno de queso mozzarella derretido.', 20.00, 4, 'imagenes/omelets/omelet-con-queso.jpg', 1);

INSERT INTO Deliveries (id_delivery, id_repartidor, direccion_entrega, estado_envio) VALUES 
(1, 1, 'Av. Los Ficus 456, Santa Anita', 'En camino'),
(2, 2, 'Av. Universitaria 123, San Miguel', 'En camino'),
(3, 1, 'Calle Los Pinos 444, Miraflores', 'Entregado');

INSERT INTO Pedidos (id_pedido, id_cliente, id_delivery, estado_preparacion, tipo_entrega) VALUES 
(1, 1, 1, 'Listo para entregar', 'Delivery');
INSERT INTO Detalle_Pedidos (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES 
(1, 1, 1, 2, 32.00, 64.00), (2, 1, 6, 1, 28.00, 28.00); 
INSERT INTO Modificaciones_Detalle (id_detalle, opcion_elegida, precio_adicional) VALUES 
(1, 'Sin cebollita china', 0.00);
INSERT INTO Checkout_Ordenes (id_pedido, id_metodo, id_descuento, monto_descuento, total_final, estado_pago) VALUES 
(1, 2, 1, 13.80, 78.20, 'Pagado');

INSERT INTO Pedidos (id_pedido, id_cliente, id_delivery, estado_preparacion, tipo_entrega) VALUES 
(2, 2, NULL, 'En cocina', 'Retiro en tienda');
INSERT INTO Detalle_Pedidos (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES 
(3, 2, 2, 1, 30.00, 30.00), (4, 2, 14, 1, 28.00, 28.00); 
INSERT INTO Modificaciones_Detalle (id_detalle, opcion_elegida, precio_adicional) VALUES 
(4, 'Extra tortilla de huevo', 2.00); 
INSERT INTO Checkout_Ordenes (id_pedido, id_metodo, id_descuento, monto_descuento, total_final, estado_pago) VALUES 
(2, 1, NULL, 0.00, 60.00, 'Pagado');

INSERT INTO Pedidos (id_pedido, id_cliente, id_delivery, estado_preparacion, tipo_entrega) VALUES 
(3, 3, 2, 'Listo para entregar', 'Delivery');
INSERT INTO Detalle_Pedidos (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES 
(5, 3, 1, 3, 32.00, 96.00), (6, 3, 10, 2, 20.00, 40.00); 
INSERT INTO Checkout_Ordenes (id_pedido, id_metodo, id_descuento, monto_descuento, total_final, estado_pago) VALUES 
(3, 3, 1, 20.40, 115.60, 'Pagado');

INSERT INTO Pedidos (id_pedido, id_cliente, id_delivery, estado_preparacion, tipo_entrega) VALUES 
(4, 4, NULL, 'Entregado', 'Retiro en tienda');
INSERT INTO Detalle_Pedidos (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES 
(7, 4, 17, 2, 27.00, 54.00), (8, 4, 12, 1, 35.00, 35.00); 
INSERT INTO Checkout_Ordenes (id_pedido, id_metodo, id_descuento, monto_descuento, total_final, estado_pago) VALUES 
(4, 2, NULL, 0.00, 89.00, 'Pagado');

INSERT INTO Pedidos (id_pedido, id_cliente, id_delivery, estado_preparacion, tipo_entrega) VALUES 
(5, 1, 3, 'Entregado', 'Delivery');
INSERT INTO Detalle_Pedidos (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES 
(9, 5, 4, 1, 34.00, 34.00); 
INSERT INTO Checkout_Ordenes (id_pedido, id_metodo, id_descuento, monto_descuento, total_final, estado_pago) VALUES 
(5, 1, NULL, 0.00, 34.00, 'Pagado');

