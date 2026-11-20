// Seeder 02: los 20 platos base (mismos nombres, precios e imágenes) más 4 combos en promoción.
/** @param {import('knex').Knex} knex */

// Ids de los platos más consumidos (según el historial de pedidos) y de las recomendaciones del Itamae.
const MAS_VENDIDOS = [1, 4, 6, 7, 13, 17];
const RECOMENDADOS = [3, 9, 10, 12, 14, 16];

// Cada fila: id, nombre, descripción, precio, categoría, imagen, historia, ingredientes.
const PLATOS = [
  [1, 'Tonkotsu Ramen', 'Caldo de cerdo insignia (18h). Chashu, huevo ajitama, fideos frescos.', 32, 1, 'imagenes/ramen/tonkotsu-ramen.jpg',
    'Nacido en Fukuoka, el tonkotsu es un caldo opaco que se logra hirviendo huesos de cerdo durante horas hasta liberar su colágeno. En nuestra cocina lo trabajamos 18 horas a fuego constante.',
    ['Caldo de huesos de cerdo', 'Chashu glaseado', 'Huevo ajitama', 'Fideos frescos', 'Cebollita china', 'Nori']],
  [2, 'Shoyu Ramen', 'Caldo ligero a base de soya, con pollo, menma y espinaca.', 30, 1, 'imagenes/ramen/shoyu-ramen.jpg',
    'El shoyu es el ramen más antiguo de Tokio: un caldo transparente de pollo y algas sazonado con salsa de soya. Un plato limpio, de sabor profundo y final ligero.',
    ['Caldo de pollo y kombu', 'Salsa shoyu', 'Pollo', 'Menma', 'Espinaca', 'Fideos finos']],
  [3, 'Miso Ramen', 'Caldo a base de miso, con maíz, mantequilla y chashu.', 31, 1, 'imagenes/ramen/miso-ramen.jpg',
    'Creado en Sapporo para resistir el frío de Hokkaido, el miso ramen combina pasta de soya fermentada con maíz dulce y mantequilla. Es el abrigo hecho plato.',
    ['Pasta de miso', 'Chashu', 'Maíz dulce', 'Mantequilla', 'Brotes de soya', 'Fideos ondulados']],
  [4, 'Tantanmen (Picante)', 'Caldo cremoso y picante de sésamo con carne de cerdo molida.', 34, 1, 'imagenes/ramen/tantanmen.jpg',
    'Adaptación japonesa del dan dan mian de Sichuan. Un caldo cremoso de sésamo y aceite de ají, con carne de cerdo salteada, para quienes buscan intensidad.',
    ['Pasta de sésamo', 'Aceite de ají', 'Cerdo molido', 'Pak choi', 'Cebollita china', 'Fideos frescos']],
  [5, 'Veggie Ramen', 'Caldo de vegetales y hongos shiitake, con tofu y verduras de estación.', 29, 1, 'imagenes/ramen/veggie-ramen.jpg',
    'Inspirado en la cocina shojin de los templos budistas: un dashi de kombu y shiitake que logra profundidad sin ingredientes de origen animal.',
    ['Dashi de kombu y shiitake', 'Tofu firme', 'Hongos shiitake', 'Verduras de estación', 'Fideos frescos']],
  [6, 'Maki Acevichado', 'Relleno de langostino furai y palta, cubierto con atún y salsa acevichada.', 28, 2, 'imagenes/sushi/maki-acevichado.jpg',
    'El maki más nikkei de la carta: la técnica del sushi encuentra al ceviche limeño. La salsa acevichada, cremosa y cítrica, es la firma de los inmigrantes japoneses en el Perú.',
    ['Langostino furai', 'Palta', 'Atún fresco', 'Salsa acevichada', 'Arroz de sushi', 'Alga nori']],
  [7, 'California Roll', 'Clásico roll con palta, kani kama (cangrejo) y pepino, cubierto de sésamo.', 24, 2, 'imagenes/sushi/california-roll.jpg',
    'Nació en Los Ángeles con el arroz por fuera para que el alga no intimidara a los comensales. Hoy es el primer paso hacia el sushi.',
    ['Kani kama', 'Palta', 'Pepino', 'Sésamo tostado', 'Arroz de sushi', 'Alga nori']],
  [8, 'Nigiri Salmón (2u)', 'Cortes frescos de salmón sobre arroz de sushi sazonado.', 12, 2, 'imagenes/sushi/nigiri-salmon.jpg',
    'El nigiri es la expresión más pura del sushi: pescado fresco, arroz tibio y un toque de wasabi. Aquí no hay nada que esconder.',
    ['Salmón fresco', 'Arroz de sushi', 'Wasabi', 'Salsa de soya']],
  [9, 'Maki Furai', 'Roll empanizado y frito, relleno de queso crema y salmón.', 26, 2, 'imagenes/sushi/maki-furai.jpg',
    'El furai (frito en japonés) añade a la tradición del maki una cobertura de panko crujiente. Contraste de texturas: crocante por fuera, cremoso por dentro.',
    ['Salmón', 'Queso crema', 'Panko', 'Arroz de sushi', 'Salsa tare']],
  [10, 'Sashimi Atún (5 cuts)', 'Cortes puros y frescos de atún, servidos con wasabi y kion.', 20, 2, 'imagenes/sushi/sashimi-atun.jpg',
    'El sashimi es el arte del corte: cada lámina se hace de un solo movimiento para no dañar la fibra. Atún fresco, sin arroz, con kion y wasabi.',
    ['Atún fresco', 'Wasabi', 'Kion encurtido', 'Rábano daikon']],
  [11, 'Chaufa de Pollo', 'Clásico arroz frito con trozos de pollo, tortilla y cebollita china.', 25, 3, 'imagenes/arroz/chaufa-de-pollo.png',
    'El chaufa llegó con la inmigración cantonesa y se volvió plato peruano. Salteado a fuego muy alto en wok, conserva el aroma ahumado del "wok hei".',
    ['Arroz graneado', 'Pollo', 'Tortilla de huevo', 'Cebollita china', 'Salsa de soya', 'Kion']],
  [12, 'Chaufa de Mariscos', 'Arroz frito saltado al wok con langostinos, calamar y conchas.', 35, 3, 'imagenes/arroz/chaufa-de-mariscos.webp',
    'La versión costeña del chaufa: los mariscos del Pacífico saltean junto al arroz en un wok ardiente, con un toque de ají amarillo.',
    ['Langostinos', 'Calamar', 'Conchas', 'Arroz graneado', 'Ají amarillo', 'Cebollita china']],
  [13, 'Chaufa Especial', 'Combinación de pollo, cerdo y langostinos en nuestro arroz frito.', 30, 3, 'imagenes/arroz/chaufa-especial.jpg',
    'El chaufa de las grandes ocasiones: tres proteínas en un solo wok. Equilibrio entre la dulzura del cerdo, el pollo jugoso y el langostino.',
    ['Pollo', 'Cerdo asado', 'Langostinos', 'Arroz graneado', 'Tortilla', 'Salsa de soya']],
  [14, 'Yakimeshi', 'Arroz frito japonés con verduras, mantequilla y un toque de soya.', 28, 3, 'imagenes/arroz/yakimeshi.jpg',
    'El arroz frito de las casas japonesas: más suave que el chaufa, con mantequilla y soya. Un plato de hogar, sencillo y reconfortante.',
    ['Arroz japonés', 'Mantequilla', 'Zanahoria', 'Arvejas', 'Huevo', 'Salsa de soya']],
  [15, 'Arroz Vegetariano', 'Arroz frito con hongos, tofu, brócoli y pimientos.', 24, 3, 'imagenes/arroz/arroz-vegetariano.webp',
    'Un wok lleno de color: tofu dorado, hongos y verduras crocantes sobre arroz suelto. Sabor completo sin carne.',
    ['Tofu', 'Hongos', 'Brócoli', 'Pimientos', 'Arroz graneado', 'Salsa de soya']],
  [16, 'Omelet de Cangrejo', 'Tortilla japonesa rellena de pulpa de cangrejo fresca.', 25, 4, 'imagenes/omelets/omelet-de-cangrejo.webp',
    'Inspirado en el kani tamago de las casas de té de Osaka: una tortilla delicada, apenas cuajada, rellena de cangrejo dulce.',
    ['Huevo', 'Pulpa de cangrejo', 'Cebollita china', 'Mirin', 'Salsa dashi']],
  [17, 'Omurice Clásico', 'Omelet tierno sobre arroz frito, bañado en salsa demiglace.', 27, 4, 'imagenes/omelets/omurice-clasico.jpg',
    'Omurice, de "omelet" y "rice": invento de Tokio de principios del siglo XX que se volvió el plato favorito de la infancia japonesa.',
    ['Huevo', 'Arroz frito', 'Pollo', 'Salsa demiglace', 'Cebolla']],
  [18, 'Tamagoyaki (Dulce)', 'Clásica tortilla japonesa enrollada con un toque dulce.', 15, 4, 'imagenes/omelets/tamagoyaki-dulce.webp',
    'Cada capa se dobla a mano en una sartén rectangular. En Japón se dice que el tamagoyaki mide la maestría de un cocinero de sushi.',
    ['Huevo', 'Mirin', 'Azúcar', 'Dashi', 'Salsa de soya']],
  [19, 'Tortilla de Langostinos', 'Tortilla esponjosa con langostinos y cebollita china.', 29, 4, 'imagenes/omelets/tortilla-de-langostinos.jpg',
    'Una tortilla esponjosa de estilo nikkei: langostinos salteados con cebollita china y un toque de ají amarillo.',
    ['Huevo', 'Langostinos', 'Cebollita china', 'Ají amarillo', 'Salsa de soya']],
  [20, 'Omelet con Queso', 'Omelet relleno de queso mozzarella derretido.', 20, 4, 'imagenes/omelets/omelet-con-queso.jpg',
    'La versión más cremosa de la carta: un omelet suave que esconde mozzarella derretida, ideal para quien empieza en la cocina japonesa.',
    ['Huevo', 'Queso mozzarella', 'Mantequilla', 'Cebollita china']],
];

// Combos en promoción: precio normal (suma de platos) y precio de oferta.
const COMBOS = [
  [21, 'Combo Tonkotsu Dúo', '2 Tonkotsu Ramen y 1 Tamagoyaki dulce para compartir.', 79, 67, 'imagenes/ramen/tonkotsu-ramen.jpg',
    'Pensado para compartir la mesa: dos tazones de nuestro caldo de 18 horas y un tamagoyaki dulce para cerrar.',
    ['2 Tonkotsu Ramen', '1 Tamagoyaki dulce']],
  [22, 'Combo Nikkei Sushi', 'Maki Acevichado, California Roll y Nigiri de Salmón (2u).', 64, 54, 'imagenes/hero/hero-sushi.jpeg',
    'Un recorrido por el sushi de la casa: el maki acevichado de firma nikkei, el clásico californiano y el nigiri más puro.',
    ['Maki Acevichado', 'California Roll', 'Nigiri Salmón (2u)']],
  [23, 'Combo Chaufa Wok', 'Chaufa Especial y Omelet de Cangrejo.', 55, 46, 'imagenes/hero/hero-arroz.jpeg',
    'El wok y la sartén japonesa en una sola mesa: el arroz frito más completo con un omelet de cangrejo delicado.',
    ['Chaufa Especial', 'Omelet de Cangrejo']],
  [24, 'Combo Itamae para Dos', 'Shoyu Ramen, Miso Ramen y Maki Furai.', 87, 74, 'imagenes/ramen/miso-ramen.jpg',
    'La selección del Itamae: dos caldos de carácter opuesto, uno ligero y otro profundo, y un maki furai crujiente.',
    ['Shoyu Ramen', 'Miso Ramen', 'Maki Furai']],
];

exports.seed = async function (knex) {
  const filas = PLATOS.map(([id, nombre, descripcion, precio, categoria, imagen, historia, ingredientes]) => ({
    id_producto: id,
    nombre_producto: nombre,
    descripcion,
    precio,
    id_categoria: categoria,
    imagen,
    disponible: 1,
    es_mas_vendido: MAS_VENDIDOS.includes(id),
    es_recomendado: RECOMENDADOS.includes(id),
    precio_oferta: null,
    historia,
    ingredientes: JSON.stringify(ingredientes), // columna JSON: se guarda como texto
  }));

  // Los combos van en la categoría 5 y llevan precio_oferta.
  for (const [id, nombre, descripcion, precio, oferta, imagen, historia, ingredientes] of COMBOS) {
    filas.push({
      id_producto: id,
      nombre_producto: nombre,
      descripcion,
      precio,
      id_categoria: 5,
      imagen,
      disponible: 1,
      es_mas_vendido: false,
      es_recomendado: false,
      precio_oferta: oferta,
      historia,
      ingredientes: JSON.stringify(ingredientes),
    });
  }

  // Upsert por id: reejecutar el seeder actualiza sin duplicar.
  await knex('Productos').insert(filas).onConflict('id_producto').merge();
};
