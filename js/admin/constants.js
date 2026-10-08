// ==========================================
// ADMIN: HẰNG SỐ & BẢNG TRA CỨU
// ==========================================

// --- SUBCATEGORY MAP & OPTIONS ---
const subCategoryMap = {
    "dress": [
        { value: "party-dress", label: "Đầm Đi Tiệc(party)" },
        { value: "casual-dress", label: "Đầm Dạo Phố(casual)" },
        { value: "work-dress", label: "Đầm Công Sở(workwear)" },
        { value: "short-dress", label: "Đầm Ngắn(short)" },
        { value: "long-dress", label: "Đầm Dài(long)" },
        { value: "beach-dress", label: "Đầm Đi Biển(beach)" },
        { value: "wedding-dress", label: "Đầm Hỏi Cưới(wedding)" },
        { value: "bodycon-dress", label: "Đầm Ôm(bodycon)" }
    ],
    "skirt": [
        { value: "short-skirt", label: "Váy ngắn" },
        { value: "midi-skirt", label: "Váy dài" }
    ],
    "shirt": [],
    "pants": [],
    "bikini": [
        { value: "bikini", label: "Bikini" },
        { value: "beach-sarong", label: "Khăn choàng bikini" }
    ],
    "sleepwear": [
        { value: "robe", label: "Áo choàng ngủ" },
        { value: "homewear", label: "Bộ đồ mặc nhà" },
        { value: "silk-sleepwear", label: "Bộ ngủ lụa" },
        { value: "long-pyjamas", label: "Pyjamas dài tay" },
        { value: "sexy-slip-dress", label: "Slip dress gợi cảm" }
    ],
    "accessories": [
        { value: "eye-mask", label: "Bịt mắt ngủ" },
        { value: "charm", label: "Charm" },
        { value: "scrunchie", label: "Scrunchie" },
        { value: "pasties", label: "Miếng dán" },
        { value: "gift-box", label: "Box quà tặng" },
        { value: "sarong", label: "Khăn" }
    ],
    "aodai": [],
    "set": []
};

const CATEGORY_LABELS = {
    shirt: "Áo",
    pants: "Quần",
    aodai: "Áo dài",
    set: "Set trang phục",
    dress: "Đầm",
    skirt: "Váy",
    bikini: "Bikini",
    sleepwear: "Bộ ngủ",
    accessories: "Phụ kiện"
};

const COLOR_CLASSES = {
    Black: "bg-black",
    White: "bg-white",
    Beige: "bg-beige",
    Blue: "bg-blue",
    Pink: "bg-pink",
    Green: "bg-green",
    Red: "bg-red"
};

const TAG_BADGES = {
    "best-seller": { label: "Best Seller", bg: "#fef3c7", color: "#d97706" },
    "new-in": { label: "New In", bg: "#dcfce7", color: "#15803d" },
    "trending": { label: "Trending", bg: "#fce7f3", color: "#be185d" }
};

// Ảnh tạm khi sản phẩm chưa có ảnh (theo danh mục)
const PLACEHOLDER_IMAGE_SUFFIX = "?q=80&w=128&auto=format&fit=crop";
const PLACEHOLDER_IMAGES = {
    default: "photo-1523381210434-271e8be1f52b",
    pants: "photo-1542272604-787c3835535d",
    set: "photo-1595777457583-95e059d581b8",
    dress: "photo-1595777457583-95e059d581b8",
    skirt: "photo-1539109136881-3be0616acf4b",
    bikini: "photo-1618932260643-eee4a2f652a6",
    sleepwear: "photo-1544005313-94ddf0286df2",
    accessories: "photo-1535713875002-d1d0cf377fde"
};

// Trạng thái đơn hàng: hệ thống dùng cả nhãn tiếng Việt (đơn mới) và mã tiếng Anh (đơn cũ)
const ORDER_STATUSES = ["Chờ xác nhận", "Đã xác nhận", "Đang giao hàng", "Giao thành công", "Đã hủy"];
const ORDER_STATUS_KEY_TO_LABEL = {
    pending: "Chờ xác nhận",
    approved: "Đã xác nhận",
    processing: "Đang giao hàng",
    shipped: "Giao thành công",
    cancelled: "Đã hủy"
};
const ORDER_STATUS_LABEL_TO_KEY = Object.fromEntries(
    Object.entries(ORDER_STATUS_KEY_TO_LABEL).map(([key, label]) => [label, key])
);

const TAB_TITLES = {
    overview: "Tổng quan",
    inventory: "Quản lý kho",
    orders: "Quản lý Đơn hàng",
    revenue: "Báo cáo doanh thu",
    banner: "Quản lý Banner"
};
