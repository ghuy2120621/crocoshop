// ==========================================
// ADMIN: BỐ CỤC (Sidebar, Giao diện sáng/tối, Ngày hiện tại)
// ==========================================

function displayCurrentDate() {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const months = ['Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu', 'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'];

    const now = new Date();
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();

    const dateStr = `${dayName}, ${day} ${monthName}, ${year}`;
    const dateDisplay = document.getElementById("dateDisplay");
    if (dateDisplay) dateDisplay.textContent = dateStr;
}

// Thu gọn sidebar (desktop) + menu hamburger (mobile)
function setupSidebar() {
    const toggleSidebar = document.getElementById("toggleSidebar");
    const container = document.querySelector(".app-container");
    if (toggleSidebar && container) {
        toggleSidebar.addEventListener("click", () => {
            container.classList.toggle("sidebar-collapsed");
        });
    }

    // Hamburger menu toggle (mobile drawer)
    const hamburgerMenu = document.getElementById("hamburgerMenu");
    if (hamburgerMenu && container) {
        hamburgerMenu.addEventListener("click", (e) => {
            e.stopPropagation();
            container.classList.toggle("sidebar-open");
        });
    }

    // Close sidebar on mobile when clicking outside
    document.addEventListener("click", (e) => {
        if (container && container.classList.contains("sidebar-open") && !e.target.closest("#sidebar") && !e.target.closest("#hamburgerMenu")) {
            container.classList.remove("sidebar-open");
        }
    });
}

// Nút chuyển giao diện sáng/tối (vẽ lại biểu đồ cho đúng màu)
function setupThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    const sunIcon = document.querySelector(".sun-icon");
    const moonIcon = document.querySelector(".moon-icon");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("light-theme");
            sunIcon.classList.toggle("hidden");
            moonIcon.classList.toggle("hidden");

            // Re-render charts to adjust styles for light/dark theme
            if (revenueChartInstance) {
                const currentData = revenueChartInstance.data.datasets[0].data;
                const currentLabels = revenueChartInstance.data.labels;
                updateRevenueChart(currentLabels, currentData);
            }
            if (categoryChartInstance) {
                updateCategoryDonutChart();
            }
            if (miniCategoryChartInstance) {
                updateMiniCategoryChart();
            }

            showToast("Đã chuyển đổi giao diện", "info");
        });
    }
}
