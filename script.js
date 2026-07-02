/* Espera a que todo el HTML esté cargado antes de ejecutar */
document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. ESTADO GLOBAL --- */
    // Carga segura del carrito desde localStorage
    let cart = [];
    try {
        const stored = localStorage.getItem('ramenCart');
        cart = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(cart)) cart = [];
    } catch (e) {
        cart = [];
    }
    let currentProductKey = null; 

    /* --- 2. LÓGICA DEL MENÚ HAMBURGUESA --- */
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('main-nav-menu');
    const navCloseBtn = document.getElementById('nav-close-btn');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => navMenu.classList.add('is-open'));
        
        if (navCloseBtn) {
            navCloseBtn.addEventListener('click', () => navMenu.classList.remove('is-open'));
        }
        
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('is-open');
            });
        });
    }

    /* --- 3. BASE DE DATOS DE PRODUCTOS --- */
    const productData = {
        // RAMEN (id_categoria = 1)
        'ramen-1': { id_producto: 1, id_categoria: 1, title: 'Tonkotsu Ramen', desc: 'Caldo de cerdo insignia (18h). Chashu, huevo ajitama, fideos frescos.', price: 'S/ 32.00', priceNum: 32.00, img: 'imagenes/Tonkotsu Ramen.jpg' },
        'ramen-2': { id_producto: 2, id_categoria: 1, title: 'Shoyu Ramen', desc: 'Caldo ligero a base de soya, con pollo, menma y espinaca.', price: 'S/ 30.00', priceNum: 30.00, img: 'imagenes/Shoyu Ramen.jpg' },
        'ramen-3': { id_producto: 3, id_categoria: 1, title: 'Miso Ramen', desc: 'Caldo a base de miso, con maíz, mantequilla y chashu.', price: 'S/ 31.00', priceNum: 31.00, img: 'imagenes/Miso Ramen.jpg' },
        'ramen-4': { id_producto: 4, id_categoria: 1, title: 'Tantanmen (Picante)', desc: 'Caldo cremoso y picante de sésamo con carne de cerdo molida.', price: 'S/ 34.00', priceNum: 34.00, img: 'imagenes/Tantanmen (Picante).jpg' },
        'ramen-5': { id_producto: 5, id_categoria: 1, title: 'Veggie Ramen', desc: 'Caldo de vegetales y hongos shiitake, con tofu y verduras de estación.', price: 'S/ 29.00', priceNum: 29.00, img: 'imagenes/Veggie Ramen.jpg' },
        // SUSHI (id_categoria = 2)
        'sushi-1': { id_producto: 6, id_categoria: 2, title: 'Maki Acevichado', desc: 'Relleno de langostino furai y palta, cubierto con atún y salsa acevichada.', price: 'S/ 28.00', priceNum: 28.00, img: 'imagenes/makis-acevichados.jpg' },
        'sushi-2': { id_producto: 7, id_categoria: 2, title: 'California Roll', desc: 'Clásico roll con palta, kani kama (cangrejo) y pepino, cubierto de sésamo.', price: 'S/ 24.00', priceNum: 24.00, img: 'imagenes/California-rolls.jpg' },
        'sushi-3': { id_producto: 8, id_categoria: 2, title: 'Nigiri Salmón (2u)', desc: 'Cortes frescos de salmón sobre arroz de sushi sazonado.', price: 'S/ 12.00', priceNum: 12.00, img: 'imagenes/Nigiri Salmón .jpg' },
        'sushi-4': { id_producto: 9, id_categoria: 2, title: 'Maki Furai', desc: 'Roll empanizado y frito, relleno de queso crema y salmón.', price: 'S/ 26.00', priceNum: 26.00, img: 'imagenes/Maki Furai.jpg' },
        'sushi-5': { id_producto: 10, id_categoria: 2, title: 'Sashimi Atún (5 cortes)', desc: 'Cortes puros y frescos de atún, servidos con wasabi y kion.', price: 'S/ 20.00', priceNum: 20.00, img: 'imagenes/Sashimi Atún.jpg' },
        // ARROZ FRITO (id_categoria = 3)
        'arroz-1': { id_producto: 11, id_categoria: 3, title: 'Chaufa de Pollo', desc: 'Clásico arroz frito con trozos de pollo, tortilla y cebollita china.', price: 'S/ 25.00', priceNum: 25.00, img: 'imagenes/Chaufa de Pollo.png' },
        'arroz-2': { id_producto: 12, id_categoria: 3, title: 'Chaufa de Mariscos', desc: 'Arroz frito saltado al wok con langostinos, calamar y conchas.', price: 'S/ 35.00', priceNum: 35.00, img: 'imagenes/Chaufa de Mariscos.webp' },
        'arroz-3': { id_producto: 13, id_categoria: 3, title: 'Chaufa Especial', desc: 'Combinación de pollo, cerdo y langostinos en nuestro arroz frito.', price: 'S/ 30.00', priceNum: 30.00, img: 'imagenes/Chaufa Especial.jpg' },
        'arroz-4': { id_producto: 14, id_categoria: 3, title: 'Yakimeshi', desc: 'Arroz frito japonés con verduras, mantequilla y un toque de soya.', price: 'S/ 28.00', priceNum: 28.00, img: 'imagenes/Yakimeshi.jpg' },
        'arroz-5': { id_producto: 15, id_categoria: 3, title: 'Arroz Vegetariano', desc: 'Arroz frito con hongos, tofu, brócoli y pimientos.', price: 'S/ 24.00', priceNum: 24.00, img: 'imagenes/Arroz Vegetariano.webp' },
        // OMELETS (id_categoria = 4)
        'omelet-1': { id_producto: 16, id_categoria: 4, title: 'Omelet de Cangrejo', desc: 'Tortilla japonesa rellena de pulpa de cangrejo fresca.', price: 'S/ 25.00', priceNum: 25.00, img: 'imagenes/Omelet de Cangrejo.webp' },
        'omelet-2': { id_producto: 17, id_categoria: 4, title: 'Omurice Clásico', desc: 'Omelet tierno sobre arroz frito, bañado en salsa demiglace.', price: 'S/ 27.00', priceNum: 27.00, img: 'imagenes/Omurice Clasico.jpg' },
        'omelet-3': { id_producto: 18, id_categoria: 4, title: 'Tamagoyaki (Dulce)', desc: 'Clásica tortilla japonesa enrollada con un toque dulce.', price: 'S/ 15.00', priceNum: 15.00, img: 'imagenes/Tamagoyaki (Dulce).webp' },
        'omelet-4': { id_producto: 19, id_categoria: 4, title: 'Tortilla de Langostinos', desc: 'Tortilla esponjosa con langostinos y cebollita china.', price: 'S/ 29.00', priceNum: 29.00, img: 'imagenes/Tortilla de Langostinos.jpg' },
        'omelet-5': { id_producto: 20, id_categoria: 4, title: 'Omelet con Queso', desc: 'Omelet relleno de queso mozzarella derretido.', price: 'S/ 20.00', priceNum: 20.00, img: 'imagenes/Omelet con Queso.jpg' }
    };

    /* --- 4. MODAL DE BÚSQUEDA NEÓN Y GLOBAL --- */
    const searchBtn = document.getElementById('search-btn'); 
    const searchModal = document.getElementById('search-modal');
    const searchCloseBtn = document.getElementById('search-close-btn');
    const neonInputWrapper = document.querySelector('.input-wrapper');
    const neonSearchInput = document.getElementById('neon-search-input');
    const neonSearchBtn = document.getElementById('neon-search-btn');
    
    let currentDuration = 4000; 
    let targetDuration = 4000;
    let animationFrame = null;
    let isTyping = false;

    if (searchBtn && searchModal) {
        searchBtn.addEventListener('click', () => {
            searchModal.classList.add('is-visible');
            if (neonSearchInput) setTimeout(() => neonSearchInput.focus(), 100);
        });
    }
    
    if (searchCloseBtn && searchModal) {
        searchCloseBtn.addEventListener('click', () => searchModal.classList.remove('is-visible'));
    }
    
    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if(e.target === searchModal) searchModal.classList.remove('is-visible');
        });
    }

    function smoothTransition() {
        const diff = targetDuration - currentDuration;
        if (Math.abs(diff) > 10) {
            currentDuration += diff * 0.015;
            if(neonInputWrapper) neonInputWrapper.style.setProperty('--spin-duration', `${currentDuration}ms`);
            animationFrame = requestAnimationFrame(smoothTransition);
        } else {
            currentDuration = targetDuration;
            if(neonInputWrapper) neonInputWrapper.style.setProperty('--spin-duration', `${currentDuration}ms`);
            animationFrame = null;
        }
    }

    if (neonSearchInput) {
        neonSearchInput.addEventListener('input', () => {
            if (!isTyping) {
                isTyping = true;
                targetDuration = 1000;
                if (!animationFrame) smoothTransition();
            }
        });

        neonSearchInput.addEventListener('blur', () => {
            isTyping = false;
            targetDuration = 4000;
            if (!animationFrame) smoothTransition();
        });

        neonSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    if (neonSearchBtn) {
        neonSearchBtn.addEventListener('click', performSearch);
    }

    function performSearch() {
        if (!neonSearchInput) return;
        const query = neonSearchInput.value.toLowerCase().trim();
        
        if(query.length > 0) {
            // REDIRECCIÓN GLOBAL A PRODUCTOS.HTML SI NO ESTAMOS AHÍ
            if (!window.location.pathname.endsWith('productos.html')) {
                window.location.href = `productos.html?buscar=${encodeURIComponent(query)}`;
                return;
            }

            targetDuration = 200; 
            if (!animationFrame) smoothTransition();   
            if (neonSearchBtn) neonSearchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            setTimeout(() => {
                const foundProducts = Object.values(productData).filter(product => 
                    product.title.toLowerCase().includes(query) || 
                    product.desc.toLowerCase().includes(query)
                );

                if (searchModal) searchModal.classList.remove('is-visible');
                neonSearchInput.value = ''; 
                
                if (neonSearchBtn) {
                    neonSearchBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="8" stroke="#ffffff" stroke-width="2" />
                            <line x1="16.65" y1="16.65" x2="22" y2="22" stroke="#ffffff" stroke-width="2" />
                        </svg>`;
                }
                targetDuration = 4000;

                if (foundProducts.length > 0) {
                    const nombres = foundProducts.map(p => p.title).join(", ");
                    alert(`✅ ¡SÍ TENEMOS!\n\nEncontramos:\n${nombres}`);
                } else {
                    alert(`❌ Ups, no encontramos "${query}".\n\nIntenta buscar: Ramen, Sushi, Arroz...`);
                }
            }, 1000); 
        }
    }

    // AUTO-BÚSQUEDA SI HAY PARÁMETRO EN LA URL
    if (window.location.pathname.endsWith('productos.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const buscarParam = urlParams.get('buscar');
        if (buscarParam && searchModal && neonSearchInput) {
            searchModal.classList.add('is-visible');
            neonSearchInput.value = buscarParam;
            performSearch();
        }
    }

    /* --- 5. LOGIN/REGISTRO --- */
    const loginModalBtn = document.getElementById('login-modal-btn');
    const loginModal = document.getElementById('login-modal');
    const loginModalCloseBtn = document.getElementById('login-modal-close-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterFormBtn = document.getElementById('show-register-form');
    const showLoginFormBtn = document.getElementById('show-login-form');

    function openLoginModal() {
        if(loginModal) {
            loginModal.classList.add('is-visible');
            if(loginForm) loginForm.classList.add('active');
            if(registerForm) registerForm.classList.remove('active');
        }
    }
    
    if(loginModalBtn) loginModalBtn.addEventListener('click', openLoginModal);
    if(mobileLoginBtn) mobileLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openLoginModal();
    }); 
    
    if(loginModalCloseBtn && loginModal) {
        loginModalCloseBtn.addEventListener('click', () => loginModal.classList.remove('is-visible'));
    }

    if(showRegisterFormBtn && loginForm && registerForm) {
        showRegisterFormBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        });
    }
    
    if(showLoginFormBtn && loginForm && registerForm) {
        showLoginFormBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
        });
    }

    if(loginForm && loginModal) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Has iniciado sesión correctamente.');
            loginModal.classList.remove('is-visible');
        });
    }

    /* --- 6. MODAL DE PRODUCTO --- */
    const productCards = document.querySelectorAll('.product-card');
    const productModal = document.getElementById('product-modal');
    const productModalCloseBtn = document.getElementById('product-modal-close-btn');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalPrice = document.getElementById('modal-price');
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    function openProductModal(productKey) {
        const product = productData[productKey];
        if (product) {
            currentProductKey = productKey;
            if(modalImg) modalImg.src = product.img;
            if(modalTitle) modalTitle.textContent = product.title;
            if(modalDesc) modalDesc.textContent = product.desc;
            if(modalPrice) modalPrice.textContent = product.price;
            if(productModal) productModal.classList.add('is-visible');
        }
    }

    if(productCards.length > 0) {
        productCards.forEach(card => {
            card.addEventListener('click', () => {
                const productKey = card.dataset.product; 
                if(productKey) openProductModal(productKey);
            });
        });
    }
    
    if(productModalCloseBtn && productModal) {
        productModalCloseBtn.addEventListener('click', () => {
            productModal.classList.remove('is-visible');
            currentProductKey = null;
        });
    }

    /* --- 7. LÓGICA DEL CARRITO (CORE) --- */
    const cartBtn = document.getElementById('cart-btn');
    const cartCount = document.getElementById('cart-count');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutCloseBtn = document.getElementById('checkout-close-btn');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotal = document.getElementById('cart-total');
    
    function addToCart() {
        if (!currentProductKey) return; 
        const product = productData[currentProductKey];
        if (!product) return;
        const existingItem = cart.find(item => item.id === currentProductKey);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: currentProductKey,
                id_producto: product.id_producto,
                id_categoria: product.id_categoria,
                title: product.title,
                price: product.priceNum,
                img: product.img,
                quantity: 1
            });
        }
        updateCartUI();
        if(productModal) productModal.classList.remove('is-visible');
        alert('¡Agregado al carrito! 🍜');
    }

    // Sumar 1 unidad a un plato existente
    window.addMoreToCart = function(productId) {
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.quantity += 1;
            updateCartUI();
        }
    }

    // Restar 1 unidad o eliminar si es la última
    window.removeFromCart = function(productId) { 
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return;
        
        const item = cart[itemIndex];
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
        updateCartUI();
    }

    // GENERADOR DE MODIFICADORES PREMIUM Y NOTA LIBRE
    function getModifierHTML(item) {
        let options = '';
        if (item.id_categoria === 1) { // Ramen
            options = `
                <option value="">Ninguna</option>
                <option value="Agregar ajo frito">Agregar ajo frito</option>
                <option value="Extra mantequilla">Extra mantequilla</option>
                <option value="Salsa picante (Chili crisp)">Salsa picante (Chili crisp)</option>
                <option value="Estilo seco (sin caldo)">Estilo seco (sin caldo)</option>
                <option value="Sin cebollita china">Sin cebollita china</option>`;
        } else if (item.id_categoria === 2) { // Sushi
            options = `
                <option value="">Ninguna</option>
                <option value="Sin wasabi">Sin wasabi</option>
                <option value="Sin kion">Sin kion</option>
                <option value="Extra salsa acevichada">Extra salsa acevichada</option>
                <option value="Salsa de soya extra">Salsa de soya extra</option>`;
        } else if (item.id_categoria === 3) { // Arroz Frito
            options = `
                <option value="">Ninguna</option>
                <option value="Extra tortilla de huevo">Extra tortilla de huevo</option>
                <option value="Sin cebollita china">Sin cebollita china</option>`;
        } else if (item.id_categoria === 4) { // Omelets
            options = `
                <option value="">Ninguna</option>
                <option value="Extra salsa demiglace">Extra salsa demiglace</option>
                <option value="Sin kétchup">Sin kétchup</option>`;
        } else {
            options = `<option value="">Ninguna</option>`;
        }

        return `
            <select class="cart-modifier select-mod" data-item-id="${item.id}">
                ${options}
            </select>
            <input type="text" class="cart-modifier input-note" data-item-id="${item.id}" 
                   placeholder="Observaciones (Ej: sin cubiertos, alergia al maní...)" maxlength="150">`;
    }

    function updateCartUI() {   
        if(!cartCount || !cartItemsList || !cartTotal) return;

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartItemsList.innerHTML = '';

        try {
            localStorage.setItem('ramenCart', JSON.stringify(cart));
        } catch (e) {
            console.warn('No se pudo guardar el carrito en localStorage');
        }
        
        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <div class="empty-cart-msg">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Tu canasta está vacía</p>
                </div>`;
            cartTotal.textContent = 'S/ 0.00';
            return;
        }

        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            
            const itemHTML = `
                <div class="modern-cart-item">
                    <div class="item-img">
                        <img src="${item.img}" alt="${item.title}">
                    </div>
                    <div class="item-info">
                        <h4>${item.title}</h4>
                        <div class="item-math">
                            <span class="price">S/ ${item.price.toFixed(2)}</span>
                        </div>
                        ${getModifierHTML(item)}
                    </div>
                    <div class="item-right-controls">
                        <div class="item-total">
                            S/ ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div class="qty-controls">
                            <button class="qty-btn qty-minus" onclick="removeFromCart('${item.id}')">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="qty-display">${item.quantity}</span>
                            <button class="qty-btn qty-plus" onclick="addMoreToCart('${item.id}')">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            cartItemsList.innerHTML += itemHTML;
        });
        cartTotal.textContent = `S/ ${total.toFixed(2)}`;
    }

    if(addToCartBtn) addToCartBtn.addEventListener('click', addToCart);
    
    if(cartBtn && checkoutModal) {
        cartBtn.addEventListener('click', () => {
            updateCartUI();
            checkoutModal.classList.add('is-visible');
        });
    }
    
    if(checkoutCloseBtn && checkoutModal) {
        checkoutCloseBtn.addEventListener('click', () => {
            checkoutModal.classList.remove('is-visible');
        });
    }

    /* --- 8. TOGGLE DINÁMICO DE CAMPOS DELIVERY --- */
    const deliveryFields = document.getElementById('delivery-fields');

    document.querySelectorAll('input[name="tipo_entrega"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (!deliveryFields) return;
            if (e.target.value === 'Delivery') {
                deliveryFields.classList.remove('hidden');
            } else {
                deliveryFields.classList.add('hidden');
                const addrInput = document.getElementById('delivery-address');
                const phoneInput = document.getElementById('delivery-phone');
                if (addrInput) addrInput.value = '';
                if (phoneInput) phoneInput.value = '';
            }
        });
    });

    /* --- 9. CONFIRMAR PEDIDO --- */
    const confirmOrderBtn = document.getElementById('confirm-order-btn');

    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('❌ Tu carrito está vacío. Agrega algunos platos primero.');
                return;
            }

            const tipoEntregaRadio = document.querySelector('input[name="tipo_entrega"]:checked');
            if (!tipoEntregaRadio) {
                alert('⚠️ Selecciona un tipo de entrega.');
                return;
            }
            const tipoEntrega = tipoEntregaRadio.value;

            let deliveryData = null;
            if (tipoEntrega === 'Delivery') {
                const direccion = (document.getElementById('delivery-address') || {}).value || '';
                const telefono = (document.getElementById('delivery-phone') || {}).value || '';

                if (direccion.trim().length < 5) {
                    alert('⚠️ Ingresa una dirección válida (mínimo 5 caracteres).');
                    return;
                }
                if (telefono.trim().length < 7) {
                    alert('⚠️ Ingresa un teléfono válido (mínimo 7 dígitos).');
                    return;
                }
                deliveryData = {
                    direccion_entrega: direccion.trim(),
                    telefono: telefono.trim()
                };
            }

            const metodoRadio = document.querySelector('input[name="payment"]:checked');
            const idMetodo = metodoRadio ? parseInt(metodoRadio.value) : 1;
            const metodosNombre = { 1: 'Tarjeta Credito/Debito', 2: 'Yape/Plin', 3: 'Efectivo' };

            // Recolectar ambas modificaciones: select + nota
            const modifierMap = {};
            document.querySelectorAll('.select-mod').forEach(el => {
                const itemId = el.dataset.itemId;
                if (!modifierMap[itemId]) modifierMap[itemId] = { select: '', note: '' };
                if (el.value) modifierMap[itemId].select = el.value.trim();
            });
            document.querySelectorAll('.input-note').forEach(el => {
                const itemId = el.dataset.itemId;
                if (!modifierMap[itemId]) modifierMap[itemId] = { select: '', note: '' };
                if (el.value) modifierMap[itemId].note = el.value.trim();
            });

            let totalFinal = 0;

            const detallePedidos = cart.map(item => {
                const subtotal = item.price * item.quantity;
                totalFinal += subtotal;

                const detalle = {
                    id_producto: item.id_producto,
                    nombre: item.title,
                    cantidad: item.quantity,
                    precio_unitario: item.price,
                    subtotal: parseFloat(subtotal.toFixed(2)),
                    modificaciones: []
                };

                const mods = modifierMap[item.id];
                if (mods && (mods.select || mods.note)) {
                    let text = '';
                    if (mods.select && mods.note) text = `${mods.select} | Obs: ${mods.note}`;
                    else if (mods.select) text = mods.select;
                    else text = `Obs: ${mods.note}`;

                    detalle.modificaciones.push({
                        opcion_elegida: text,
                        precio_adicional: 0.00
                    });
                }

                return detalle;
            });

            const payloadPedido = {
                pedido: {
                    tipo_entrega: tipoEntrega,
                    fecha_hora: new Date().toISOString()
                },
                detalle_pedidos: detallePedidos,
                checkout: {
                    id_metodo: idMetodo,
                    nombre_metodo: metodosNombre[idMetodo],
                    total_final: parseFloat(totalFinal.toFixed(2))
                },
                delivery: deliveryData
            };

            console.log('🍜 payloadPedido:', JSON.stringify(payloadPedido, null, 2));
            console.table(payloadPedido.detalle_pedidos);

            const textoOriginal = confirmOrderBtn.innerHTML;
            confirmOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            confirmOrderBtn.disabled = true;

            setTimeout(() => {
                const msgEntrega = tipoEntrega === 'Delivery' 
                    ? `\n📍 Envío a: ${deliveryData.direccion_entrega}`
                    : '\n🏪 Retira tu pedido en tienda';

                alert(`✅ ¡Pedido Confirmado!\n\n💳 Método: ${metodosNombre[idMetodo]}${msgEntrega}\n💰 Total: S/ ${totalFinal.toFixed(2)}\n\n(Revisa la consola para ver el payload completo)`);

                cart = [];
                updateCartUI();
                if(checkoutModal) checkoutModal.classList.remove('is-visible');

                const addrInput = document.getElementById('delivery-address');
                const phoneInput = document.getElementById('delivery-phone');
                if (addrInput) addrInput.value = '';
                if (phoneInput) phoneInput.value = '';

                confirmOrderBtn.innerHTML = textoOriginal;
                confirmOrderBtn.disabled = false;
            }, 1500);
        });
    }

    /* --- 10. CIERRE GLOBAL DE MODALES --- */
    [productModal, checkoutModal, loginModal].forEach(modal => {
        if(modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('is-visible');
            });
        }
    });

    /* --- 11. ANIMACIÓN FADE-IN AL SCROLL --- */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    /* --- 12. SMOOTH SCROLL --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.length > 1) { 
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    /* --- 13. LÓGICA DEL FORMULARIO DE CONTACTO --- */
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const btn = contactForm.querySelector('button');
            const originalText = btn ? btn.innerHTML : 'Enviar';
            if (btn) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
                btn.disabled = true;
            }

            setTimeout(() => {
                alert("✅ ¡Mensaje Enviado!\n\nGracias por escribirnos. Te responderemos pronto.");
                contactForm.reset(); 
                if (btn) {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            }, 2000);
        });
    }

    // Carga inicial del carrito
    updateCartUI();

}); // Fin del script