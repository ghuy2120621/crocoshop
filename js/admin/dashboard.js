// ==========================================
// ADMIN: TỔNG QUAN (KPI + đơn hàng gần đây)
// ==========================================

// Vẽ lại toàn bộ trang quản trị khi dữ liệu thay đổi
function renderAdminDashboard() {
    updateDashboardOverview();
    renderInventory();
    renderOrders();
    initRevenueCharts();
}

function updateDashboardOverview() {
    const orders = database.orders;
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    // 1. KPI
    setText("kpi-revenue", formatPrice(getCompletedOrdersStats().revenue));
    setText("kpi-orders", orders.length - countOrdersByStatus(orders, "cancelled"));

    const totalStockVal = database.products.reduce((sum, prod) => sum + (Number(prod.stock) || 0), 0);
    setText("kpi-stock", totalStockVal.toLocaleString('vi-VN') + " cái");

    const cancelledCount = countOrdersByStatus(orders, "cancelled");
    const cancelledRate = orders.length > 0 ? ((cancelledCount / orders.length) * 100).toFixed(1) : 0;
    setText("kpi-cancelled", `${cancelledRate}%`);

    // Huy hiệu số đơn chờ xác nhận ở sidebar
    const pendingCount = countOrdersByStatus(orders, "pending");
    const badge = document.getElementById("order-badge");
    if (badge) {
        badge.textContent = pendingCount;
        badge.style.display = pendingCount > 0 ? "block" : "none";
    }

    // 2. Bảng 4 đơn gần nhất
    const recentOrdersBody = document.getElementById("recent-orders-table-body");
    if (recentOrdersBody) {
        recentOrdersBody.innerHTML = [...orders].reverse().slice(0, 4).map(order => `
            <tr>
                <td><strong>#${escapeHtml(order.id)}</strong></td>
                <td>${escapeHtml(order.customer || order.customerName)}</td>
                <td><span class="text-secondary" style="font-size:0.85rem">${renderOrderItemsCell(order.items)}</span></td>
                <td>${formatPrice(getOrderTotal(order))}</td>
                <td><span class="status-badge ${getStatusClass(order.status)}">${escapeHtml(getStatusLabel(order.status))}</span></td>
            </tr>
        `).join("");
    }
}
