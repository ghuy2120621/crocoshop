// ==========================================
// TRANG KHÁCH: THẺ SẢN PHẨM (trang chủ, slider, danh mục, slideshow ảnh)
// ==========================================

let slideshowIntervals = new Map();

function getProductImages(prod) {
    if (prod.images && Array.isArray(prod.images) && prod.images.length > 0) {
        return prod.images;
    }
    if (prod.image) {
        return [prod.image];
    }
    const categoryAngles = anglesPhotoDatabase[prod.category] || anglesPhotoDatabase["shirt"];
    return categoryAngles;
}

function startImageSlideshow(card) {
    const img = card.querySelector('.product-card-img');
    if (!img) return;
    const images = JSON.parse(img.getAttribute('data-images') || '[]');
    if (images.length <= 1) return;

    let currentIndex = 0;
    if (slideshowIntervals.has(card)) clearInterval(slideshowIntervals.get(card));

    const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        img.style.opacity = '0.7';
        setTimeout(() => {
            img.src = images[currentIndex];
            img.style.opacity = '1';
        }, 150);
    }, 1300);

    slideshowIntervals.set(card, interval);
}

function stopImageSlideshow(card) {
    const img = card.querySelector('.product-card-img');
    if (!img) return;
    const images = JSON.parse(img.getAttribute('data-images') || '[]');

    if (slideshowIntervals.has(card)) {
        clearInterval(slideshowIntervals.get(card));
        slideshowIntervals.delete(card);
    }
    if (images.length > 0) {
        img.src = images[0];
        img.style.opacity = '1';
    }
}
window.scrollSlider = function (btn, direction) {
    const container = btn.parentElement.querySelector('.product-slider');
    if (container) {
        const scrollAmount = 320 * direction; // Khoảng cách cuộn mỗi lần bấm
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
};

function renderHomepageProducts() {
    const homepageSection = document.getElementById("homepage-products-section");
    if (!homepageSection) return;
    homepageSection.innerHTML = "";

    const products = database.products || [];
    if (products.length === 0) {
        homepageSection.innerHTML = '<div style="text-align: center; color: var(--color-text-muted); padding: 3rem 0;">Không có sản phẩm nào để hiển thị.</div>';
        return;
    }

    // Group products by category
    const categoriesMap = {};
    products.forEach(prod => {
        if (!prod.category) return;
        const catKey = prod.category.toLowerCase().trim();
        if (!categoriesMap[catKey]) {
            categoriesMap[catKey] = [];
        }
        categoriesMap[catKey].push(prod);
    });

    // Render each category row
    for (const catKey in categoriesMap) {
        const catProducts = categoriesMap[catKey];
        if (catProducts.length === 0) continue;

        const displayName = getCategoryDisplayName(catKey);

        // Create category section container
        const catSec = document.createElement("div");
        catSec.className = "category-slider-section";

        // Header with title and "View all" if count > 4
        const hasMore = catProducts.length > 4;
        const viewAllLink = hasMore ? `<a href="#" onclick="setFilter(event, '${catKey}')" class="category-view-all">Xem tất cả (${catProducts.length})</a>` : "";

        catSec.innerHTML = `
            <div class="category-header">
                <h2 class="category-title">${displayName}</h2>
                ${viewAllLink}
            </div>
            <div class="slider-container">
                <button class="slide-btn prev-btn" onclick="scrollSlider(this, -1)">&#10094;</button>
                <div class="product-slider"></div>
                <button class="slide-btn next-btn" onclick="scrollSlider(this, 1)">&#10095;</button>
            </div>
        `;

        const sliderContainer = catSec.querySelector(".product-slider");

        catProducts.forEach(prod => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.addEventListener("click", () => openProductDetail(prod.id));
            card.addEventListener("mouseenter", () => startImageSlideshow(card));
            card.addEventListener("mouseleave", () => stopImageSlideshow(card));

            let imgUrl = (prod.images && prod.images.length > 0) ? prod.images[0] : prod.image;
            if (!imgUrl) {
                if (prod.category === "pants") imgUrl = anglesPhotoDatabase["pants"][0];
                else if (prod.category === "dress") imgUrl = anglesPhotoDatabase["dress"][0];
                else if (prod.category === "aodai") imgUrl = anglesPhotoDatabase["dress"][0];
                else if (prod.category === "set") imgUrl = anglesPhotoDatabase["dress"][0];
                else imgUrl = anglesPhotoDatabase["shirt"][0];
            }

            let catLabel = getCategoryDisplayName(prod.category);
            const normalizedCat = prod.category ? prod.category.toLowerCase().trim() : "";
            const normalizedSub = prod.subCategory ? prod.subCategory.toLowerCase().trim() : "";
            if (normalizedSub && subCategoryLookup[normalizedCat] && subCategoryLookup[normalizedCat][normalizedSub]) {
                catLabel += " > " + subCategoryLookup[normalizedCat][normalizedSub];
            }

            const isWishlisted = wishlist.includes(prod.id);

            let soldOutBadge = "";
            let imgMutedStyle = "";
            if (prod.stock !== undefined && prod.stock <= 0) {
                soldOutBadge = `<span style="position: absolute; top: 12px; left: 12px; background-color: rgba(220, 53, 69, 0.95); color: #fff; padding: 4px 8px; font-size: 0.65rem; font-weight: 800; border-radius: 2px; text-transform: uppercase; z-index: 2; letter-spacing: 0.5px;">HẾT HÀNG</span>`;
                imgMutedStyle = "filter: grayscale(0.5) opacity(0.65);";
            }

            const productImages = getProductImages(prod);
            const dataImagesAttr = JSON.stringify(productImages).replace(/'/g, "&apos;");

            card.innerHTML = `
                <div class="image-container">
                    ${soldOutBadge}
                    <img class="product-card-img" src="${imgUrl}" data-images='${dataImagesAttr}' alt="${prod.name}" style="${imgMutedStyle}">
                    <button class="wishlist-heart-btn ${isWishlisted ? 'active' : ''}" aria-label="Yêu thích">
                        <svg class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                    <div class="quick-view-overlay">
                        <button class="quick-view-btn">${prod.stock <= 0 ? 'Đã bán hết' : 'Xem chi tiết'}</button>
                    </div>
                </div>
                <div class="card-details">
                    <div>
                        <span class="card-category">${catLabel}</span>
                        <h3 class="card-name">${prod.name}</h3>
                    </div>
                    <span class="card-price">${formatPrice(prod.price)}</span>
                </div>
            `;

            const heartBtn = card.querySelector(".wishlist-heart-btn");
            heartBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleWishlist(prod.id);
            });

            sliderContainer.appendChild(card);
        });

        homepageSection.appendChild(catSec);
    }
}

function loadCatalog() {
    // Render dynamic categories and menus
    renderDynamicNavigation();

    // Render homepage products directly
    renderHomepageProducts();

    const grid = document.getElementById("productGridList");
    if (!grid) return;
    grid.innerHTML = "";

    const filteredProducts = database.products.filter(p => {
        // 1. Filter by category or special tag or subCategory
        let matchesCategory = true;
        if (currentFilterSubCategory !== "all") {
            matchesCategory = (p.subCategory && p.subCategory.toLowerCase().trim() === currentFilterSubCategory.toLowerCase().trim());
        } else if (currentFilterCategory !== "all") {
            if (["best-seller", "new-in", "trending"].includes(currentFilterCategory)) {
                matchesCategory = (p.tag === currentFilterCategory);
                // Fallback logic for Best Seller if no products are tagged yet, filter by price
                if (currentFilterCategory === "best-seller" && !database.products.some(x => x.tag === "best-seller")) {
                    matchesCategory = (p.price >= 800000);
                }
            } else {
                matchesCategory = (p.category && p.category.toLowerCase().trim() === currentFilterCategory.toLowerCase().trim());
            }
        }

        // 2. Filter by search query (Smart keyword match)
        let matchesSearch = true;
        if (currentSearchQuery) {
            const query = currentSearchQuery.toLowerCase().trim();
            const nameMatch = p.name ? p.name.toLowerCase().includes(query) : false;
            const catMatch = p.category ? p.category.toLowerCase().includes(query) : false;
            const subCatMatch = p.subCategory ? p.subCategory.toLowerCase().includes(query) : false;
            const descMatch = p.description ? p.description.toLowerCase().includes(query) : false;

            // Fallback description match using dynamic description template (from line 3355)
            const fallbackDesc = p.name ? `Chiếc ${p.name.toLowerCase()} nằm trong thiết kế tối giản đặc biệt của Croco closet. Sử dụng chất liệu vải tuyển chọn có tính co giãn tốt, thiết kế ôm dáng tinh xảo giúp bạn nâng tầm phong cách quý phái.`.toLowerCase() : "";
            const fallbackDescMatch = fallbackDesc.includes(query);

            // Color and size matching (arrays of strings)
            const colorMatch = p.colors ? p.colors.some(c => c.toLowerCase().includes(query)) : false;
            const sizeMatch = p.sizes ? p.sizes.some(s => s.toLowerCase().includes(query)) : false;

            matchesSearch = nameMatch || catMatch || subCatMatch || descMatch || fallbackDescMatch || colorMatch || sizeMatch;
        }

        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        if (currentSearchQuery) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted); padding: 3rem 0; font-size: 1.1rem;">Không tìm thấy sản phẩm nào phù hợp với từ khóa "${currentSearchQuery}".</div>`;
        } else {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted); padding: 3rem 0;">Không có sản phẩm nào khớp với tìm kiếm hoặc danh mục của bạn.</div>';
        }
        return;
    }

    filteredProducts.forEach(prod => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.addEventListener("click", () => openProductDetail(prod.id));
        card.addEventListener("mouseenter", () => startImageSlideshow(card));
        card.addEventListener("mouseleave", () => stopImageSlideshow(card));

        let imgUrl = (prod.images && prod.images.length > 0) ? prod.images[0] : prod.image;
        if (!imgUrl) {
            if (prod.category === "pants") imgUrl = anglesPhotoDatabase["pants"][0];
            else if (prod.category === "dress") imgUrl = anglesPhotoDatabase["dress"][0];
            else if (prod.category === "aodai") imgUrl = anglesPhotoDatabase["dress"][0];
            else if (prod.category === "set") imgUrl = anglesPhotoDatabase["dress"][0];
            else imgUrl = anglesPhotoDatabase["shirt"][0];
        }

        let catLabel = getCategoryDisplayName(prod.category);
        const normalizedCat = prod.category ? prod.category.toLowerCase().trim() : "";
        const normalizedSub = prod.subCategory ? prod.subCategory.toLowerCase().trim() : "";
        if (normalizedSub && subCategoryLookup[normalizedCat] && subCategoryLookup[normalizedCat][normalizedSub]) {
            catLabel += " > " + subCategoryLookup[normalizedCat][normalizedSub];
        }

        const isWishlisted = wishlist.includes(prod.id);

        let soldOutBadge = "";
        let imgMutedStyle = "";
        if (prod.stock !== undefined && prod.stock <= 0) {
            soldOutBadge = `<span style="position: absolute; top: 12px; left: 12px; background-color: rgba(220, 53, 69, 0.95); color: #fff; padding: 4px 8px; font-size: 0.65rem; font-weight: 800; border-radius: 2px; text-transform: uppercase; z-index: 2; letter-spacing: 0.5px;">HẾT HÀNG</span>`;
            imgMutedStyle = "filter: grayscale(0.5) opacity(0.65);";
        }

        const productImages = getProductImages(prod);
        const dataImagesAttr = JSON.stringify(productImages).replace(/'/g, "&apos;");

        card.innerHTML = `
            <div class="image-container">
                ${soldOutBadge}
                <img class="product-card-img" src="${imgUrl}" data-images='${dataImagesAttr}' alt="${prod.name}" style="${imgMutedStyle}">
                <button class="wishlist-heart-btn ${isWishlisted ? 'active' : ''}" aria-label="Yêu thích">
                    <svg class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <div class="quick-view-overlay">
                    <button class="quick-view-btn">${prod.stock <= 0 ? 'Đã bán hết' : 'Xem chi tiết'}</button>
                </div>
            </div>
            <div class="card-details">
                <div>
                    <span class="card-category">${catLabel}</span>
                    <h3 class="card-name">${prod.name}</h3>
                </div>
                <span class="card-price">${formatPrice(prod.price)}</span>
            </div>
        `;

        // Add wishlist click listener
        const heartBtn = card.querySelector(".wishlist-heart-btn");
        heartBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Stop opening details page
            toggleWishlist(prod.id);
        });

        grid.appendChild(card);
    });
}
