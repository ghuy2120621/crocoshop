// ==========================================
// TRANG KHÁCH: TRẠNG THÁI CHUNG (bộ lọc, giỏ hàng, sản phẩm đang xem)
// ==========================================

let currentFilterCategory = "all";
let currentFilterSubCategory = "all";
let currentSearchQuery = "";

// --- SHOPPING CART STATE ---
let cart = [];
let activeProduct = null;
let selectedColor = "Màu hồng phấn";
let selectedSize = null;
