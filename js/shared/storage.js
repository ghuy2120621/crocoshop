// ==========================================
// BỘ NHỚ DÙNG CHUNG: localStorage an toàn + đối tượng `database`
// database.products / database.orders là dữ liệu đang hiển thị trên giao diện.
// ==========================================

// Dọn bộ nhớ đệm cũ mỗi lần tải trang (dữ liệu thật luôn được kéo trực tiếp từ Firebase)
try {
    localStorage.removeItem('fashion_shop_db');
} catch (e) { }

// Ghi localStorage an toàn để tránh QuotaExceededError làm sập ứng dụng
function safeSetLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.warn(`Không thể ghi ${key} vào localStorage (Đầy dung lượng):`, e.message);
    }
}

const initialDatabase = {
    products: [],
    orders: []
};

let database = initialDatabase;
window.fashion_shop_db = database; // alias toàn cục để tránh lỗi tham chiếu

function saveDatabase() {
    // Lưu cục bộ làm bộ đệm
    safeSetLocalStorage("fashion_shop_db", JSON.stringify(database));

    // Đồng bộ lên Firebase
    if (isFirebaseEnabled) {
        // KHÔNG BAO GIỜ DÙNG LỆNH .set() TRÊN NODE GỐC products
        const p2 = firebase.database().ref('orders').set(database.orders)
            .then(() => console.log("Đồng bộ orders lên Firebase thành công."))
            .catch(err => console.error("Lỗi đồng bộ orders lên Firebase:", err));

        const p3 = firebase.database().ref('fashion_shop_db').set(database)
            .then(() => console.log("Đồng bộ fashion_shop_db lên Firebase thành công."))
            .catch(err => console.error("Lỗi đồng bộ fashion_shop_db lên Firebase:", err));

        return Promise.all([p2, p3]);
    }
    return Promise.resolve();
}
