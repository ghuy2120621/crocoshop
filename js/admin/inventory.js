// ==========================================
// ADMIN: QUẢN LÝ KHO (bảng sản phẩm, lọc, xóa)
// ==========================================

// Chuẩn hóa dữ liệu rồi vẽ bảng kho
function renderAdminProductsTable(allAdminProducts) {
    const safeProducts = normalizeProducts(allAdminProducts);

    database.products = safeProducts;
    if (window.fashion_shop_db) {
        window.fashion_shop_db.products = safeProducts;
    }
    safeSetLocalStorage("fashion_shop_db", JSON.stringify(database));

    renderInventory();
}

// ----- Các mảnh nhỏ dựng 1 dòng sản phẩm -----
function getCategoryLabel(category) {
    return CATEGORY_LABELS[category] || "Khác";
}

function renderSizePills(sizes) {
    return sizes.map(s => `<span class="size-pill">${escapeHtml(s)}</span>`).join("");
}

function renderColorDots(colors) {
    return colors.map(c => `<span class="color-dot ${COLOR_CLASSES[c] || "bg-white"}" title="${escapeHtml(c)}"></span>`).join("");
}

function getProductThumbnail(prod) {
    const own = (prod.images && prod.images.length > 0) ? prod.images[0] : prod.image;
    if (own) return own;
    const id = PLACEHOLDER_IMAGES[prod.category] || PLACEHOLDER_IMAGES.default;
    return `https://images.unsplash.com/${id}${PLACEHOLDER_IMAGE_SUFFIX}`;
}

function renderTagBadge(tag) {
    const badge = TAG_BADGES[tag];
    if (!badge) return "";
    return `<span style="font-size:0.65rem; padding: 0.1rem 0.35rem; border-radius:4px; font-weight:700; background-color:${badge.bg}; color:${badge.color}; margin-left:0.5rem; display:inline-block; vertical-align:middle; text-transform:uppercase;">${badge.label}</span>`;
}

const ICON_EDIT = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
const ICON_DELETE = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;

function buildInventoryRow(prod) {
    const tr = document.createElement("tr");
    const name = escapeHtml(prod.name);
    const idArg = escapeJsArg(prod.id);

    tr.innerHTML = `
        <td>
            <div class="product-info-cell">
                <img class="product-thumbnail" src="${getProductThumbnail(prod)}" alt="${name}">
                <div class="product-details">
                    <div style="display:flex; align-items:center;">
                        <span class="product-name">${name}</span>
                        ${renderTagBadge(prod.tag)}
                    </div>
                    <span class="text-muted" style="font-size:0.75rem">${escapeHtml(prod.id)}</span>
                </div>
            </div>
        </td>
        <td><strong>${getCategoryLabel(prod.category)}</strong></td>
        <td>${renderSizePills(prod.sizes)}</td>
        <td>
            <div class="color-dots-container">
                ${renderColorDots(prod.colors)}
            </div>
        </td>
        <td><strong>${formatPrice(prod.price)}</strong></td>
        <td><span style="font-weight:600; color: ${prod.stock < 30 ? 'var(--color-red)' : 'inherit'}">${prod.stock} cái</span></td>
        <td>
            <div class="actions-cell">
                <button class="btn-icon edit" onclick="openEditProductModal('${idArg}')" title="Sửa sản phẩm">${ICON_EDIT}</button>
                <button class="btn-icon delete btn-delete" onclick="deleteProduct('${idArg}')" title="Xóa sản phẩm">${ICON_DELETE}</button>
            </div>
        </td>
    `;
    return tr;
}

// ----- Vẽ bảng kho (có lọc theo ô tìm kiếm + danh mục) -----
function renderInventory() {
    const tbody = document.getElementById("inventory-table-body");
    const footer = document.getElementById("inventory-table-footer");
    if (!tbody) return;

    tbody.innerHTML = "";

    const searchInput = document.getElementById("inventorySearch");
    const categoryFilter = document.getElementById("inventoryCategoryFilter");
    const searchVal = searchInput ? searchInput.value.toLowerCase() : "";
    const catVal = categoryFilter ? categoryFilter.value : "all";

    const filteredProducts = database.products.filter(prod => {
        const matchesSearch = prod.name.toLowerCase().includes(searchVal) || prod.id.toLowerCase().includes(searchVal);
        const matchesCategory = catVal === "all" || prod.category === catVal;
        return matchesSearch && matchesCategory;
    });

    if (filteredProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-secondary" style="text-align: center; padding: 2rem;">Không tìm thấy sản phẩm nào khớp bộ lọc</td></tr>`;
        if (footer) footer.textContent = "Hiển thị 0 của 0 sản phẩm";
        return;
    }

    filteredProducts.forEach(prod => tbody.appendChild(buildInventoryRow(prod)));

    if (footer) {
        footer.textContent = `Hiển thị ${filteredProducts.length} trên tổng số ${database.products.length} sản phẩm`;
    }
}

// Ô tìm kiếm + bộ lọc danh mục
function setupInventoryFilters() {
    const inventorySearch = document.getElementById("inventorySearch");
    if (inventorySearch) {
        inventorySearch.addEventListener("input", renderInventory);
    }
    const inventoryCategoryFilter = document.getElementById("inventoryCategoryFilter");
    if (inventoryCategoryFilter) {
        inventoryCategoryFilter.addEventListener("change", renderInventory);
    }
}

// --- DELETE PRODUCT ---
window.deleteProduct = function (productId) {
    if (!productId) {
        alert("Lỗi: Không tìm thấy ID sản phẩm để xóa!");
        return;
    }

    if (confirm("Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này không?")) {
        if (isFirebaseEnabled) {
            // Gửi lệnh xóa trực tiếp lên Firebase Realtime Database
            firebase.database().ref('products/' + productId).remove()
                .then(() => {
                    alert("Đã xóa sản phẩm thành công!");
                    // Giao diện sẽ tự động cập nhật ngay lập tức nhờ hàm lắng nghe .on('value')
                })
                .catch((error) => {
                    console.error("Lỗi khi xóa sản phẩm:", error);
                    alert("Lỗi khi xóa sản phẩm: " + error.message);
                });
        } else {
            // Fallback offline
            database.products = database.products.filter(p => p.id !== productId);
            saveDatabase();
            renderInventory();
            updateDashboardOverview();
            if (typeof updateChartsFromState === "function") updateChartsFromState();
            alert("Đã xóa sản phẩm thành công (chế độ offline)!");
        }
    }
};
