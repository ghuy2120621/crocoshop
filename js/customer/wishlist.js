// ==========================================
// TRANG KHÁCH: DANH SÁCH YÊU THÍCH (trạng thái + ngăn kéo bên trái)
// ==========================================

// --- WISHLIST STATE & ACTIONS ---
let wishlist = [];
try {
    wishlist = JSON.parse(localStorage.getItem("wishlist_products")) || [];
} catch (e) {
    console.error("Error parsing wishlist:", e);
    wishlist = [];
}

function updateWishlistBadge() {
    const badge = document.getElementById("wishlistBadgeCount");
    if (badge) {
        badge.textContent = wishlist.length;
        badge.style.display = wishlist.length > 0 ? "block" : "none";
    }
}

function toggleWishlist(prodId) {
    const index = wishlist.indexOf(prodId);
    if (index > -1) {
        wishlist.splice(index, 1);
        showCustomerToast("Đã xóa khỏi danh sách yêu thích", "info");
    } else {
        wishlist.push(prodId);
        showCustomerToast("Đã thêm vào danh sách yêu thích");
    }
    localStorage.setItem("wishlist_products", JSON.stringify(wishlist));
    loadCatalog(); // Re-render lists to update active heart states
    updateWishlistBadge(); // Sync header badge!

    // Re-render Wishlist drawer if open
    const wishlistDrawer = document.getElementById("wishlistDrawer");
    if (wishlistDrawer && wishlistDrawer.classList.contains("open")) {
        renderWishlist();
    }

    // If the active product detail page is open for this product, sync it too
    if (activeProduct && activeProduct.id === prodId) {
        const wishlistDetailBtn = document.getElementById("wishlistDetailBtn");
        if (wishlistDetailBtn) {
            if (wishlist.includes(prodId)) {
                wishlistDetailBtn.classList.add("active");
            } else {
                wishlistDetailBtn.classList.remove("active");
            }
        }
    }
}

// --- WISHLIST DRAWER SYSTEM ---
const wishlistDrawer = document.getElementById("wishlistDrawer");
const wishlistDrawerBackdrop = document.getElementById("wishlistDrawerBackdrop");

function openWishlist() {
    wishlistDrawer.classList.add("open");
    wishlistDrawerBackdrop.classList.add("open");
    renderWishlist();
}

function closeWishlist() {
    wishlistDrawer.classList.remove("open");
    wishlistDrawerBackdrop.classList.remove("open");
}

document.getElementById("openWishlistBtn").addEventListener("click", (e) => {
    e.preventDefault();
    openWishlist();
});

document.getElementById("closeWishlistBtn").addEventListener("click", closeWishlist);
wishlistDrawerBackdrop.addEventListener("click", closeWishlist);

function renderWishlist() {
    const body = document.getElementById("wishlistDrawerBody");
    if (wishlist.length === 0) {
        body.innerHTML = '<p class="cart-empty-message">Danh sách yêu thích đang trống.</p>';
        return;
    }

    body.innerHTML = "";
    wishlist.forEach(prodId => {
        const prod = database.products.find(p => p.id === prodId);
        if (!prod) return;

        const itemDiv = document.createElement("div");
        itemDiv.className = "wishlist-item";

        let imgUrl = (prod.images && prod.images.length > 0) ? prod.images[0] : prod.image;
        if (!imgUrl) {
            if (prod.category === "pants") imgUrl = anglesPhotoDatabase["pants"][0];
            else if (prod.category === "dress") imgUrl = anglesPhotoDatabase["dress"][0];
            else if (prod.category === "aodai") imgUrl = anglesPhotoDatabase["dress"][0];
            else imgUrl = anglesPhotoDatabase["shirt"][0];
        }

        // Sizing dropdown options
        const sizeOptions = prod.sizes.map(s => `<option value="${s}">${s}</option>`).join("");

        // Color dropdown options
        const colorMetaMap = {
            "Black": "Đen", "White": "Trắng", "Beige": "Be/Kem",
            "Blue": "Xanh dương", "Pink": "Hồng", "Green": "Xanh lá", "Red": "Đỏ"
        };
        const colorOptions = prod.colors.map(c => {
            const label = colorMetaMap[c] || c;
            return `<option value="${label}">${label}</option>`;
        }).join("");

        itemDiv.innerHTML = `
            <img class="wishlist-item-img" src="${imgUrl}" alt="${prod.name}">
            <div class="wishlist-item-info">
                <h4 class="wishlist-item-name">${prod.name}</h4>
                <span class="wishlist-item-price">${formatPrice(prod.price)}</span>
                <div class="wishlist-item-selectors">
                    <select class="wishlist-selector size-select" id="wl-size-${prod.id}">
                        ${sizeOptions}
                    </select>
                    <select class="wishlist-selector color-select" id="wl-color-${prod.id}">
                        ${colorOptions}
                    </select>
                </div>
                <button class="wishlist-buy-btn" onclick="buyFromWishlist('${prod.id}')">Mua Ngay</button>
            </div>
            <button class="wishlist-remove-btn" onclick="toggleWishlist('${prod.id}')" title="Xóa">&times;</button>
        `;
        body.appendChild(itemDiv);
    });
}

window.buyFromWishlist = function (prodId) {
    const prod = database.products.find(p => p.id === prodId);
    if (!prod) return;

    const sizeVal = document.getElementById(`wl-size-${prodId}`).value;
    const colorVal = document.getElementById(`wl-color-${prodId}`).value;

    // Check authentication before buying
    const currentUser = CustomerAuth.getCurrentUser();
    if (!currentUser) {
        pendingPurchase = {
            productId: prod.id,
            color: colorVal,
            size: sizeVal
        };
        showCustomerToast("Vui lòng đăng nhập để tiến hành đặt mua sản phẩm", "error");
        closeWishlist();
        openAuthModal();
        return;
    }

    // Add to cart directly
    const cartItem = {
        id: prod.id,
        name: prod.name,
        category: prod.category,
        price: prod.price,
        image: prod.image,
        size: sizeVal,
        color: colorVal,
        quantity: 1
    };

    cart.push(cartItem);
    updateCartBadge();
    showCustomerToast(`Đã thêm vào giỏ hàng`);
    closeWishlist();
    openCart();
};
