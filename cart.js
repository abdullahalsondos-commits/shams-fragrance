// ===================================
// SHOPPING CART FUNCTIONALITY
// ===================================

let cart = [];

// ================================
// NETLIFY FORMS SETTINGS (OPTIONAL)
// ================================
const NETLIFY_FORM_NAME = "order"; // لازم يطابق اسم الفورم المخفي في HTML

function encodeForm(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
}

// ✅ Determine correct POST URL for Netlify Forms
function getNetlifyPostUrl() {
  let path = window.location.pathname || "/";

  // remove trailing slash (except root)
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  // If pretty route like /shop -> enforce shop.html
  if (path !== "/" && !path.includes(".")) {
    path = path + ".html";
  }

  return path || "/";
}

// ================================
// ✅ WHATSAPP SETTINGS (MAIN)
// ================================
const ORDER_WHATSAPP_NUMBER = "201130447270";

function buildOrderMessage({
  customerName,
  customerPhone,
  customerPhone2,
  customerGov,
  customerAddress,
  customerEmail,
  customerNotes,
  subtotal,
  shipping,
  total,
  orderItems,
}) {
  const itemsText = orderItems
    .map((it) => `• ${it.name} x${it.qty} = ${it.lineTotal.toFixed(2)} EGP`)
    .join("\n");

  return (
    `New Order - SHAMS FRAGRANCE\n\n` +
    `Name: ${customerName}\n` +
    `Phone: ${customerPhone}\n` +
    (customerPhone2 ? `Emergency Phone: ${customerPhone2}\n` : "") +
    `Governorate: ${customerGov}\n` +
    `Address: ${customerAddress}\n` +
    `Email: ${customerEmail || "Not provided"}\n` +
    (customerNotes ? `Notes: ${customerNotes}\n` : "") +
    `\nItems:\n${itemsText}\n\n` +
    `Subtotal: ${subtotal.toFixed(2)} EGP\n` +
    `Shipping: ${shipping === 0 ? "FREE" : shipping.toFixed(2) + " EGP"}\n` +
    `Total: ${total.toFixed(2)} EGP\n`
  );
}

function openWhatsAppNow(message) {
  const waUrl = `https://wa.me/${ORDER_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;

  // ✅ لازم يحصل فورًا (بدون await) عشان المتصفح ما يمنعش الـ popup
  const win = window.open(waUrl, "_blank");

  // لو المتصفح منع popup → افتح في نفس التاب
  if (!win || win.closed || typeof win.closed === "undefined") {
    window.location.href = waUrl;
  }
}

// ================================
// OPTIONAL: Send to Netlify in background (doesn't block WhatsApp)
// ================================
function sendToNetlifyInBackground(payload) {
  try {
    // الأفضل لو متاح: sendBeacon
    if (navigator.sendBeacon) {
      const body = encodeForm(payload);
      const blob = new Blob([body], { type: "application/x-www-form-urlencoded" });
      navigator.sendBeacon(getNetlifyPostUrl(), blob);
      return;
    }

    // fallback: fetch keepalive بدون await
    fetch(getNetlifyPostUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeForm(payload),
      keepalive: true,
    }).catch(() => { });
  } catch (_) { }
}

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem("shamsCart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartUI();
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("shamsCart", JSON.stringify(cart));
}

// Add item to cart
function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  saveCart();
  updateCartUI();
  showCartFeedback();
}

// Remove item from cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartUI();
}

// Update item quantity
function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId);
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
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 1000 ? 0 : 80;
  const total = subtotal + shipping;

  return { subtotal, shipping, total };
}

// Update cart UI
function updateCartUI() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartShipping = document.getElementById("cartShipping");
  const cartTotal = document.getElementById("cartTotal");
  const shippingNotice = document.getElementById("shippingNotice");

  // Update cart count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.textContent = totalItems;

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
      cartItems.innerHTML = cart
        .map(
          (item) => `
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
        `
        )
        .join("");
    }
  }

  // Update totals
  const { subtotal, shipping, total } = calculateTotals();

  if (cartSubtotal) cartSubtotal.textContent = `${subtotal.toFixed(2)} EGP`;

  if (cartShipping) {
    if (shipping === 0) {
      cartShipping.innerHTML = `<span style="color: #4caf50; font-weight: 600;">FREE</span>`;
    } else {
      cartShipping.textContent = `${shipping.toFixed(2)} EGP`;
    }
  }

  if (cartTotal) cartTotal.textContent = `${total.toFixed(2)} EGP`;

  // Show free shipping notice
  if (shippingNotice) {
    if (subtotal >= 1000) {
      shippingNotice.innerHTML = `
        <i class="fas fa-truck"></i>
        Congratulations! You get FREE SHIPPING!
      `;
      shippingNotice.classList.add("show");
      shippingNotice.style.background = "";
      shippingNotice.style.borderColor = "";
      shippingNotice.style.color = "";
    } else {
      const remaining = 1000 - subtotal;
      shippingNotice.innerHTML = `
        <i class="fas fa-info-circle"></i>
        Add ${remaining.toFixed(2)} EGP more for FREE SHIPPING
      `;
      shippingNotice.classList.add("show");
      shippingNotice.style.background = "#fff3cd";
      shippingNotice.style.borderColor = "#ffc107";
      shippingNotice.style.color = "#856404";
    }
  }
}

// Toggle cart sidebar
function toggleCart() {
  const cartSidebar = document.getElementById("cartSidebar");
  const cartOverlay = document.getElementById("cartOverlay");

  if (cartSidebar && cartOverlay) {
    cartSidebar.classList.toggle("active");
    cartOverlay.classList.toggle("active");
  }
}

// Show add to cart feedback
function showCartFeedback() {
  const cartIcon = document.getElementById("cartIcon");
  if (cartIcon) {
    cartIcon.style.transform = "scale(1.3)";
    setTimeout(() => {
      cartIcon.style.transform = "scale(1)";
    }, 200);
  }
}

// Initialize cart
document.addEventListener("DOMContentLoaded", () => {
  loadCart();

  const cartIcon = document.getElementById("cartIcon");
  if (cartIcon) cartIcon.addEventListener("click", toggleCart);

  const cartClose = document.getElementById("cartClose");
  if (cartClose) cartClose.addEventListener("click", toggleCart);

  const cartOverlay = document.getElementById("cartOverlay");
  if (cartOverlay) cartOverlay.addEventListener("click", toggleCart);

  initCheckoutModal();
});

function initCheckoutModal() {
  // 1) Inject Modal HTML
  if (!document.getElementById("checkoutModal")) {
    const modalHTML = `
      <div class="checkout-modal" id="checkoutModal">
        <div class="checkout-container">
          <div class="checkout-header">
            <h2>Complete Your Order</h2>
            <button class="checkout-close" id="closeCheckout">&times;</button>
          </div>
          <div class="checkout-body">
            <div class="order-summary-mini">
              <div id="checkoutOrderItems" class="checkout-items-container"></div>
              <div class="checkout-total-row">
                <span>Total Amount:</span>
                <span class="order-total-price" id="checkoutTotalDisplay">0.00 EGP</span>
              </div>
            </div>

            <form id="checkoutForm">
              <div class="form-group">
                <label class="form-label">Full Name <span>*</span></label>
                <input type="text" class="form-input" id="c_name" placeholder="Mohamed Ahmed" required>
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number <span>*</span></label>
                <input type="tel" class="form-input" id="c_phone" placeholder="01xxxxxxxxx" pattern="[0-9]{11}" required>
              </div>

              <div class="form-group">
                <label class="form-label">Emergency Phone (Optional)</label>
                <input type="tel" class="form-input" id="c_phone2" placeholder="Another phone number" pattern="[0-9]{11}">
              </div>

              <div class="form-group">
                <label class="form-label">Governorate <span>*</span></label>
                <select class="form-select" id="c_gov" required>
                  <option value="" disabled selected>Select Governorate</option>
                  <option value="Cairo">Cairo</option>
                  <option value="Giza">Giza</option>
                  <option value="Alexandria">Alexandria</option>
                  <option value="Dakahlia">Dakahlia</option>
                  <option value="Red Sea">Red Sea</option>
                  <option value="Beheira">Beheira</option>
                  <option value="Fayoum">Fayoum</option>
                  <option value="Gharbiya">Gharbiya</option>
                  <option value="Ismailia">Ismailia</option>
                  <option value="Menofia">Menofia</option>
                  <option value="Minya">Minya</option>
                  <option value="Qaliubiya">Qaliubiya</option>
                  <option value="New Valley">New Valley</option>
                  <option value="Suez">Suez</option>
                  <option value="Aswan">Aswan</option>
                  <option value="Assiut">Assiut</option>
                  <option value="Beni Suef">Beni Suef</option>
                  <option value="Port Said">Port Said</option>
                  <option value="Damietta">Damietta</option>
                  <option value="Sharkia">Sharkia</option>
                  <option value="South Sinai">South Sinai</option>
                  <option value="Kafr Al Sheikh">Kafr Al Sheikh</option>
                  <option value="Matrouh">Matrouh</option>
                  <option value="Luxor">Luxor</option>
                  <option value="Qena">Qena</option>
                  <option value="North Sinai">North Sinai</option>
                  <option value="Sohag">Sohag</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Detailed Address <span>*</span></label>
                <textarea class="form-textarea" id="c_address" placeholder="Street name, Building number, Apartment..." required></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Email Address (Optional)</label>
                <input type="email" class="form-input" id="c_email" placeholder="example@email.com">
              </div>

              <div class="form-group">
                <label class="form-label">Order Notes (Optional)</label>
                <textarea class="form-textarea" id="c_notes" placeholder="Any special instructions for your order..."></textarea>
              </div>

              <button type="submit" class="form-submit">CONFIRM ORDER</button>
            </form>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  // 2) Event Listeners
  const checkoutBtn = document.getElementById("checkoutBtn");
  const modal = document.getElementById("checkoutModal");
  const closeBtn = document.getElementById("closeCheckout");
  const form = document.getElementById("checkoutForm");

  if (checkoutBtn) {
    checkoutBtn.onclick = (e) => {
      e.preventDefault();
      if (cart.length === 0) return alert("Your cart is empty!");

      const { total } = calculateTotals();
      document.getElementById("checkoutTotalDisplay").textContent = total.toFixed(2) + " EGP";

      const orderItemsContainer = document.getElementById("checkoutOrderItems");
      if (orderItemsContainer) {
        orderItemsContainer.innerHTML = cart
          .map(
            (item) => `
              <div class="checkout-item">
                <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
                <div class="checkout-item-info">
                  <span class="checkout-item-qty">${item.quantity}x</span>
                  <span class="checkout-item-name">${item.name}</span>
                </div>
                <span class="checkout-item-price">${(item.price * item.quantity).toFixed(2)} EGP</span>
              </div>
            `
          )
          .join("");
      }

      modal.classList.add("active");
    };
  }

  if (closeBtn) closeBtn.onclick = () => modal.classList.remove("active");

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove("active");
    };
  }

  // ✅ SUBMIT: WhatsApp FIRST (no await) ثم أي حاجة تانية
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();

      if (cart.length === 0) return alert("Your cart is empty!");

      const submitBtn = form.querySelector(".form-submit");
      const originalText = submitBtn.textContent;

      // Collect data
      const customerName = document.getElementById("c_name")?.value?.trim() || "";
      const customerPhone = document.getElementById("c_phone")?.value?.trim() || "";
      const customerPhone2 = document.getElementById("c_phone2")?.value?.trim() || "";
      const customerGov = document.getElementById("c_gov")?.value || "";
      const customerAddress = document.getElementById("c_address")?.value?.trim() || "";
      const customerEmail = document.getElementById("c_email")?.value?.trim() || "";
      const customerNotes = document.getElementById("c_notes")?.value?.trim() || "";

      if (!customerName || !customerPhone || !customerGov || !customerAddress) {
        return alert("Please fill all required fields.");
      }

      const { subtotal, shipping, total } = calculateTotals();
      const orderItems = cart.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.quantity,
        lineTotal: item.price * item.quantity,
      }));

      // ✅ 1) Build message + Open WhatsApp NOW
      const orderMessage = buildOrderMessage({
        customerName,
        customerPhone,
        customerPhone2,
        customerGov,
        customerAddress,
        customerEmail,
        customerNotes,
        subtotal,
        shipping,
        total,
        orderItems,
      });

      openWhatsAppNow(orderMessage);

      // ✅ 2) OPTIONAL: Send to Netlify in background
      const payload = {
        "form-name": NETLIFY_FORM_NAME,
        "bot-field": "",
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_phone2: customerPhone2,
        customer_gov: customerGov,
        customer_address: customerAddress,
        customer_email: customerEmail,
        customer_notes: customerNotes,
        order_subtotal: subtotal.toFixed(2) + " EGP",
        order_shipping: shipping === 0 ? "FREE" : shipping.toFixed(2) + " EGP",
        order_total: total.toFixed(2) + " EGP",
        order_items_json: JSON.stringify(orderItems),
      };
      sendToNetlifyInBackground(payload);

      // ✅ UI success locally
      submitBtn.textContent = "OPENING WHATSAPP...";
      submitBtn.disabled = true;

      setTimeout(() => {
        // Clear cart
        cart = [];
        saveCart();
        updateCartUI();

        // Close UI
        toggleCart();
        modal.classList.remove("active");
        form.reset();

        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 600);
    };
  }
}
