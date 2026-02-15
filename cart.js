// ===================================
// SHOPPING CART FUNCTIONALITY
// ===================================

let cart = [];

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('shamsCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('shamsCart', JSON.stringify(cart));
}

// Add item to cart
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showCartFeedback();
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Update item quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

// Calculate cart totals
function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 1000 ? 0 : 80;
    const total = subtotal + shipping;

    return { subtotal, shipping, total };
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartShipping = document.getElementById('cartShipping');
    const cartTotal = document.getElementById('cartTotal');
    const shippingNotice = document.getElementById('shippingNotice');

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }

    // Update cart items
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Your cart is empty</p>
                    <a href="shop.html" class="cta-button">BROWSE PRODUCTS</a>
                </div>
            `;
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price.toFixed(2)} EGP</div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    // Update totals
    const { subtotal, shipping, total } = calculateTotals();

    if (cartSubtotal) {
        cartSubtotal.textContent = `${subtotal.toFixed(2)} EGP`;
    }

    if (cartShipping) {
        if (shipping === 0) {
            cartShipping.innerHTML = `<span style="color: #4caf50; font-weight: 600;">FREE</span>`;
        } else {
            cartShipping.textContent = `${shipping.toFixed(2)} EGP`;
        }
    }

    if (cartTotal) {
        cartTotal.textContent = `${total.toFixed(2)} EGP`;
    }

    // Show free shipping notice
    if (shippingNotice) {
        if (subtotal >= 1000) {
            shippingNotice.innerHTML = `
                <i class="fas fa-truck"></i>
                Congratulations! You get FREE SHIPPING!
            `;
            shippingNotice.classList.add('show');
        } else {
            const remaining = 1000 - subtotal;
            shippingNotice.innerHTML = `
                <i class="fas fa-info-circle"></i>
                Add ${remaining.toFixed(2)} EGP more for FREE SHIPPING
            `;
            shippingNotice.classList.add('show');
            shippingNotice.style.background = '#fff3cd';
            shippingNotice.style.borderColor = '#ffc107';
            shippingNotice.style.color = '#856404';
        }
    }
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    }
}

// Show add to cart feedback
function showCartFeedback() {
    // Simple visual feedback
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 200);
    }
}

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    // Cart icon click
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', toggleCart);
    }

    // Close cart button
    const cartClose = document.getElementById('cartClose');
    if (cartClose) {
        cartClose.addEventListener('click', toggleCart);
    }

    // Overlay click
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartOverlay) {
        cartOverlay.addEventListener('click', toggleCart);
    }



    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            const { total } = calculateTotals();
            alert(`Checkout - Total: ${total.toFixed(2)} EGP\n\nThank you for your order!`);

            // Clear cart after checkout
            cart = [];
            saveCart();
            updateCartUI();
            toggleCart();
        });
    }
});
