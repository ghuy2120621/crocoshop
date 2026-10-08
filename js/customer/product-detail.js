// ==========================================
// TRANG KHÁCH: CHI TIẾT SẢN PHẨM (ảnh, màu, size, accordion)
// ==========================================

function changeMainImage(thumb) {
    const mainImg = document.getElementById('detailed-main-img');
    if (mainImg) {
        mainImg.style.opacity = 0.4;
        setTimeout(() => {
            mainImg.src = thumb.src;
            mainImg.style.opacity = 1;
        }, 100);
    }
    document.querySelectorAll('.thumb-img').forEach(img => img.classList.remove('active'));
    thumb.classList.add('active');
}

function openProductDetail(id) {
    window.location.hash = `product-${id}`;
    const prod = database.products.find(p => p.id === id);
    if (!prod) return;

    activeProduct = prod;
    document.getElementById("catalog-section").style.display = "none";

    const detailSec = document.getElementById("detail-section");
    detailSec.classList.add("active");

    // Populate basic details
    document.getElementById("detail-name").textContent = prod.name;
    document.getElementById("detail-price").textContent = formatPrice(prod.price);

    let catLabel = getCategoryDisplayName(prod.category);
    document.getElementById("breadcrumb-category").textContent = catLabel;

    // Customize description
    document.getElementById("detail-desc").textContent = `Chiếc ${prod.name.toLowerCase()} nằm trong thiết kế tối giản đặc biệt của Croco closet. Sử dụng chất liệu vải tuyển chọn có tính co giãn tốt, thiết kế ôm dáng tinh xảo giúp bạn nâng tầm phong cách quý phái.`;

    // Review counts
    const reviewCount = Math.floor(Math.abs(prod.price % 80)) + 12;
    document.getElementById("detail-rating-reviews").textContent = `5.0 (${reviewCount} đánh giá)`;

    // Image Gallery setup
    const mainImgEl = document.getElementById("detailed-main-img");
    const thumbsList = document.getElementById("thumbnail-images-row");
    thumbsList.innerHTML = "";

    let angles = [];

    if (prod.images && Array.isArray(prod.images) && prod.images.length > 0) {
        mainImgEl.src = prod.images[0];
        angles = [...prod.images];
    } else if (prod.image) {
        mainImgEl.src = prod.image;
        angles = [prod.image];
    } else {
        const categoryAngles = anglesPhotoDatabase[prod.category] || anglesPhotoDatabase["shirt"];
        mainImgEl.src = categoryAngles[0];
        angles = categoryAngles;
    }

    angles.forEach((src, idx) => {
        const thumb = document.createElement("img");
        thumb.className = `thumb-img ${idx === 0 ? 'active' : ''}`;
        thumb.src = src;

        // Click để chọn xem ảnh lớn
        thumb.addEventListener("click", () => {
            changeMainImage(thumb);
        });

        // Di chuột (hover) để đổi ảnh lớn lập tức
        thumb.addEventListener("mouseenter", () => {
            changeMainImage(thumb);
        });

        thumbsList.appendChild(thumb);
    });

    // Size buttons rendering
    selectedSize = null;
    document.getElementById("selected-size-label").textContent = "Chọn Size";
    const sizeListContainer = document.getElementById("size-options-list");
    sizeListContainer.innerHTML = "";

    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];
    const sortedSizes = [...prod.sizes].sort((a, b) => {
        const posA = sizeOrder.includes(a) ? sizeOrder.indexOf(a) : 99;
        const posB = sizeOrder.includes(b) ? sizeOrder.indexOf(b) : 99;
        return posA - posB;
    });

    sortedSizes.forEach(size => {
        const btn = document.createElement("button");
        btn.className = "size-btn";
        btn.textContent = size;
        btn.addEventListener("click", () => {
            document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedSize = size;
            document.getElementById("selected-size-label").textContent = size;
        });
        sizeListContainer.appendChild(btn);
    });

    // Color swatches rendering dynamically based on prod.colors
    selectedColor = null;
    document.getElementById("selected-color-label").textContent = "Chọn Màu";
    const colorListContainer = document.getElementById("color-swatches-list");
    colorListContainer.innerHTML = "";

    const colorMeta = {
        "Black": { classBg: "black", hex: "#1A1A1A", label: "Đen" },
        "White": { classBg: "white", hex: "#FFFFFF", label: "Trắng" },
        "Beige": { classBg: "yellow", hex: "#F5F2EB", label: "Be/Kem" },
        "Blue": { classBg: "blue", hex: "#ADD8E6", label: "Xanh dương" },
        "Pink": { classBg: "pink", hex: "#FFD1DC", label: "Hồng" },
        "Green": { classBg: "green", hex: "#C8E6C9", label: "Xanh lá" },
        "Red": { classBg: "red", hex: "#FF8A80", label: "Đỏ" }
    };

    prod.colors.forEach((colorName, idx) => {
        const meta = colorMeta[colorName] || { classBg: "white", hex: "#FFFFFF", label: colorName };
        const btn = document.createElement("button");
        btn.className = `color-swatch-btn ${meta.classBg}`;
        btn.style.backgroundColor = meta.hex;
        btn.title = meta.label;
        btn.setAttribute("data-color", meta.label);

        btn.addEventListener("click", () => {
            document.querySelectorAll(".color-swatch-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedColor = meta.label;
            document.getElementById("selected-color-label").textContent = meta.label;
        });

        // Select first color by default
        if (idx === 0) {
            btn.classList.add("active");
            selectedColor = meta.label;
            document.getElementById("selected-color-label").textContent = meta.label;
        }

        colorListContainer.appendChild(btn);
    });

    // Sync details page wishlist button state
    const wishlistDetailBtn = document.getElementById("wishlistDetailBtn");
    if (wishlistDetailBtn) {
        if (wishlist.includes(prod.id)) {
            wishlistDetailBtn.classList.add("active");
        } else {
            wishlistDetailBtn.classList.remove("active");
        }
    }

    // Kiểm tra tình trạng kho hàng để xử lý nút "Thêm vào giỏ hàng"
    const addToCartBtn = document.getElementById("addToCartBtn");
    if (addToCartBtn) {
        if (prod.stock !== undefined && prod.stock <= 0) {
            addToCartBtn.textContent = "ĐÃ BÁN HẾT";
            addToCartBtn.disabled = true;
            addToCartBtn.style.opacity = "0.6";
            addToCartBtn.style.backgroundColor = "#ccc";
            addToCartBtn.style.color = "#888";
            addToCartBtn.style.cursor = "not-allowed";
        } else {
            addToCartBtn.textContent = "THÊM VÀO GIỎ HÀNG";
            addToCartBtn.disabled = false;
            addToCartBtn.style.opacity = "";
            addToCartBtn.style.backgroundColor = "";
            addToCartBtn.style.color = "";
            addToCartBtn.style.cursor = "";
        }
    }

    mainImgEl.style.transform = "scale(1)";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- COLOR SWATCH SELECTORS ---
document.querySelectorAll(".color-swatch-btn").forEach(swatch => {
    swatch.addEventListener("click", () => {
        document.querySelectorAll(".color-swatch-btn").forEach(s => s.classList.remove("active"));
        swatch.classList.add("active");
        selectedColor = swatch.getAttribute("data-color");
        document.getElementById("selected-color-label").textContent = selectedColor;
    });
});

// --- ACCORDIONS ---
document.querySelectorAll(".accordion-title").forEach(title => {
    title.addEventListener("click", () => {
        const item = title.parentElement;
        const wasActive = item.classList.contains("active");

        document.querySelectorAll(".accordion-item").forEach(i => {
            i.classList.remove("active");
            i.querySelector(".accordion-content").style.maxHeight = null;
        });

        if (!wasActive) {
            item.classList.add("active");
            const content = item.querySelector(".accordion-content");
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
});
