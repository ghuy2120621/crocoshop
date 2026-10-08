// ==========================================
// TRANG KHÁCH: HẰNG SỐ (phân loại, nhãn danh mục, ảnh mẫu)
// ==========================================

const subCategoryLookup = {
    "dress": { "party-dress": "Đầm Đi Tiệc(party)", "casual-dress": "Đầm Dạo Phố(casual)", "work-dress": "Đầm Công Sở(workwear)", "short-dress": "Đầm Ngắn(short)", "long-dress": "Đầm Dài(long)", "beach-dress": "Đầm Đi Biển(beach)", "wedding-dress": "Đầm Hỏi Cưới(wedding)", "bodycon-dress": "Đầm Ôm(bodycon)" },
    "skirt": { "short-skirt": "Váy ngắn", "midi-skirt": "Váy dài" },
    "shirt": {},
    "pants": {},
    "aodai": {},
    "bikini": { "bikini": "Bikini", "beach-sarong": "Khăn choàng bikini" },
    "sleepwear": { "robe": "Áo choàng", "homewear": "Bộ đồ mặc nhà", "silk-sleepwear": "Bộ ngủ lụa", "long-pyjamas": "Pyjamas dài tay", "sexy-slip-dress": "Slip dress gợi cảm" },
    "accessories": { "eye-mask": "Bịt mắt ngủ", "charm": "Charm", "scrunchie": "Scrunchie", "pasties": "Miếng dán", "gift-box": "Box quà tặng", "sarong": "Khăn" }
};

const anglesPhotoDatabase = {
    "shirt": [
        "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop"
    ],
    "pants": [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1582552938357-32b906df43cd?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=600&auto=format&fit=crop"
    ],
    "dress": [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?q=80&w=600&auto=format&fit=crop"
    ]
};

const categoryLabels = {
    "all": "Tất Cả",
    "shirt": "Áo",
    "pants": "Quần",
    "aodai": "Áo dài",
    "set": "Set bộ",
    "dress": "Đầm",
    "skirt": "Váy",
    "bikini": "Bikini",
    "sleepwear": "Bộ ngủ",
    "accessories": "Phụ kiện"
};
