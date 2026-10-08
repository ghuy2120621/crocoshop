// ==========================================
// HÀM TIỆN ÍCH DÙNG CHUNG
// ==========================================

// Định dạng tiền VNĐ
function formatPrice(number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
}

// Chống chèn mã độc (XSS) khi đưa dữ liệu người dùng nhập vào innerHTML
function escapeHtml(value) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(value ?? "").replace(/[&<>"']/g, ch => map[ch]);
}

// Dùng khi nhúng giá trị vào thuộc tính onclick="fn('...')"
function escapeJsArg(value) {
    return escapeHtml(String(value ?? "").replace(/\\/g, "\\\\").replace(/'/g, "\\'"));
}
