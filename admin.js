// admin.js - SHAMS ADMIN (Server Orders from Netlify Forms)

let orders = [];
let currentFilter = "all";

// Elements
const totalOrdersEl = document.getElementById("totalOrders");
const pendingOrdersEl = document.getElementById("pendingOrders");
const totalRevenueEl = document.getElementById("totalRevenue");
const ordersTableBody = document.getElementById("ordersTableBody");
const filterButtons = document.querySelectorAll(".filter-btn");
const logoutBtn = document.getElementById("logoutBtn");

// ================================
// Auth guard (simple local login)
// ================================
(function guard() {
    const isAuthed = localStorage.getItem("shams_admin_authed") === "1";
    const onLoginPage = window.location.pathname.includes("admin-login");
    if (!isAuthed && !onLoginPage) {
        window.location.href = "admin-login.html";
    }
})();

// ================================
// Helpers
// ================================
function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr || "";
    return d.toLocaleString();
}

function escapeHtml(str) {
    return String(str || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function calcStats(allOrders) {
    const totalOrders = allOrders.length;
    const pending = allOrders.filter((o) => (o.status || "pending") === "pending").length;
    const revenue = allOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    return { totalOrders, pending, revenue };
}

function getFilteredOrders() {
    if (currentFilter === "all") return orders;
    return orders.filter((o) => (o.status || "pending") === currentFilter);
}

// ================================
// Fetch orders from Netlify Function
// ================================
async function fetchOrders() {
    const res = await fetch("/.netlify/functions/get-orders", { cache: "no-store" });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed to load orders: ${res.status} - ${txt}`);
    }
    const data = await res.json();
    return Array.isArray(data.orders) ? data.orders : [];
}

// ================================
// Render
// ================================
function renderStats() {
    const { totalOrders, pending, revenue } = calcStats(orders);
    if (totalOrdersEl) totalOrdersEl.textContent = String(totalOrders);
    if (pendingOrdersEl) pendingOrdersEl.textContent = String(pending);
    if (totalRevenueEl) totalRevenueEl.textContent = `${revenue.toFixed(2)} EGP`;
}

function renderOrdersTable() {
    const list = getFilteredOrders();

    if (!ordersTableBody) return;

    if (!list.length) {
        ordersTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding: 20px; color:#aaa;">
          No orders found.
        </td>
      </tr>
    `;
        return;
    }

    ordersTableBody.innerHTML = list
        .map((order) => {
            const customerBlock = `
        <div style="display:flex; flex-direction:column; gap:6px;">
          <strong>${escapeHtml(order.customerName)}</strong>
          <span>${escapeHtml(order.customerPhone)}</span>
          <span>${escapeHtml(order.customerGov)}</span>
          <span style="color:#bbb;">${escapeHtml(order.customerAddress)}</span>
          <span style="color:#888; font-size:12px;">${escapeHtml(formatDate(order.date))}</span>
        </div>
      `;

            const itemsBlock = Array.isArray(order.orderItems)
                ? order.orderItems
                    .map(
                        (it) =>
                            `<div style="display:flex; justify-content:space-between; gap:10px;">
                  <span>${escapeHtml(it.name)} x${escapeHtml(it.qty)}</span>
                  <span>${Number(it.lineTotal || 0).toFixed(2)} EGP</span>
                </div>`
                    )
                    .join("")
                : "";

            const status = (order.status || "pending").toLowerCase();

            return `
        <tr>
          <td>${customerBlock}</td>
          <td>${itemsBlock}</td>
          <td><strong>${Number(order.total || 0).toFixed(2)} EGP</strong></td>
          <td>
            <span class="status-badge ${escapeHtml(status)}">${escapeHtml(status)}</span>
          </td>
          <td style="color:#888; font-size:12px;">
            Server (Netlify Forms)
          </td>
        </tr>
      `;
        })
        .join("");
}

// ================================
// Events
// ================================
filterButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter || "all";
        renderOrdersTable();
    });
});

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("shams_admin_authed");
        window.location.href = "admin-login.html";
    });
}

// ================================
// Init
// ================================
(async function init() {
    try {
        orders = await fetchOrders();
        renderStats();
        renderOrdersTable();
    } catch (e) {
        console.error(e);
        if (ordersTableBody) {
            ordersTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 20px; color:#ff5a5a;">
            Failed to load orders.
          </td>
        </tr>
      `;
        }
    }
})();
