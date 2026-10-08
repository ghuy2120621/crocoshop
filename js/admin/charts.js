// ==========================================
// ADMIN: BIỂU ĐỒ & BÁO CÁO DOANH THU (Chart.js)
// Lưu ý: biểu đồ đường doanh thu đang dùng SỐ LIỆU MẪU (chưa tính từ đơn hàng thật).
// ==========================================

let revenueChartInstance = null;
let categoryChartInstance = null;
let miniCategoryChartInstance = null;

// Màu lưới/chữ của biểu đồ theo giao diện sáng/tối
function getChartTheme() {
    const isDark = !document.body.classList.contains("light-theme");
    return {
        gridColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        textColor: isDark ? "#94a3b8" : "#4b5563"
    };
}

// Hủy biểu đồ cũ để tránh lỗi "Canvas is already in use"
function destroyCharts() {
    [revenueChartInstance, categoryChartInstance, miniCategoryChartInstance].forEach(chart => {
        if (chart) {
            try { chart.destroy(); } catch (e) { }
        }
    });
    revenueChartInstance = null;
    categoryChartInstance = null;
    miniCategoryChartInstance = null;
}

function initRevenueCharts() {
    destroyCharts();

    const { gridColor, textColor } = getChartTheme();

    // 1. REVENUE LINE CHART
    const lineCtx = document.getElementById('revenueLineChart');
    if (lineCtx) {
        revenueChartInstance = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'],
                datasets: [{
                    label: 'Doanh thu',
                    data: [45, 62, 58, 85, 92, 110, 124.5],
                    borderColor: '#8b5cf6',
                    borderWidth: 3,
                    pointBackgroundColor: '#d946ef',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 7,
                    tension: 0.35,
                    fill: true,
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
                        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
                        return gradient;
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'Outfit' } }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, font: { family: 'Outfit' } }
                    }
                }
            }
        });
    }

    // 2. CATEGORY DONUT CHART (REVENUE REPORT TAB)
    const donutCtx = document.getElementById('categoryDonutChart');
    if (donutCtx) {
        categoryChartInstance = new Chart(donutCtx, {
            type: 'doughnut',
            data: getCategoryChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            font: { family: 'Outfit', size: 12 },
                            padding: 20
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    // 3. MINI CATEGORY DONUT CHART (OVERVIEW TAB)
    const miniCtx = document.getElementById('miniCategoryChart');
    if (miniCtx) {
        miniCategoryChartInstance = new Chart(miniCtx, {
            type: 'doughnut',
            data: getCategoryChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                cutout: '75%'
            }
        });
        updateMiniCategoryLegend();
    }
}

// Calculate percentages of sales based on category of stock (or mock weight sales)
function getCategoryChartData() {
    const categoriesVal = {
        shirt: 0, pants: 0, set: 0, dress: 0, skirt: 0,
        bikini: 0, sleepwear: 0, accessories: 0
    };
    database.products.forEach(p => {
        const cat = p.category;
        if (categoriesVal[cat] !== undefined) {
            categoriesVal[cat] += p.price * p.stock;
        } else {
            categoriesVal[cat] = p.price * p.stock;
        }
    });

    const catLabelsMap = {
        shirt: "Áo", pants: "Quần", set: "Set trang phục", dress: "Đầm", skirt: "Váy",
        bikini: "Bikini", sleepwear: "Bộ ngủ", accessories: "Phụ kiện"
    };

    const labels = [];
    const data = [];
    const backgroundColors = [];
    const colorsList = ['#8b5cf6', '#d946ef', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

    let colorIdx = 0;
    for (const key in categoriesVal) {
        if (categoriesVal[key] > 0 || ['shirt', 'pants', 'set', 'dress'].includes(key)) {
            labels.push(catLabelsMap[key] || key);
            data.push(categoriesVal[key]);
            backgroundColors.push(colorsList[colorIdx % colorsList.length]);
            colorIdx++;
        }
    }

    return {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: backgroundColors,
            borderWidth: 0,
            hoverOffset: 4
        }]
    };
}

function updateMiniCategoryLegend() {
    const legendEl = document.getElementById("miniCategoryLegend");
    if (!legendEl) return;

    const data = getCategoryChartData();
    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);

    legendEl.innerHTML = "";
    data.labels.forEach((label, index) => {
        const value = data.datasets[0].data[index];
        const percent = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
        const color = data.datasets[0].backgroundColor[index];

        const item = document.createElement("div");
        item.className = "legend-item";
        item.innerHTML = `
            <span class="legend-color" style="background-color: ${color}"></span>
            <span>${label} (${percent}%)</span>
        `;
        legendEl.appendChild(item);
    });
}

function updateChartsFromState() {
    if (categoryChartInstance) {
        categoryChartInstance.data = getCategoryChartData();
        categoryChartInstance.update();
    }
    if (miniCategoryChartInstance) {
        miniCategoryChartInstance.data = getCategoryChartData();
        miniCategoryChartInstance.update();
        updateMiniCategoryLegend();
    }
    updateRevenueReportValues();
}

function setReportCards(revenue, orderCount, avgOrderValue) {
    const repTotalRev = document.getElementById("report-total-revenue");
    const repTotalOrders = document.getElementById("report-total-orders");
    const repAvgOrder = document.getElementById("report-avg-order");

    if (repTotalRev) repTotalRev.textContent = formatPrice(revenue);
    if (repTotalOrders) repTotalOrders.textContent = orderCount;
    if (repAvgOrder && avgOrderValue !== null) repAvgOrder.textContent = formatPrice(avgOrderValue);
}

function updateRevenueReportValues() {
    const { count, revenue } = getCompletedOrdersStats();
    setReportCards(revenue, count, count > 0 ? Math.round(revenue / count) : 0);
}

function updateRevenueChart(labels, data) {
    if (!revenueChartInstance) return;

    const { gridColor, textColor } = getChartTheme();
    revenueChartInstance.data.labels = labels;
    revenueChartInstance.data.datasets[0].data = data;
    revenueChartInstance.options.scales.x.grid.color = gridColor;
    revenueChartInstance.options.scales.x.ticks.color = textColor;
    revenueChartInstance.options.scales.y.grid.color = gridColor;
    revenueChartInstance.options.scales.y.ticks.color = textColor;
    revenueChartInstance.update();
}

function updateCategoryDonutChart() {
    if (!categoryChartInstance) return;
    categoryChartInstance.options.plugins.legend.labels.color = getChartTheme().textColor;
    categoryChartInstance.update();
}

function updateMiniCategoryChart() {
    if (miniCategoryChartInstance) {
        miniCategoryChartInstance.update();
    }
}

// Lọc báo cáo theo 7 / 30 / 365 ngày (số liệu biểu đồ vẫn là dữ liệu mẫu)
function handleRevenueTimeRangeChange(days) {
    let labels, data;

    if (days === 7) {
        labels = ['Thứ 5', 'Thứ 6', 'Thứ 7', 'CN', 'Thứ 2', 'Thứ 3', 'Hôm nay'];
        data = [8.5, 12, 14.5, 9.0, 11.2, 16.8, 18.5]; // triệu VNĐ
    } else if (days === 30) {
        labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
        data = [42, 55, 48, 62.4];
    } else {
        labels = ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7'];
        data = [45, 62, 58, 85, 92, 110, 124.5];
    }
    updateRevenueChart(labels, data);

    // Tính lại các thẻ báo cáo theo hệ số của khoảng thời gian
    const multiplier = days === 7 ? 0.15 : (days === 30 ? 0.6 : 1);
    const { count, revenue } = getCompletedOrdersStats();
    setReportCards(
        Math.round(revenue * multiplier),
        Math.round(count * multiplier),
        count > 0 ? Math.round(revenue / count) : null
    );

    showToast(`Đã lọc báo cáo theo ${days} ngày qua`, "info");
}

// Các nút 7 ngày / 30 ngày / 365 ngày
function setupRevenueRangeButtons() {
    const rangeButtons = document.querySelectorAll(".time-filter-buttons button");
    rangeButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            rangeButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");

            const days = parseInt(e.target.getAttribute("data-range"));
            handleRevenueTimeRangeChange(days);
        });
    });
}
