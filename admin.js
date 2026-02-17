// Credentials
const ADMIN_CREDENTIALS = {
    email: 'mostafahmed_46455@icloud.com',
    password: 'mostafashams'
};

// Product Data Fallback (for older orders without image paths)
const PRODUCTS_REGISTRY = {
    'paradise': 'assets/images/perfumes/paradise.jpg',
    'lunara': 'assets/images/perfumes/lunara.jpg',
    'sigma': 'assets/images/perfumes/sigma.jpg',
    'blaze': 'assets/images/perfumes/blaze.jpg',
    'shadow-spice': 'assets/images/perfumes/shadow-spice.jpg',
    'pink-aura': 'assets/images/perfumes/pink-aura.jpg'
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle Login
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPass').value;
            const error = document.getElementById('loginError');

            if (email === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.password) {
                localStorage.setItem('shams_admin_session', 'true');
                window.location.href = 'admin.html';
            } else {
                error.style.display = 'block';
                error.textContent = 'Invalid email or password.';
            }
        };
    }

    // 2. Dashboard Logic
    if (window.location.pathname.includes('admin.html')) {
        checkAuth();
        loadOrders();
        setupFilters();
    }
});

function checkAuth() {
    if (localStorage.getItem('shams_admin_session') !== 'true') {
        window.location.href = 'admin-login.html';
    }
}

function logout() {
    localStorage.removeItem('shams_admin_session');
    window.location.href = 'admin-login.html';
}

function loadOrders(filter = 'all') {
    const ordersContainer = document.getElementById('ordersTableBody');
    if (!ordersContainer) return;

    // Load from localStorage for now
    const orders = JSON.parse(localStorage.getItem('shams_all_orders') || '[]');

    // Sort by date desc
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter
    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    // Render Stats
    updateStats(orders);

    if (filtered.length === 0) {
        ordersContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 4rem; color: #666;">No orders found.</td></tr>';
        return;
    }

    ordersContainer.innerHTML = filtered.map(order => `
        <tr onclick="viewOrderDetails('${order.id}')">
            <td>
                <div class="customer-info">
                    <span class="name">${order.customerName}</span>
                    <span class="details">${order.customerPhone}</span>
                    <span class="details">${order.customerGov}</span>
                </div>
            </td>
            <td>
                <ul class="order-items-list">
                    ${order.orderItems.map(item => `<li>• ${item.name} x${item.qty}</li>`).join('')}
                </ul>
            </td>
            <td>
                <strong>${order.total.toFixed(2)} EGP</strong>
            </td>
            <td>
                <span class="status-badge status-${order.status}">${order.status}</span>
            </td>
            <td>
                ${order.status === 'pending' ?
            `<button class="action-btn" onclick="event.stopPropagation(); updateOrderStatus('${order.id}', 'completed')">Mark Done</button>` :
            `<button class="action-btn" onclick="event.stopPropagation(); updateOrderStatus('${order.id}', 'pending')">Restore</button>`
        }
            </td>
        </tr>
    `).join('');
}

function updateStats(orders) {
    const totalOrders = document.getElementById('statTotalOrders');
    const pendingOrders = document.getElementById('statPendingOrders');
    const totalRevenue = document.getElementById('statTotalRevenue');

    if (totalOrders) totalOrders.textContent = orders.length;
    if (pendingOrders) pendingOrders.textContent = orders.filter(o => o.status === 'pending').length;
    if (totalRevenue) {
        const rev = orders.reduce((sum, o) => sum + o.total, 0);
        totalRevenue.textContent = rev.toFixed(2) + ' EGP';
    }
}

function updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('shams_all_orders') || '[]');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
        orders[idx].status = newStatus;
        localStorage.setItem('shams_all_orders', JSON.stringify(orders));
        loadOrders(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
    }
}

function setupFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        btn.onclick = () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadOrders(btn.dataset.filter);
        };
    });
}

// Order Details Modal Logic
const modal = document.getElementById('orderModalOverlay');
const closeBtn = document.getElementById('closeOrderModal');
const content = document.getElementById('orderDetailsContent');

if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
if (modal) {
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('active');
    };
}

function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('shams_all_orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    content.innerHTML = `
        <div class="details-grid">
            <div class="detail-section">
                <h4>Customer</h4>
                <p><strong>${order.customerName}</strong></p>
                <p>${order.customerPhone}</p>
                <p>${order.customerEmail || 'No email provided'}</p>
            </div>
            <div class="detail-section">
                <h4>Order Info</h4>
                <p># ${order.id}</p>
                <p>${new Date(order.date).toLocaleString('en-GB')}</p>
                <p><span class="status-badge status-${order.status}">${order.status}</span></p>
            </div>
            <div class="detail-section full-address">
                <h4>Shipping Address</h4>
                <p><strong>${order.customerGov}</strong></p>
                <p>${order.customerAddress}</p>
            </div>
        </div>

        <div class="modal-items-list">
            <h4>Products in Order</h4>
            ${order.orderItems.map(item => {
        const imgPath = item.image || PRODUCTS_REGISTRY[item.id] || 'assets/images/placeholder.jpg';
        return `
                <div class="modal-item">
                    <img src="${imgPath}" class="modal-item-img" alt="${item.name}">
                    <div class="modal-item-info">
                        <span class="modal-item-name">${item.name}</span>
                        <span class="modal-item-meta">${item.qty} x ${item.price.toFixed(2)} EGP</span>
                    </div>
                    <div class="modal-item-total">
                        ${(item.price * item.qty).toFixed(2)} EGP
                    </div>
                </div>
            `;
    }).join('')}
        </div>

        <div class="modal-summary">
            <div class="summary-line">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)} EGP</span>
            </div>
            <div class="summary-line">
                <span>Shipping</span>
                <span>${order.shipping === 0 ? 'FREE' : order.shipping.toFixed(2) + ' EGP'}</span>
            </div>
            <div class="summary-line total">
                <span>TOTAL AMOUNT</span>
                <span>${order.total.toFixed(2)} EGP</span>
            </div>
        </div>
        
        <div style="margin-top: 2rem; display: flex; gap: 1rem;">
             ${order.status === 'pending' ?
            `<button class="action-btn" style="background: var(--status-completed); border: none; flex: 1; padding: 1rem;" onclick="updateOrderStatus('${order.id}', 'completed'); modal.classList.remove('active');">Mark Completed</button>` :
            `<button class="action-btn" style="flex: 1; padding: 1rem;" onclick="updateOrderStatus('${order.id}', 'pending'); modal.classList.remove('active');">Restore to Pending</button>`
        }
        </div>
    `;

    modal.classList.add('active');
}
