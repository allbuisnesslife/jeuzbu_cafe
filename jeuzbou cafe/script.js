/* ============================================
   JEUZBOU CAFE - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ============================
    // CART FUNCTIONALITY
    // ============================
    let cart = [];
    const cartBtn = document.getElementById('cartBtn');
    const cartCount = document.getElementById('cartCount');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    function updateCartUI() {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Votre panier est vide</p>
                </div>`;
            cartFooter.style.display = 'none';
        } else {
            cartItems.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-img"><i class="fas fa-coffee"></i></div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">${formatPrice(item.price * item.qty)} FCFA</div>
                        <div class="cart-item-qty">
                            <button onclick="changeCartQty(${index}, -1)">-</button>
                            <span>${item.qty}</span>
                            <button onclick="changeCartQty(${index}, 1)">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>`).join('');

            const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            cartTotal.textContent = formatPrice(total) + ' FCFA';
            cartFooter.style.display = 'block';
        }
    }

    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function formatPrice(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    window.changeCartQty = function(index, delta) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) cart.splice(index, 1);
        updateCartUI();
    };

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        updateCartUI();
        showToast('Produit retiré du panier');
    };

    // Xassida card selection (multiple)
    let selectedXassidas = [];
    document.querySelectorAll('.xassida-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
            const name = card.dataset.name;
            const price = parseInt(card.dataset.price);

            const index = selectedXassidas.findIndex(x => x.name === name);
            if (index > -1) {
                selectedXassidas.splice(index, 1);
            } else {
                selectedXassidas.push({ name, price });
            }
        });
    });

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.product-card');
            const name = btn.dataset.name;
            let price = parseInt(btn.dataset.price);
            let qty = 1;

            // Handle xassida → WhatsApp
            if (btn.classList.contains('xassida-btn')) {
                if (selectedXassidas.length === 0) {
                    showToast('Veuillez sélectionner au moins un xassida');
                    return;
                }
                let message = 'Bonjour Jeuwrigne, je souhaite commander :\n';
                selectedXassidas.forEach(x => {
                    message += `- ${x.name} : ${formatPrice(x.price)} FCFA\n`;
                });
                message += '\nJajeuf';
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/221764243371?text=${encodedMessage}`, '_blank');
                return;
            }

            const qtyInput = card.querySelector('.qty-input');
            if (qtyInput) qty = parseInt(qtyInput.value);

            const existing = cart.find(item => item.name === name);
            if (existing) {
                existing.qty += qty;
            } else {
                cart.push({ name, price, qty });
            }

            updateCartUI();
            showToast(`${name} ajouté au panier !`);

            if (qtyInput) qtyInput.value = 1;
        });
    });

    // Quantity controls
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.parentElement.querySelector('.qty-input');
            let val = parseInt(input.value);
            if (btn.dataset.action === 'plus') val++;
            else if (btn.dataset.action === 'minus' && val > 1) val--;
            input.value = val;
        });
    });

    // Cart toggle
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    });

    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    }

    // Checkout
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        let message = 'Bonjour Jeuwrigne, je souhaite commander :\n';
        cart.forEach(item => {
            message += `- ${item.name} x${item.qty} : ${formatPrice(item.price * item.qty)} FCFA\n`;
        });
        message += `\nTotal : ${formatPrice(total)} FCFA\nJajeuf`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/221764243371?text=${encodedMessage}`, '_blank');

        cart = [];
        updateCartUI();
        closeCart();
    });

    // ============================
    // PRODUCT FILTERS
    // ============================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            productCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    });

    // ============================
    // TESTIMONIALS SLIDER
    // ============================
    const track = document.querySelector('.testimonial-track');
    const cards = document.querySelectorAll('.testimonial-card');
    const dotsContainer = document.getElementById('sliderDots');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentSlide = 0;

    // Create dots
    cards.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    function goToSlide(index) {
        currentSlide = index;
        track.style.transform = `translateX(-${index * 100}%)`;
        document.querySelectorAll('.slider-dot').forEach((d, i) => {
            d.classList.toggle('active', i === index);
        });
    }

    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + cards.length) % cards.length;
        goToSlide(currentSlide);
    });

    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % cards.length;
        goToSlide(currentSlide);
    });

    // Auto-slide
    setInterval(() => {
        currentSlide = (currentSlide + 1) % cards.length;
        goToSlide(currentSlide);
    }, 5000);

    // ============================
    // RESERVATION MODAL
    // ============================
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalCeremonyType = document.getElementById('modalCeremonyType');
    const reservationForm = document.getElementById('reservationForm');

    document.querySelectorAll('.reserve-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modalCeremonyType.textContent = btn.dataset.type;
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = modalCeremonyType.textContent;
        showToast(`Réservation ${type} confirmée ! Nous vous contacterons bientôt.`);
        reservationForm.reset();
        closeModal();
    });

    // ============================
    // CONTACT FORM
    // ============================
    document.getElementById('contactForm').addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Message envoyé avec succès !');
        e.target.reset();
    });

    // ============================
    // HEADER SCROLL EFFECT
    // ============================
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ============================
    // HAMBURGER MENU
    // ============================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // ============================
    // ACTIVE NAV LINK ON SCROLL
    // ============================
    const sections = document.querySelectorAll('.section, .hero');
    const navLinksAll = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinksAll.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // ============================
    // SMOOTH SCROLL
    // ============================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ============================
    // ANIMATE ON SCROLL
    // ============================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-card, .ceremony-card, .feature, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

});
