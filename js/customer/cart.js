// ==========================================
// TRANG KHÁCH: GIỎ HÀNG
// ==========================================

const cartDrawer = document.getElementById("cartDrawer");
const cartDrawerBackdrop = document.getElementById("cartDrawerBackdrop");

function openCart() {
    renderCart();
    cartDrawer.classList.add("open");
    cartDrawerBackdrop.classList.add("open");
}

function closeCart() {
    cartDrawer.classList.remove("open");
    cartDrawerBackdrop.classList.remove("open");
}

document.getElementById("openCartBtn").addEventListener("click", (e) => {
    e.preventDefault();
    openCart();
});
document.getElementById("closeCartBtn").addEventListener("click", closeCart);
cartDrawerBackdrop.addEventListener("click", closeCart);

// Add to Cart Action
let pendingPurchase = null;

window.handlePendingPurchase = function () {
    if (pendingPurchase) {
        const prod = database.products.find(p => p.id === pendingPurchase.productId);
        if (prod) {
            const cartItem = {
                id: prod.id,
                name: prod.name,
                category: prod.category,
                price: prod.price,
                image: prod.image,
                size: pendingPurchase.size,
                color: pendingPurchase.color,
                quantity: 1
            };
            cart.push(cartItem);
            updateCartBadge();
            showCustomerToast("Đã tự động thêm vào giỏ hàng sau khi đăng nhập!");
            openCart();
        }
        pendingPurchase = null;
    }
};

document.getElementById("addToCartBtn").addEventListener("click", () => {
    if (!activeProduct) return;
    if (!selectedColor) {
        showCustomerToast("Vui lòng chọn màu sắc sản phẩm!", "error");
        return;
    }
    if (!selectedSize) {
        showCustomerToast("Vui lòng chọn kích thước sản phẩm!", "error");
        return;
    }

    // Check if user is logged in
    const currentUser = CustomerAuth.getCurrentUser();
    if (!currentUser) {
        pendingPurchase = {
            productId: activeProduct.id,
            color: selectedColor,
            size: selectedSize
        };
        showCustomerToast("Vui lòng đăng nhập để tiến hành đặt mua sản phẩm", "error");
        openAuthModal();
        return;
    }

    const cartItem = {
        id: activeProduct.id,
        name: activeProduct.name,
        category: activeProduct.category,
        price: activeProduct.price,
        image: activeProduct.image,
        size: selectedSize,
        color: selectedColor,
        quantity: 1
    };

    cart.push(cartItem);
    updateCartBadge();
    showCustomerToast(`Đã thêm vào giỏ hàng`);
    openCart();
});

// Detail Wishlist Action
document.getElementById("wishlistDetailBtn").addEventListener("click", () => {
    if (!activeProduct) return;
    toggleWishlist(activeProduct.id);
});

function updateCartBadge() {
    document.getElementById("cartBadgeCount").textContent = cart.length;
}

function renderCart() {
    const body = document.getElementById("cartDrawerBody");
    const checkoutSection = document.getElementById("checkoutSection");

    if (cart.length === 0) {
        body.innerHTML = '<p class="cart-empty-message">Giỏ hàng của bạn đang trống.</p>';
        checkoutSection.style.display = "none";
        return;
    }

    body.innerHTML = "";
    checkoutSection.style.display = "block";

    let totalSum = 0;

    cart.forEach((item, index) => {
        totalSum += item.price;

        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";

        let imgUrl = item.image;
        if (!imgUrl) {
            if (item.category === "pants") imgUrl = anglesPhotoDatabase["pants"][0];
            else if (item.category === "dress") imgUrl = anglesPhotoDatabase["dress"][0];
            else imgUrl = anglesPhotoDatabase["shirt"][0];
        }

        itemDiv.innerHTML = `
            <img class="cart-item-img" src="${imgUrl}" alt="${item.name}">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <span class="cart-item-variant">Size: ${item.size} | Màu: ${item.color}</span>
                <span class="cart-item-price">${formatPrice(item.price)}</span>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart(${index})" title="Xóa">&times;</button>
        `;
        body.appendChild(itemDiv);
    });

    document.getElementById("cartTotalSum").textContent = formatPrice(totalSum);

    // Auto-fill logged-in customer info
    const currentUser = CustomerAuth.getCurrentUser();
    if (currentUser) {
        const nameInput = document.getElementById("customerName");
        const phoneInput = document.getElementById("customerPhone");
        if (nameInput && !nameInput.value) nameInput.value = currentUser.displayName;
        if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phoneNumber || "";
    }
}

window.removeFromCart = function (index) {
    cart.splice(index, 1);
    updateCartBadge();
    renderCart();
};
