// ==========================================
// ADMIN: ĐIỀU HƯỚNG TAB (Tổng quan / Kho / Đơn hàng / Doanh thu / Banner)
// ==========================================

function setupNavigation() {
    const menuItems = document.querySelectorAll(".sidebar-menu-item");
    const pageTitle = document.getElementById("pageTitle");

    menuItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();

            menuItems.forEach(m => m.classList.remove("active"));
            item.classList.add("active");

            const tabId = item.getAttribute("data-tab");

            // Hiện đúng tab, ẩn các tab còn lại
            document.querySelectorAll(".tab-content").forEach(pane => {
                const isTarget = pane.id === tabId;
                pane.classList.toggle("active", isTarget);
                pane.style.display = isTarget ? 'block' : 'none';
            });

            // Nạp dữ liệu cho tab vừa mở
            if (tabId === "inventory") {
                const categorySelect = document.getElementById("inventoryCategoryFilter");
                if (categorySelect) categorySelect.value = "all";
                renderAdminProductsTable(database.products || []);
            } else if (tabId === "overview") {
                updateDashboardOverview();
                initRevenueCharts();
            } else if (tabId === "orders") {
                initAdminOrders();
            } else if (tabId === "banner") {
                loadBannerSettingsAdmin();
            }

            // Tiêu đề trang
            if (pageTitle && TAB_TITLES[tabId]) {
                pageTitle.textContent = TAB_TITLES[tabId];
            }

            // Đóng sidebar mobile nếu đang mở
            const container = document.querySelector(".app-container");
            if (container) container.classList.remove("sidebar-open");
        });
    });
}

// Chuyển tab bằng code (vd: nút "Xem tất cả" ở tổng quan)
function switchTab(tabId) {
    const targetMenuItem = document.querySelector(`.sidebar-menu-item[data-tab="${tabId}"]`);
    if (targetMenuItem) targetMenuItem.click();
}
