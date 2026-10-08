// ==========================================
// ADMIN: KHỞI ĐỘNG TRANG QUẢN TRỊ (file nạp CUỐI CÙNG)
// ==========================================

function initAdmin() {
    // Chỉ chạy khi đang ở trang admin
    if (!(document.getElementById("sidebar") || document.querySelector(".app-container"))) return;

    // 1. Bật đồng bộ realtime (sản phẩm + đơn hàng)
    startProductsSync();
    startOrdersSync();

    // 2. Điều hướng + sự kiện giao diện
    setupNavigation();
    setupSidebar();
    setupThemeToggle();
    setupProductForm();
    setupInventoryFilters();
    setupOrderFilters();
    setupRevenueRangeButtons();
    setupBannerListeners();

    // 3. Vẽ trạng thái ban đầu
    updateDashboardOverview();
    renderInventory();
    renderOrders();
    initRevenueCharts();
    displayCurrentDate();
    loadBannerSettingsAdmin();
}

if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initAdmin);
} else {
    initAdmin();
}

// Đồng bộ giữa các tab trình duyệt
window.addEventListener("storage", (e) => {
    if ((e.key === "fashion_shop_db" || e.key === "fashion_shop_db_updated") && e.newValue) {
        try {
            database = JSON.parse(localStorage.getItem("fashion_shop_db")) || initialDatabase;
            window.fashion_shop_db = database;
        } catch (err) {
            console.error("Lỗi đồng bộ storage:", err);
            return;
        }
        if (document.getElementById("inventory-table-body")) renderInventory();
        if (document.getElementById("admin-orders-tbody")) renderOrders();
        if (document.getElementById("kpi-revenue")) updateDashboardOverview();
        if (categoryChartInstance) updateChartsFromState();
    }
});
