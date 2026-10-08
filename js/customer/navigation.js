// ==========================================
// TRANG KHÁCH: MENU ĐIỀU HƯỚNG & BỘ LỌC DANH MỤC (tạo động từ sản phẩm)
// ==========================================

function getCategoryDisplayName(cat) {
    if (!cat) return "Khác";
    const lower = cat.toLowerCase().trim();
    if (categoryLabels[lower]) {
        return categoryLabels[lower];
    }
    // Fallback: capitalize first letter
    return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function renderDynamicNavigation() {
    // 1. Gather all unique categories present in the products list
    const uniqueCategories = [];
    if (database && Array.isArray(database.products)) {
        database.products.forEach(p => {
            if (p.category) {
                const normalized = p.category.toLowerCase().trim();
                if (!uniqueCategories.includes(normalized)) {
                    uniqueCategories.push(normalized);
                }
            }
        });
    }

    // Check if active parent subcategory
    let activeParentCategory = "";
    if (currentFilterSubCategory !== "all") {
        for (const cat in subCategoryLookup) {
            if (subCategoryLookup[cat] && subCategoryLookup[cat][currentFilterSubCategory] !== undefined) {
                activeParentCategory = cat.toLowerCase().trim();
                break;
            }
        }
    }

    // 2. Render filter buttons in category-filter-bar
    const filterBar = document.getElementById("categoryFilterBar");
    if (filterBar) {
        const isAllActive = (currentFilterCategory === 'all' && currentFilterSubCategory === 'all') ||
            ["best-seller", "new-in", "trending"].includes(currentFilterCategory);
        let html = `<button class="filter-tab ${isAllActive ? 'active' : ''}" id="tab-all" onclick="setFilter(event, 'all')">TẤT CẢ</button>`;
        uniqueCategories.forEach(cat => {
            const label = getCategoryDisplayName(cat).toUpperCase();
            const isCatActive = (currentFilterCategory.toLowerCase().trim() === cat) || (activeParentCategory === cat);
            html += `<button class="filter-tab ${isCatActive ? 'active' : ''}" id="tab-${cat}" onclick="setFilter(event, '${cat}')">${label}</button>`;
        });
        filterBar.innerHTML = html;
    }

    // 3. Render links in header nav-menu
    const navMenu = document.getElementById("navMenu");
    if (navMenu) {
        // Keep the first 3 static containers: TRANG CHỦ, BÁN CHẠY, and ĐƠN HÀNG
        const staticContainers = Array.from(navMenu.querySelectorAll(".nav-item-container")).slice(0, 3);
        navMenu.innerHTML = "";
        staticContainers.forEach(container => navMenu.appendChild(container));

        // Append the dynamic categories
        uniqueCategories.forEach(cat => {
            const label = getCategoryDisplayName(cat).toUpperCase();
            const isCatActive = (currentFilterCategory.toLowerCase().trim() === cat) || (activeParentCategory === cat);
            const container = document.createElement("div");
            container.className = "nav-item-container";

            const subCats = subCategoryLookup[cat];
            if (subCats && Object.keys(subCats).length > 0) {
                // If subcategories exist, render a mega menu
                let subHtml = "";
                for (const key in subCats) {
                    subHtml += `<li><a href="#" onclick="setFilter(event, '${key}', true)">${subCats[key]}</a></li>`;
                }
                container.innerHTML = `
                    <a href="#" onclick="setFilter(event, '${cat}')" class="nav-link ${isCatActive ? 'active' : ''}">${label}</a>
                    <div class="mega-menu">
                        <div class="mega-menu-content">
                            <div class="mega-col">
                                <h4>Hàng Mới Về</h4>
                                <ul>
                                    <li><a href="#" onclick="setFilter(event, '${cat}')">XEM TẤT CẢ ${label}</a></li>
                                    <li><a href="#" onclick="setFilter(event, 'new-in')">Hàng mới về tháng này</a></li>
                                </ul>
                            </div>
                            <div class="mega-col">
                                <h4>Phân loại chi tiết</h4>
                                <ul class="two-columns">
                                    ${subHtml}
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Plain navigation link
                container.innerHTML = `
                    <a href="#" onclick="setFilter(event, '${cat}')" class="nav-link ${isCatActive ? 'active' : ''}">${label}</a>
                `;
            }
            navMenu.appendChild(container);
        });
    }
}
