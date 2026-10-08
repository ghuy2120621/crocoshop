// ==========================================
// CHUẨN HÓA DỮ LIỆU TỪ FIREBASE
// Gom 1 chỗ các đoạn xử lý trước đây bị lặp lại nhiều lần.
// ==========================================

// Ép kiểu & điền giá trị mặc định cho từng sản phẩm để không crash giao diện
function normalizeProducts(list) {
    return (Array.isArray(list) ? list : []).map((prod, index) => {
        if (!prod) return null;
        return {
            ...prod,
            id: prod.id ? String(prod.id) : String(index),
            name: prod.name || "Sản phẩm không tên",
            category: prod.category || "shirt",
            sizes: Array.isArray(prod.sizes) ? prod.sizes : [],
            colors: Array.isArray(prod.colors) ? prod.colors : [],
            price: Number(prod.price) || 0,
            stock: Number(prod.stock) || 0,
            images: Array.isArray(prod.images) ? prod.images : (prod.image ? [prod.image] : []),
            image: prod.image || (prod.images && prod.images[0]) || ""
        };
    }).filter(Boolean);
}

// Firebase trả về mảng hoặc object {key: item} -> mảng sản phẩm có id chuẩn
function firebaseToProductList(rawData) {
    if (!rawData) return [];
    if (Array.isArray(rawData)) {
        // Dữ liệu dạng mảng: dùng index làm id
        return rawData.map((item, index) => item ? { ...item, id: String(index) } : null).filter(Boolean);
    }
    if (typeof rawData === 'object') {
        // Dữ liệu dạng object: dùng key Firebase làm id để sửa/xóa chính xác
        return Object.keys(rawData).map(key => rawData[key] ? { ...rawData[key], id: key } : null).filter(Boolean);
    }
    return [];
}

// Firebase trả về mảng hoặc object {key: order} -> mảng đơn hàng (gộp theo orderId)
function firebaseToOrderList(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val !== 'object') return [];

    const map = {};
    Object.keys(val).forEach(key => {
        try {
            const item = val[key];
            if (!item) return;
            const itemId = item.orderId || item.id || key;
            map[itemId] = map[itemId] ? { ...map[itemId], ...item } : { ...item, id: itemId };
        } catch (itemErr) {
            console.error("Bỏ qua đơn hàng bị lỗi dữ liệu:", key, itemErr);
        }
    });
    return Object.values(map);
}
