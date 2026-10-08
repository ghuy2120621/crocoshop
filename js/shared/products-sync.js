// ==========================================
// ĐỒNG BỘ REALTIME: SẢN PHẨM + ĐƠN HÀNG (Firebase -> database)
// KHÔNG tự chạy khi nạp file. Trang nào cũng gọi startProductsSync() / startOrdersSync()
// trong main.js SAU KHI đã nạp xong mọi file, để lần render đầu tiên không bị bỏ lỡ.
// ==========================================

// Cập nhật database.products rồi vẽ lại giao diện (Admin & Khách)
function renderProducts(productsArray) {
    const safeProducts = normalizeProducts(productsArray);

    database.products = safeProducts;
    if (window.fashion_shop_db) {
        window.fashion_shop_db.products = safeProducts;
    }
    safeSetLocalStorage("fashion_shop_db", JSON.stringify(database));
    console.log("Firebase sync: updated products database (Safe mapped).");

    // Các hàm dưới đây chỉ tồn tại ở trang tương ứng (Admin hoặc Khách)
    if (typeof renderAdminDashboard === "function") renderAdminDashboard();
    if (typeof renderDynamicNavigation === "function") renderDynamicNavigation();
    if (typeof renderHomepageProducts === "function") renderHomepageProducts();
    if (typeof loadCatalog === "function") loadCatalog();
}

let isProductsSyncStarted = false;
function startProductsSync() {
    if (isProductsSyncStarted) return;
    isProductsSyncStarted = true;

    const applyProducts = (items) => {
        window.allProducts = items;
        window.allAdminProducts = items;

        renderProducts(items);
        if (typeof renderCategorySliders === 'function') renderCategorySliders(items);
        if (typeof renderAdminProductsTable === 'function') renderAdminProductsTable(items);
    };

    if (isFirebaseEnabled) {
        console.log("Đang kết nối Firebase Realtime Database...");
        firebase.database().ref('products').on('value', (snapshot) => {
            const items = firebaseToProductList(snapshot.val());
            console.log(`Dữ liệu Firebase nhận được: ${items.length} sản phẩm`);
            applyProducts(items);
        }, (error) => {
            console.error("Lỗi kết nối Firebase:", error);
        });
    } else {
        // Fallback offline (không bật Firebase)
        let products = [];
        try {
            const localData = localStorage.getItem("fashion_shop_db");
            if (localData) products = JSON.parse(localData).products || [];
        } catch (e) {
            console.error(e);
        }
        applyProducts(products);
    }
}

let isOrdersSyncStarted = false;
function startOrdersSync() {
    if (isOrdersSyncStarted) return;
    isOrdersSyncStarted = true;

    if (isFirebaseEnabled) {
        firebase.database().ref('orders').on('value', snapshot => {
            try {
                const val = snapshot.val();
                window.firebaseOrders = val || {};

                const ordersArray = firebaseToOrderList(val);
                database.orders = ordersArray;
                window.fashion_shop_db.orders = ordersArray;
                safeSetLocalStorage("fashion_shop_db", JSON.stringify(database));
                console.log("Đã kéo mảng orders thành công từ Firebase (Realtime Sync).");

                if (typeof renderAdminDashboard === "function") renderAdminDashboard();
            } catch (e) {
                console.error("Lỗi xử lý kéo orders từ Firebase:", e);
            }
        }, err => {
            console.error("Lỗi kéo orders từ Firebase:", err);
        });
    } else if (typeof renderAdminDashboard === "function") {
        // Chưa bật Firebase: vẽ bằng dữ liệu cục bộ
        setTimeout(renderAdminDashboard, 100);
    }
}
