// ==========================================
// TRANG KHÁCH: KHỞI ĐỘNG (file nạp CUỐI CÙNG)
// ==========================================

const initHarness = () => {
    // 1. Dữ liệu realtime
    loadBannerSettings();
    loadCustomerProducts();   // reset bộ lọc + bật đồng bộ sản phẩm
    startOrdersSync();        // PHẢI gọi trước startCustomerOrdersListener()
    startCustomerOrdersListener();

    // 2. Thành phần giao diện
    try {
        updateHeaderAccount();
    } catch (err) {
        console.error("Lỗi updateHeaderAccount:", err);
    }

    try {
        updateWishlistBadge();
    } catch (err) {
        console.error("Lỗi updateWishlistBadge:", err);
    }

    // 3. Điều hướng theo #hash trên URL
    try {
        const hash = window.location.hash;
        if (hash && hash.startsWith("#product-")) {
            openProductDetail(hash.replace("#product-", ""));
        } else if (hash === "#orders") {
            showMyOrdersSection(null);
        }
    } catch (err) {
        console.error("Lỗi routing hash:", err);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHarness);
} else {
    initHarness();
}

window.addEventListener("hashchange", () => {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#product-")) {
        const id = hash.replace("#product-", "");
        openProductDetail(id);
    } else if (hash === "#orders") {
        showMyOrdersSection(null);
    } else {
        showCatalog(null);
    }
});

// Listening to storage changes from admin side (e.g. if admin adds products)
window.addEventListener("storage", (e) => {
    if (e.key === "fashion_shop_db" && e.newValue) {
        try {
            const parsed = JSON.parse(e.newValue);
            if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.orders)) {
                database = parsed;
                if (!activeProduct) {
                    loadCatalog();
                }
            }
        } catch (err) {
            console.error("Lỗi đồng bộ storage:", err);
        }
    }
});
