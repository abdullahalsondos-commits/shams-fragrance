// Credentials
const ADMIN_CREDENTIALS = {
    email: "mostafahmed_46455@icloud.com",
    password: "mostafashams",
};

// Product Data Fallback (for older orders without image paths)
const PRODUCTS_REGISTRY = {
    paradise: "assets/images/perfumes/paradise.jpg",
    lunara: "assets/images/perfumes/lunara.jpg",
    sigma: "assets/images/perfumes/sigma.jpg",
    blaze: "assets/images/perfumes/blaze.jpg",
    "shadow-spice": "assets/images/perfumes/shadow-spice.jpg",
    "pink-aura": "assets/images/perfumes/pink-aura.jpg",
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Handle Login
    const loginForm = document.getElementById("adminLoginForm");
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const pass = document.getElementById("loginPass").value;
            const error = document.getElementById("loginError");

            if (email === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.password) {
                localStorage.setItem("shams_admin_session", "true");
                window.location.href = "admin.html";
            } else {
                error.style.display = "block";
                error.textContent = "Invalid email or password.";
            }
        };
    }

    // 2. Dashboard Logic
    if (window.location.pathname.includes("admin.html")) {
        checkAuth();
        loadOrders("all");
        setupFilters();
    }
});

function checkAuth() {
    if (localStorage.getItem("shams_admin_session") !== "true") {
        window.location.href = "admin-login.html";
    }
}

function logout() {
    localStorage.removeItem("shams_admin_session");
    window.location.href = "admin-login.html";
}

// ✅ Fetch orders from Netlify (shared across devices)
async function fetchOrdersFromServer() {
    const res = await fetch("/.netlify/functions/get-orders", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch orders: " + res.status);
    const data = await res.json();
    return data.orders || [];
}

async function loadOrders(filter = "all") {
    const ordersContainer = document.getElementById("ordersTableBody");
    if (!ordersContainer) return;

    ordersContainer.innerHTML =
        '<tr><td colspan="5" style="text-align:center; padding: 4rem; color: #666;">Loading orders...</td></tr>';

    try {
        const orders = await fetchOrdersFromServer();

        // Filter
        const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

        // Stats
        updateStats(orders);

        if (filtered.length === 0) {
            ordersContainer.innerHTML =
                '<tr><td colspan="5" style="text-align:center; padding: 4rem; color: #666;">No orders found.</td></tr>';
            return;
        }

        ordersContainer.innerHTML = filtered
            .map(
                (order) => `
        <tr onclick="viewOrderDetails('${order.id}')">
          <td>
            <div class="customer-info">
              <span class="name">${escapeHtml(order.customerName || "")}</span>
              <span class="details">${escapeHtml(order.customerPhone || "")}</span>
              <span class="details">${escapeHtml(order.customerGov || "")}</span>
            </div>
          </td>
          <td>
            <ul class="order-items-list">
              ${(order.orderItems || [])
                        .map((item) => `<li>• ${escapeHtml(item.name)} x${item.qty}</li>`)
                        .join("")}
            </ul>
          </td>
          <td>
            <strong>${Number(order.total || 0).toFixed(2)} EGP</strong>
          </td>
          <td>
            <span class="status-badge status-${escapeHtml(order.status || "pending")}">${escapeHtml(
                            order.status || "pending"
                        )}</span>
          </td>
          <td>
            <span style="color:#999; font-size: 0.8rem;">(status from form)</span>
          </td>
        </tr>
      `
            )
            .join("");
    } catch (err) {
        console.error(err);
        ordersContainer.innerHTML =
            '<tr><td colspan="5" style="text-align:center; padding: 4rem; color: #e74c3c;">Failed to load orders.</td></tr>';
    }
}

function updateStats(orders) {
    const totalOrders = document.getElementById("statTotalOrders");
    const pendingOrders = document.getElementById("statPendingOrders");
    const totalRevenue = document.getElementById("statTotalRevenue");

    if (totalOrders) totalOrders.textContent = orders.length;
    if (pendingOrders) pendingOrders.textContent = orders.filter((o) => o.status === "pending").length;
    if (totalRevenue) {
        const rev = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        totalRevenue.textContent = rev.toFixed(2) + " EGP";
    }
}

function setupFilters() {
    const btns = document.querySelectorAll(".filter-btn");
    btns.forEach((btn) => {
        btn.onclick = () => {
            btns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            loadOrders(btn.dataset.filter);
        };
    });
}

// Order Details Modal Logic
const modal = document.getElementById("orderModalOverlay");
const closeBtn = document.getElementById("closeOrderModal");
const content = document.getElementById("orderDetailsContent");

if (closeBtn) closeBtn.onclick = () => modal.classList.remove("active");
if (modal) {
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove("active");
    };
}

async function viewOrderDetails(orderId) {
    try {
        const orders = await fetchOrdersFromServer();
        const order = orders.find((o) => o.id === orderId);
        if (!order) return;

        content.innerHTML = `
      <div class="details-grid">
        <div class="detail-section">
          <h4>Customer</h4>
          <p><strong>${escapeHtml(order.customerName || "")}</strong></p>
          <p>${escapeHtml(order.customerPhone || "")}</p>
          <p>${escapeHtml(order.customerEmail || "No email provided")}</p>
        </div>
        <div class="detail-section">
          <h4>Order Info</h4>
          <p># ${escapeHtml(order.id)}</p>
          <p>${new Date(order.date).toLocaleString("en-GB")}</p>
          <p><span class="status-badge status-${escapeHtml(order.status)}">${escapeHtml(order.status)}</span></p>
        </div>
        <div class="detail-section full-address">
          <h4>Shipping Address</h4>
          <p><strong>${escapeHtml(order.customerGov || "")}</strong></p>
          <p>${escapeHtml(order.customerAddress || "")}</p>
        </div>
      </div>

      <div class="modal-items-list">
        <h4>Products in Order</h4>
        ${(order.orderItems || [])
                .map((item) => {
                    const imgPath = item.image || PRODUCTS_REGISTRY[item.id] || "assets/images/placeholder.jpg";
                    return `
              <div class="modal-item">
                <img src="${imgPath}" class="modal-item-img" alt="${escapeHtml(item.name)}">
                <div class="modal-item-info">
                  <span class="modal-item-name">${escapeHtml(item.name)}</span>
                  <span class="modal-item-meta">${item.qty} x ${Number(item.price || 0).toFixed(2)} EGP</span>
                </div>
                <div class="modal-item-total">
                  ${Number(item.lineTotal || (item.price * item.qty) || 0).toFixed(2)} EGP
                </div>
              </div>
            `;
                })
                .join("")}
      </div>

      <div class="modal-summary">
        <div class="summary-line">
          <span>Subtotal</span>
          <span>${Number(order.subtotal || 0).toFixed(2)} EGP</span>
        </div>
        <div class="summary-line">
          <span>Shipping</span>
          <span>${Number(order.shipping || 0) === 0 ? "FREE" : Number(order.shipping || 0).toFixed(2) + " EGP"}</span>
        </div>
        <div class="summary-line total">
          <span>TOTAL AMOUNT</span>
          <span>${Number(order.total || 0).toFixed(2)} EGP</span>
        </div>
      </div>
    `;

        modal.classList.add("active");
    } catch (e) {
        console.error(e);
    }
}

// simple helper
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
