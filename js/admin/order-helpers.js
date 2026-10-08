// ==========================================
// ADMIN: HÀM HỖ TRỢ ĐƠN HÀNG (trạng thái, tổng tiền, thống kê)
// Đơn mới lưu trạng thái tiếng Việt, đơn cũ lưu mã tiếng Anh -> luôn chuẩn hóa qua getStatusClass().
// ==========================================

function getStatusLabel(status) {
    if (ORDER_STATUSES.includes(status)) return status;
    return ORDER_STATUS_KEY_TO_LABEL[status] || status;
}

function getStatusClass(status) {
    if (ORDER_STATUS_KEY_TO_LABEL[status]) return status;
    return ORDER_STATUS_LABEL_TO_KEY[status] || "pending";
}

function getOrderTotal(order) {
    return Number(order.total) || Number(order.totalPrice) || 0;
}

function countOrdersByStatus(orders, statusKey) {
    return orders.filter(o => getStatusClass(o.status) === statusKey).length;
}

// Doanh thu & số đơn đã giao thành công
function getCompletedOrdersStats() {
    const completed = database.orders.filter(o => getStatusClass(o.status) === "shipped");
    return {
        count: completed.length,
        revenue: completed.reduce((sum, o) => sum + getOrderTotal(o), 0)
    };
}

function renderOrderItemsCell(items) {
    if (Array.isArray(items)) {
        return items.map(item => `<div>• <b>${escapeHtml(item.name || item.title)}</b> (x${item.quantity || 1})</div>`).join('');
    }
    if (typeof items === 'string') {
        return `<div>${escapeHtml(items)}</div>`;
    }
    return 'Không có thông tin sản phẩm';
}
