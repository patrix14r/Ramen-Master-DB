document.addEventListener('DOMContentLoaded', () => {


    let cart = [];
    try {
        const stored = localStorage.getItem('ramen_master_cart');
        cart = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(cart)) cart = [];
    } catch (e) { cart = []; }

    let currentProduct = null;
    let productData = {};
    let pendingCheckout = false;

    // Helper: guardar carrito en localStorage
    function saveCart() {
        try { localStorage.setItem('ramen_master_cart', JSON.stringify(cart)); } catch (e) {}
    }


    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('main-nav-menu');
    const navCloseBtn = document.getElementById('nav-close-btn');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => navMenu.classList.add('is-open'));
        if (navCloseBtn) navCloseBtn.addEventListener('click', () => navMenu.classList.remove('is-open'));
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => navMenu.classList.remove('is-open'));
        });
    }


    async function cargarProductos() {
        const container = document.getElementById('productos-container');
        if (!container) return;

        try {
            const res = await fetch('api_productos.php');
            if (!res.ok) throw new Error('Error del servidor');
            const productos = await res.json();
            if (productos.error) throw new Error(productos.error);

            productData = {};
            const categorias = {};

            productos.forEach(p => {
                const key = `prod-${p.id_producto}`;
                let rawImg = p.imagen || p.nombre;
                let finalImg = rawImg.startsWith('imagenes/') ? rawImg : `imagenes/${rawImg}${rawImg.includes('.') ? '' : '.jpg'}`;
                
                productData[key] = {
                    id_producto: parseInt(p.id_producto),
                    id_categoria: parseInt(p.id_categoria),
                    title: p.nombre,
                    desc: p.descripcion || '',
                    price: `S/ ${parseFloat(p.precio).toFixed(2)}`,
                    priceNum: parseFloat(p.precio),
                    img: finalImg,
                    categoria: p.categoria_nombre
                };
                if (!categorias[p.id_categoria]) {
                    categorias[p.id_categoria] = { nombre: p.categoria_nombre, productos: [] };
                }
                categorias[p.id_categoria].productos.push(key);
            });

            container.innerHTML = '';
            const catAnchors = { '1': 'menu-ramen', '2': 'menu-sushi', '3': 'menu-arroz', '4': 'menu-omelets' };

            Object.keys(categorias).forEach(catId => {
                const cat = categorias[catId];
                const anchor = catAnchors[catId] || `menu-cat-${catId}`;

                const h3 = document.createElement('h3');
                h3.className = 'fade-in';
                h3.id = anchor;
                h3.textContent = cat.nombre.toUpperCase();
                container.appendChild(h3);

                const grid = document.createElement('div');
                grid.className = 'product-grid';

                cat.productos.forEach(key => {
                    const p = productData[key];
                    const card = document.createElement('div');
                    card.className = 'product-card fade-in';
                    card.dataset.product = key;
                    card.innerHTML = `
                        <img src="${p.img}" alt="${p.title}" onerror="this.onerror=null; this.src='imagenes/default_plato.jpg';">
                        <div class="product-info">
                            <h4>${p.title}</h4>
                            <span class="product-price">${p.price}</span>
                        </div>`;
                    card.addEventListener('click', () => openProductModal(key));
                    grid.appendChild(card);
                });

                container.appendChild(grid);
            });

            initFadeObserver();
            handleSearchParam();

        } catch (err) {
            console.error('Error cargando productos:', err);
            // Muestra mensaje y botón de reintento si falla conexión al servidor PHP
            container.innerHTML = `
                <div class="product-loading" style="display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; padding: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: #ff4b2b;"></i>
                    <p style="margin: 0; max-width: 400px; line-height: 1.4;">No se pudo conectar con el catálogo. Verifica que el servidor PHP y MySQL estén activos.</p>
                    <button onclick="window.location.reload()" style="margin-top: 10px; background: linear-gradient(90deg, #ff4b2b, #ff416c); color: #fff; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-family: 'Alatsi', sans-serif; box-shadow: 0 4px 15px rgba(255, 75, 43, 0.3); font-size: 1rem;">Reintentar</button>
                </div>`;
        }
    }

    function initFadeObserver() {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
    }

    if (document.getElementById('productos-container')) {
        cargarProductos();
    } else {
        initFadeObserver();
    }

    /* ============================================================
       4. BUSCADOR
       ============================================================ */
    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const searchCloseBtn = document.getElementById('search-close-btn');
    const neonInputWrapper = document.querySelector('.input-wrapper');
    const neonSearchInput = document.getElementById('neon-search-input');
    const neonSearchBtn = document.getElementById('neon-search-btn');

    function performSearch() {
        if (!neonSearchInput) return;
        const query = neonSearchInput.value.trim().toLowerCase();
        if (!query) return;
        if (searchModal) searchModal.classList.remove('is-visible');
        if (!document.getElementById('productos-container')) {
            window.location.href = `productos.html?search=${encodeURIComponent(query)}`;
            return;
        }
        filterProducts(query);
    }

    function filterProducts(query) {
        document.querySelectorAll('.product-card').forEach(card => {
            const name = card.querySelector('h4')?.textContent?.toLowerCase() || '';
            card.style.display = name.includes(query) ? '' : 'none';
        });
    }

    function handleSearchParam() {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('search');
        if (q) filterProducts(q.toLowerCase());
    }

    if (searchBtn && searchModal) {
        searchBtn.addEventListener('click', () => {
            searchModal.classList.add('is-visible');
            if (neonSearchInput) { neonSearchInput.value = ''; neonSearchInput.focus(); }
        });
    }
    if (searchCloseBtn && searchModal) {
        searchCloseBtn.addEventListener('click', () => searchModal.classList.remove('is-visible'));
    }
    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) searchModal.classList.remove('is-visible');
        });
    }
    if (neonInputWrapper && neonSearchInput) {
        neonSearchInput.addEventListener('input', () => {
            neonInputWrapper.classList.toggle('has-text', neonSearchInput.value.length > 0);
        });
        neonSearchInput.addEventListener('blur', () => {
            neonInputWrapper.classList.toggle('has-text', neonSearchInput.value.length > 0);
        });
        neonSearchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
    }
    if (neonSearchBtn) neonSearchBtn.addEventListener('click', performSearch);
    if (!document.getElementById('productos-container')) handleSearchParam();

    /* ============================================================
       5. AUTENTICACIÓN
       ============================================================ */
    const loginModalBtn = document.getElementById('login-modal-btn');
    const loginModal = document.getElementById('login-modal');
    const loginModalCloseBtn = document.getElementById('login-modal-close-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const recoverForm = document.getElementById('recover-form');
    const showRegisterFormBtn = document.getElementById('show-register-form');
    const showLoginFormBtn = document.getElementById('show-login-form');
    const showRecoverFormBtn = document.getElementById('show-recover-form');
    const showLoginFromRecoverBtn = document.getElementById('show-login-from-recover');

    function showFormOnly(formId) {
        [loginForm, registerForm, recoverForm].forEach(f => { if (f) f.classList.remove('active'); });
        const el = document.getElementById(formId);
        if (el) el.classList.add('active');
    }

    function showAuthMsg(msgId, text, type) {
        const el = document.getElementById(msgId);
        if (!el) return;
        el.textContent = text;
        el.className = `auth-msg ${type}`;
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 5000);
    }

    function openLoginModal() {
        if (loginModal) {
            loginModal.classList.add('is-visible');
            showFormOnly('login-form');
        }
    }

    if (loginModalBtn) {
        loginModalBtn.addEventListener('click', () => {
            const session = localStorage.getItem('ramen_user_session');
            if (session) { toggleUserMenu(); } else { openLoginModal(); }
        });
    }
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', (e) => { e.preventDefault(); openLoginModal(); });
    if (loginModalCloseBtn && loginModal) {
        loginModalCloseBtn.addEventListener('click', () => loginModal.classList.remove('is-visible'));
    }
    if (showRegisterFormBtn) showRegisterFormBtn.addEventListener('click', (e) => { e.preventDefault(); showFormOnly('register-form'); });
    if (showLoginFormBtn) showLoginFormBtn.addEventListener('click', (e) => { e.preventDefault(); showFormOnly('login-form'); });
    if (showRecoverFormBtn) showRecoverFormBtn.addEventListener('click', (e) => { e.preventDefault(); showFormOnly('recover-form'); });
    if (showLoginFromRecoverBtn) showLoginFromRecoverBtn.addEventListener('click', (e) => { e.preventDefault(); showFormOnly('login-form'); });

    // Login submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email')?.value?.trim();
            const pass = document.getElementById('login-pass')?.value;
            if (!email || !pass) return;
            const btn = loginForm.querySelector('button[type="submit"]');
            if (btn) { btn.disabled = true; btn.textContent = 'Ingresando...'; }
            try {
                const res = await fetch('api_auth.php?action=login', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password: pass })
                });
                const data = await res.json();
                if (data.success) {
                    localStorage.setItem('ramen_user_session', JSON.stringify(data.cliente));
                    updateLoginButton(data.cliente);
                    if (loginModal) loginModal.classList.remove('is-visible');
                    loginForm.reset();
                    updateCartUI(); // recalcular descuento
                    if (pendingCheckout) { pendingCheckout = false; executeCheckout(); }
                } else {
                    showAuthMsg('login-msg', data.error || 'Credenciales incorrectas', 'error');
                }
            } catch (err) {
                showAuthMsg('login-msg', 'Error de conexión al servidor', 'error');
            }
            if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
        });
    }

    // Registro submit
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('reg-name')?.value?.trim();
            const apellido = document.getElementById('reg-apellido')?.value?.trim();
            const email = document.getElementById('reg-email')?.value?.trim();
            const telefono = document.getElementById('reg-telefono')?.value?.trim() || '';
            const pass = document.getElementById('reg-pass')?.value;
            if (!nombre || !apellido || !email || !pass) {
                showAuthMsg('register-msg', 'Completa todos los campos obligatorios', 'error');
                return;
            }
            const btn = registerForm.querySelector('button[type="submit"]');
            if (btn) { btn.disabled = true; btn.textContent = 'Registrando...'; }
            try {
                const res = await fetch('api_auth.php?action=register', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, apellido, email, telefono, password: pass })
                });
                const data = await res.json();
                if (data.success) {
                    localStorage.setItem('ramen_user_session', JSON.stringify(data.cliente));
                    updateLoginButton(data.cliente);
                    if (loginModal) loginModal.classList.remove('is-visible');
                    registerForm.reset();
                    updateCartUI(); // recalcular descuento
                    if (pendingCheckout) { pendingCheckout = false; executeCheckout(); }
                } else {
                    showAuthMsg('register-msg', data.error || 'Error al registrarse', 'error');
                }
            } catch (err) {
                showAuthMsg('register-msg', 'Error de conexión', 'error');
            }
            if (btn) { btn.disabled = false; btn.textContent = 'Registrarse'; }
        });
    }

    // Recuperar submit
    if (recoverForm) {
        recoverForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('recover-email')?.value?.trim();
            if (!email) return;
            const btn = recoverForm.querySelector('button[type="submit"]');
            if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }
            try {
                const res = await fetch('api_auth.php?action=recuperar', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (data.success) {
                    showAuthMsg('recover-msg', data.mensaje, 'success');
                    recoverForm.reset();
                } else {
                    showAuthMsg('recover-msg', data.error || 'Error al enviar enlace', 'error');
                }
            } catch (err) {
                showAuthMsg('recover-msg', 'Error de conexión', 'error');
            }
            if (btn) { btn.disabled = false; btn.textContent = 'Enviar Enlace'; }
        });
    }

    // Actualizar botón login/usuario en navbar
    function updateLoginButton(cliente) {
        if (!loginModalBtn) return;
        const textEl = loginModalBtn.querySelector('.login-text');
        const iconEl = loginModalBtn.querySelector('i');
        if (cliente) {
            loginModalBtn.classList.add('logged-in');
            if (textEl) textEl.textContent = cliente.nombre;
            if (iconEl) iconEl.className = 'fas fa-user-check';
        } else {
            loginModalBtn.classList.remove('logged-in');
            if (textEl) textEl.textContent = 'Iniciar Sesión';
            if (iconEl) iconEl.className = 'fas fa-user';
        }
    }

    function toggleUserMenu() {
        if (!loginModalBtn) return;
        let dropdown = document.getElementById('user-menu-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'user-menu-dropdown';
            dropdown.className = 'user-menu-dropdown';
            dropdown.innerHTML = '<button id="btn-logout"><i class="fas fa-sign-out-alt"></i> Cerrar Sesión</button>';
            loginModalBtn.parentElement.style.position = 'relative';
            loginModalBtn.parentElement.appendChild(dropdown);
            dropdown.querySelector('#btn-logout').addEventListener('click', logout);
        }
        dropdown.classList.toggle('show');
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(ev) {
                if (!dropdown.contains(ev.target) && ev.target !== loginModalBtn) {
                    dropdown.classList.remove('show');
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);
    }

    async function logout() {
        try { await fetch('api_auth.php?action=logout'); } catch (e) {}
        localStorage.removeItem('ramen_user_session');
        updateLoginButton(null);
        const dropdown = document.getElementById('user-menu-dropdown');
        if (dropdown) dropdown.classList.remove('show');
    }

    // Restaurar sesión — FIX: usa data.success (no data.logged)
    async function checkSession() {
        const stored = localStorage.getItem('ramen_user_session');
        if (!stored) return;
        try {
            const cliente = JSON.parse(stored);
            updateLoginButton(cliente); // mostrar inmediatamente
            const res = await fetch('api_auth.php?action=check');
            const data = await res.json();
            if (data.success && data.cliente) {
                localStorage.setItem('ramen_user_session', JSON.stringify(data.cliente));
                updateLoginButton(data.cliente);
                updateCartUI(); // recalcular descuento con datos frescos
            }
            // Si servidor no confirma, NO borrar localStorage
        } catch (e) {
            // Error de red: mantener sesión local
        }
    }
    checkSession();

    /* ============================================================
       6. MODAL DE PRODUCTO
       ============================================================ */
    const productModal = document.getElementById('product-modal');
    const productModalCloseBtn = document.getElementById('product-modal-close-btn');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalPrice = document.getElementById('modal-price');
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    function openProductModal(productKey) {
        const product = productData[productKey];
        if (!product) return;
        currentProduct = { key: productKey, ...product };
        if (modalImg) modalImg.src = product.img;
        if (modalTitle) modalTitle.textContent = product.title;
        if (modalDesc) modalDesc.textContent = product.desc;
        if (modalPrice) modalPrice.textContent = product.price;
        if (productModal) productModal.classList.add('is-visible');
    }

    // Click en cards estáticas (index.html)
    document.querySelectorAll('.product-card[data-product]').forEach(card => {
        card.addEventListener('click', () => {
            const key = card.dataset.product;
            if (key && productData[key]) openProductModal(key);
        });
    });

    if (productModalCloseBtn && productModal) {
        productModalCloseBtn.addEventListener('click', () => {
            productModal.classList.remove('is-visible');
            currentProduct = null;
        });
    }

    /* ============================================================
       7. CARRITO — Agregar, quitar, renderizar
       ============================================================ */
    const cartBtn = document.getElementById('cart-btn');
    const cartCount = document.getElementById('cart-count');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutCloseBtn = document.getElementById('checkout-close-btn');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartTotal = document.getElementById('cart-total');

    // Añadir producto desde modal
    window.addToCart = function addToCart() {
        if (!currentProduct) return;
        const id = currentProduct.id_producto;
        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({
                id: currentProduct.id_producto,
                title: currentProduct.title,
                price: parseFloat(currentProduct.priceNum),
                img: currentProduct.img,
                categoriaId: currentProduct.id_categoria,
                quantity: 1,
                modificacion: ''
            });
        }
        saveCart();
        updateCartUI();
        if (productModal) productModal.classList.remove('is-visible');
        showToast('¡Plato agregado al carrito! 🍜');
    }

    // Toast visual
    function showToast(msg) {
        let toast = document.getElementById('ramen-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ramen-toast';
            toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:linear-gradient(90deg,#ff4b2b,#ff416c);color:#fff;padding:15px 25px;border-radius:10px;box-shadow:0 5px 15px rgba(255,75,43,0.4);z-index:9999;font-family:"Alatsi",sans-serif;opacity:0;transition:opacity 0.3s;pointer-events:none;';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        setTimeout(() => toast.style.opacity = '0', 3000);
    }

    // FIX: Normalizar ID a número para comparación segura
    window.addMoreToCart = function(productId) {
        const numId = typeof productId === 'string' ? parseInt(productId) : productId;
        const item = cart.find(i => i.id === numId);
        if (item) { item.quantity += 1; saveCart(); updateCartUI(); }
    };

    window.removeFromCart = function(productId) {
        const numId = typeof productId === 'string' ? parseInt(productId) : productId;
        const idx = cart.findIndex(item => item.id === numId);
        if (idx === -1) return;
        if (cart[idx].quantity > 1) { cart[idx].quantity -= 1; } else { cart.splice(idx, 1); }
        saveCart();
        updateCartUI();
    };

    window.deleteFromCart = function(productId) {
        const numId = typeof productId === 'string' ? parseInt(productId) : productId;
        cart = cart.filter(item => item.id !== numId);
        saveCart();
        updateCartUI();
    };

    // Modificaciones por categoría
    function getModifierHTML(item) {
        let options = '';
        if (item.categoriaId === 1) {
            options = '<option value="">Ninguna</option><option value="Agregar ajo frito">Agregar ajo frito</option><option value="Extra mantequilla">Extra mantequilla</option><option value="Salsa picante (Chili crisp)">Salsa picante (Chili crisp)</option><option value="Estilo seco (sin caldo)">Estilo seco (sin caldo)</option><option value="Sin cebollita china">Sin cebollita china</option>';
        } else if (item.categoriaId === 2) {
            options = '<option value="">Ninguna</option><option value="Sin wasabi">Sin wasabi</option><option value="Sin kion">Sin kion</option><option value="Extra salsa acevichada">Extra salsa acevichada</option><option value="Salsa de soya extra">Salsa de soya extra</option>';
        } else if (item.categoriaId === 3) {
            options = '<option value="">Ninguna</option><option value="Extra tortilla de huevo">Extra tortilla de huevo</option><option value="Sin cebollita china">Sin cebollita china</option>';
        } else if (item.categoriaId === 4) {
            options = '<option value="">Ninguna</option><option value="Extra salsa demiglace">Extra salsa demiglace</option><option value="Sin kétchup">Sin kétchup</option>';
        } else {
            options = '<option value="">Ninguna</option>';
        }
        return '<select class="cart-modifier select-mod" data-item-id="' + item.id + '">' + options + '</select>' +
               '<input type="text" class="cart-modifier input-note" data-item-id="' + item.id + '" placeholder="Observaciones..." maxlength="150">';
    }

    // Renderizar carrito completo
    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) cartCount.textContent = totalItems;
        if (!cartItemsList || !cartTotal) return;
        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<div class="empty-cart-msg" style="text-align:center; padding: 40px 20px;">' +
                '<i class="fas fa-shopping-basket" style="font-size: 3rem; color: rgba(255,255,255,0.2); margin-bottom:15px; display:block;"></i>' +
                '<p style="font-family:Alatsi,sans-serif; font-size:1.2rem; color:#a0a0b0; margin-bottom:20px;">Tu carrito está vacío</p>' +
                '<a href="productos.html" class="btn-action" style="display:inline-block; text-decoration:none; padding:10px 25px; background:linear-gradient(90deg,#ff4b2b,#ff416c); color:#fff; border-radius:10px;"><i class="fas fa-chevron-left"></i> Explorar Menú</a>' +
                '</div>';
            cartTotal.textContent = 'S/ 0.00';
            const subtotalEl = document.getElementById('cart-subtotal');
            if (subtotalEl) subtotalEl.textContent = 'S/ 0.00';
            const deliveryEl = document.getElementById('cart-delivery');
            if (deliveryEl) deliveryEl.textContent = 'S/ 0.00';
            const discountRowEl = document.getElementById('cart-discount-row');
            if (discountRowEl) discountRowEl.style.display = 'none';
            const welcomeBadge = document.getElementById('welcome-discount-badge');
            if (welcomeBadge) welcomeBadge.style.display = 'none';
            return;
        }

        // Renderizar items
        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'modern-cart-item';
            div.innerHTML = '<div class="item-img"><img src="' + item.img + '" alt="' + item.title + '"></div>' +
                '<div class="item-info">' +
                    '<h4>' + item.title + '</h4>' +
                    '<div class="item-math"><span class="price">S/ ' + item.price.toFixed(2) + '</span></div>' +
                    getModifierHTML(item) +
                '</div>' +
                '<div class="item-right-controls">' +
                    '<div class="item-total">S/ ' + (item.price * item.quantity).toFixed(2) + '</div>' +
                    '<div class="qty-controls">' +
                        '<button class="qty-btn qty-minus" onclick="removeFromCart(' + item.id + ')"><i class="fas fa-minus"></i></button>' +
                        '<span class="qty-val">' + item.quantity + '</span>' +
                        '<button class="qty-btn qty-plus" onclick="addMoreToCart(' + item.id + ')"><i class="fas fa-plus"></i></button>' +
                    '</div>' +
                    '<button class="qty-btn qty-delete" onclick="deleteFromCart(' + item.id + ')" title="Eliminar"><i class="fas fa-trash-alt"></i></button>' +
                '</div>';
            cartItemsList.appendChild(div);
        });

        // Calcular totales
        const sessionStr = localStorage.getItem('ramen_user_session');
        let isFirstOrder = false;
        if (sessionStr) {
            try { if (JSON.parse(sessionStr).primera_compra) isFirstOrder = true; } catch (e) {}
        }

        const welcomeBadge = document.getElementById('welcome-discount-badge');
        const subtotalEl = document.getElementById('cart-subtotal');
        const discountRowEl = document.getElementById('cart-discount-row');
        const discountEl = document.getElementById('cart-discount');
        const deliveryEl = document.getElementById('cart-delivery');

        let sumOriginal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (subtotalEl) subtotalEl.textContent = 'S/ ' + sumOriginal.toFixed(2);

        let costoEnvio = 0;
        const tipoEntregaRadio = document.querySelector('input[name="tipo_entrega"]:checked');
        if (tipoEntregaRadio && tipoEntregaRadio.value === 'Delivery') costoEnvio = 5.00;
        if (deliveryEl) deliveryEl.textContent = 'S/ ' + costoEnvio.toFixed(2);

        let total;
        if (isFirstOrder && cart.length > 0) {
            const discount = sumOriginal * 0.15;
            total = sumOriginal - discount;
            if (welcomeBadge) welcomeBadge.style.display = 'block';
            if (discountRowEl) discountRowEl.style.display = 'flex';
            if (discountEl) discountEl.textContent = '- S/ ' + discount.toFixed(2);
        } else {
            total = sumOriginal;
            if (welcomeBadge) welcomeBadge.style.display = 'none';
            if (discountRowEl) discountRowEl.style.display = 'none';
        }

        total += costoEnvio;
        cartTotal.textContent = 'S/ ' + total.toFixed(2);
    }

    if (addToCartBtn) addToCartBtn.addEventListener('click', addToCart);
    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.isCarritoPage) return;
            window.location.href = 'carrito.html';
        });
    }
    if (checkoutCloseBtn && checkoutModal) {
        checkoutCloseBtn.addEventListener('click', () => checkoutModal.classList.remove('is-visible'));
    }

    /* ============================================================
       8. TOGGLE CAMPOS DELIVERY
       ============================================================ */
    const deliveryFields = document.getElementById('delivery-fields');

    if (deliveryFields) {
        deliveryFields.style.transition = 'all 0.4s ease';
        deliveryFields.style.overflow = 'hidden';
        const initRadio = document.querySelector('input[name="tipo_entrega"]:checked');
        if (initRadio && initRadio.value === 'Delivery') {
            deliveryFields.style.maxHeight = '200px';
            deliveryFields.style.opacity = '1';
            deliveryFields.style.margin = '15px 0';
        } else {
            deliveryFields.style.maxHeight = '0';
            deliveryFields.style.opacity = '0';
            deliveryFields.style.margin = '0';
            deliveryFields.style.pointerEvents = 'none';
        }
    }

    document.querySelectorAll('input[name="tipo_entrega"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (deliveryFields) {
                if (e.target.value === 'Delivery') {
                    deliveryFields.style.maxHeight = '200px';
                    deliveryFields.style.opacity = '1';
                    deliveryFields.style.margin = '15px 0';
                    deliveryFields.style.pointerEvents = 'auto';
                } else {
                    deliveryFields.style.maxHeight = '0';
                    deliveryFields.style.opacity = '0';
                    deliveryFields.style.margin = '0';
                    deliveryFields.style.pointerEvents = 'none';
                    const addr = document.getElementById('delivery-address');
                    const phone = document.getElementById('delivery-phone');
                    if (addr) addr.value = '';
                    if (phone) phone.value = '';
                }
            }
            updateCartUI();
        });
    });

    /* ============================================================
       9. CONFIRMAR PEDIDO
       ============================================================ */
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const metodosNombre = { '1': 'Tarjeta', '2': 'Yape/Plin', '3': 'Efectivo' };

    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', () => {
            if (cart.length === 0) { alert('❌ Tu carrito está vacío.'); return; }
            const session = localStorage.getItem('ramen_user_session');
            if (!session) { pendingCheckout = true; openLoginModal(); return; }
            executeCheckout();
        });
    }

    async function executeCheckout() {
        const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked')?.value || 'Retiro en tienda';
        const idMetodo = document.querySelector('input[name="payment"]:checked')?.value || '1';

        let deliveryData = null;
        if (tipoEntrega === 'Delivery') {
            const address = document.getElementById('delivery-address')?.value?.trim();
            const phone = document.getElementById('delivery-phone')?.value?.trim();
            if (!address || !phone) { alert('📍 Por favor, ingresa dirección y teléfono para el delivery.'); return; }
            deliveryData = { direccion_entrega: address, telefono_contacto: phone, referencia: '' };
        }

        const modifierMap = {};
        document.querySelectorAll('.cart-modifier').forEach(el => {
            const id = el.getAttribute('data-item-id');
            if (!modifierMap[id]) modifierMap[id] = { select: '', note: '' };
            if (el.classList.contains('select-mod')) modifierMap[id].select = el.value;
            if (el.classList.contains('input-note')) modifierMap[id].note = el.value.trim();
        });

        let totalFinal = 0;
        let sumOriginal = 0;
        const detallePedidos = cart.map(item => {
            const subtotal = item.price * item.quantity;
            sumOriginal += subtotal;
            totalFinal += subtotal;
            const detalle = {
                id_producto: item.id,
                cantidad: item.quantity,
                precio_unitario: item.price,
                subtotal: parseFloat(subtotal.toFixed(2)),
                observaciones: '',
                modificaciones: []
            };
            const mods = modifierMap[String(item.id)];
            if (mods && (mods.select || mods.note)) {
                let text = '';
                if (mods.select && mods.note) text = mods.select + ' | Obs: ' + mods.note;
                else if (mods.select) text = mods.select;
                else text = 'Obs: ' + mods.note;
                detalle.observaciones = text;
                detalle.modificaciones.push({ descripcion: text });
            }
            return detalle;
        });

        const sessionStr = localStorage.getItem('ramen_user_session');
        let isFirstOrder = false;
        if (sessionStr) {
            try { if (JSON.parse(sessionStr).primera_compra) isFirstOrder = true; } catch (e) {}
        }
        if (isFirstOrder) { totalFinal = sumOriginal - (sumOriginal * 0.15); }
        else { totalFinal = sumOriginal; }
        if (tipoEntrega === 'Delivery') totalFinal += 5.00;

        const payload = {
            pedido: { tipo_entrega: tipoEntrega, notas: '' },
            detalle_pedidos: detallePedidos,
            checkout: { metodo_pago: idMetodo, total_final: parseFloat(totalFinal.toFixed(2)) },
            delivery: deliveryData
        };

        const textoOriginal = confirmOrderBtn.innerHTML;
        confirmOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        confirmOrderBtn.disabled = true;

        try {
            const res = await fetch('api_pedidos.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                const msgEntrega = tipoEntrega === 'Delivery'
                    ? '\n📍 Envío a: ' + deliveryData.direccion_entrega
                    : '\n🏪 Retira tu pedido en tienda';
                alert('✅ ¡Pedido #' + data.id_pedido + ' Confirmado!\n\n💳 Método: ' + metodosNombre[idMetodo] + msgEntrega + '\n💰 Total: S/ ' + totalFinal.toFixed(2));
                cart = [];
                saveCart();
                updateCartUI();
                if (checkoutModal) checkoutModal.classList.remove('is-visible');
                if (window.isCarritoPage) { window.location.href = 'index.html'; }
                const addr = document.getElementById('delivery-address');
                const phone = document.getElementById('delivery-phone');
                if (addr) addr.value = '';
                if (phone) phone.value = '';
            } else if (data.error === 'No autenticado') {
                localStorage.removeItem('ramen_user_session');
                updateLoginButton(null);
                pendingCheckout = true;
                openLoginModal();
            } else {
                alert('❌ Error: ' + (data.error || 'No se pudo procesar el pedido'));
            }
        } catch (err) {
            alert('❌ Error de conexión al servidor. Intenta de nuevo.');
            console.error('Checkout error:', err);
        }

        confirmOrderBtn.innerHTML = textoOriginal;
        confirmOrderBtn.disabled = false;
    }

    /* ============================================================
       10. CIERRE GLOBAL DE MODALES
       ============================================================ */
    [productModal, checkoutModal, loginModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('is-visible');
            });
        }
    });

    /* ============================================================
       11. SMOOTH SCROLL
       ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.length > 1) {
                e.preventDefault();
                const el = document.querySelector(targetId);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    /* ============================================================
       12. FORMULARIO DE CONTACTO
       ============================================================ */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn ? btn.innerHTML : 'Enviar';
            if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...'; btn.disabled = true; }
            setTimeout(() => {
                alert('✅ ¡Mensaje Enviado!\n\nGracias por escribirnos. Te responderemos pronto.');
                contactForm.reset();
                if (btn) { btn.innerHTML = originalText; btn.disabled = false; }
            }, 2000);
        });
    }


    updateCartUI();
});
