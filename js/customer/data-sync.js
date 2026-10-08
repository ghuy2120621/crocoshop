// ==========================================
// TRANG KHÁCH: NẠP DỮ LIỆU (sản phẩm, đơn hàng realtime)
// Phần kéo dữ liệu từ Firebase dùng chung nằm ở js/shared/products-sync.js
// ==========================================

function renderCategorySliders(allProducts) {
    database.products = allProducts;
    if (window.fashion_shop_db) {
        window.fashion_shop_db.products = allProducts;
    }
    if (typeof renderHomepageProducts === "function") {
        renderHomepageProducts();
    }
}
window.renderCategorySliders = renderCategorySliders;

function renderCategoryNav(allProducts) {
    database.products = allProducts;
    if (window.fashion_shop_db) {
        window.fashion_shop_db.products = allProducts;
    }
    if (typeof renderDynamicNavigation === "function") {
        renderDynamicNavigation();
    }
}
window.renderCategoryNav = renderCategoryNav;

// Mở trang chủ luôn ở trạng thái "Tất cả" (không dính bộ lọc ẩn) rồi bật đồng bộ sản phẩm
function loadCustomerProducts() {
    window.activeCategory = 'all';
    currentFilterCategory = 'all';
    currentFilterSubCategory = 'all';
    startProductsSync();
}

// Khi đơn hàng thay đổi trên Firebase -> vẽ lại mục "Đơn hàng của tôi" nếu đang mở.
// (database.orders đã được startOrdersSync() cập nhật trước, vì listener đó đăng ký trước.)
let isCustomerOrdersListenerStarted = false;
function startCustomerOrdersListener() {
    if (!isFirebaseEnabled || isCustomerOrdersListenerStarted) return;
    isCustomerOrdersListenerStarted = true;

    firebase.database().ref('orders').on('value', () => {
        const myOrdersSection = document.getElementById("my-orders-section");
        if (myOrdersSection && myOrdersSection.style.display !== "none") {
            renderMyOrders();
        }
    }, (error) => {
        console.error("Lỗi lấy dữ liệu đơn hàng từ Firebase:", error);
    });
}
