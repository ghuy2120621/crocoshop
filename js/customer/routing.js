// ==========================================
// TRANG KHÁCH: CHUYỂN TRANG / BỘ LỌC / HIỂN THỊ DANH MỤC
// ==========================================

let isViewingShop = false;

function navigateToShop(e) {
    if (e) e.preventDefault();
    const homepageProductsSec = document.getElementById("homepage-products-section");
    if (homepageProductsSec) {
        homepageProductsSec.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// --- FILTERING ---
function setFilter(e, category, isSub = false) {
    if (e) {
        e.preventDefault();
    }

    // Kích hoạt trạng thái đang xem sản phẩm (ẩn banner)
    isViewingShop = true;

    // Reset active state for all filter tabs and nav links
    document.querySelectorAll(".filter-tab").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));

    if (isSub) {
        currentFilterSubCategory = category;
        currentFilterCategory = "all";

        // Highlight parent category filter tab and nav link if it is a subcategory
        let parentCategory = "";
        for (const cat in subCategoryLookup) {
            if (subCategoryLookup[cat][category] !== undefined) {
                parentCategory = cat;
                break;
            }
        }
        if (parentCategory) {
            const parentTab = document.getElementById(`tab-${parentCategory}`);
            if (parentTab) parentTab.classList.add("active");

            const parentLink = Array.from(document.querySelectorAll(".nav-link")).find(link =>
                link.getAttribute("onclick") && link.getAttribute("onclick").includes(`'${parentCategory}'`)
            );
            if (parentLink) parentLink.classList.add("active");
        }
    } else {
        currentFilterCategory = category;
        currentFilterSubCategory = "all";

        // Highlight corresponding filter tab
        const activeTab = document.getElementById(`tab-${category}`);
        if (activeTab) {
            activeTab.classList.add("active");
        } else if (category === "all" || ["best-seller", "new-in", "trending"].includes(category)) {
            const allTab = document.getElementById("tab-all");
            if (allTab) allTab.classList.add("active");
        }

        // Highlight corresponding nav link in header
        const activeLink = Array.from(document.querySelectorAll(".nav-link")).find(link =>
            link.getAttribute("onclick") && link.getAttribute("onclick").includes(`'${category}'`)
        );
        if (activeLink) activeLink.classList.add("active");
    }

    // Fallback: If clicked element is a filter-tab or nav-link, make sure it has the active class
    if (e && e.target) {
        if (e.target.classList.contains("filter-tab") || e.target.classList.contains("nav-link")) {
            e.target.classList.add("active");
        }
    }

    showCatalog(null);
    loadCatalog();
}

function filterCategory(e, category) {
    if (e) e.preventDefault();
    showCatalog();
    const tabBtn = document.getElementById(`tab-${category}`);
    if (tabBtn) tabBtn.click();
}

// --- NAVIGATION CONTROLLERS ---
function showCatalog(e) {
    if (e) {
        e.preventDefault();
        currentFilterCategory = "all";
        currentFilterSubCategory = "all";
        isViewingShop = false; // Reset to homepage banner when explicitly going back to Trang chủ / Logo
    }

    // Ensure home view is active and orders view is hidden
    const homeView = document.getElementById('home-view');
    const ordersView = document.getElementById('orders-view');
    if (homeView) homeView.style.display = 'block';
    if (ordersView) ordersView.style.display = 'none';

    window.location.hash = "";
    document.getElementById("detail-section").classList.remove("active");
    document.getElementById("catalog-section").style.display = "block";

    const heroBanner = document.getElementById("hero-banner-section");
    const allProductsSec = document.getElementById("all-products-section");
    const homepageProductsSec = document.getElementById("homepage-products-section");

    if (isViewingShop) {
        if (heroBanner) heroBanner.style.display = "none";
        if (homepageProductsSec) homepageProductsSec.style.display = "none";
        if (allProductsSec) allProductsSec.style.display = "block";
    } else {
        if (heroBanner) heroBanner.style.display = "flex";
        if (homepageProductsSec) homepageProductsSec.style.display = "block";
        if (allProductsSec) allProductsSec.style.display = "none";

        // Clear active states on tabs and links when returning to home banner
        document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
        document.querySelectorAll(".filter-tab").forEach(tab => tab.classList.remove("active"));
        const allTab = document.getElementById("tab-all");
        if (allTab) allTab.classList.add("active");
    }

    activeProduct = null;
    selectedSize = null;
    loadCatalog();
}
