// ==========================================
// TRANG KHÁCH: TÌM KIẾM
// ==========================================

// --- SEARCH OVERLAY SYSTEM ---
const searchOverlay = document.getElementById("searchOverlay");
const searchInput = document.getElementById("searchInput");

function openSearch() {
    searchOverlay.classList.add("open");
    searchInput.focus();
}

function closeSearch() {
    searchOverlay.classList.remove("open");
    searchInput.value = "";
    currentSearchQuery = "";
    loadCatalog();
}

document.getElementById("openSearchBtn").addEventListener("click", (e) => {
    e.preventDefault();
    if (searchOverlay.classList.contains("open")) {
        closeSearch();
    } else {
        openSearch();
    }
});

document.getElementById("closeSearchBtn").addEventListener("click", closeSearch);

function triggerSearchScroll() {
    // Close search overlay
    searchOverlay.classList.remove("open");

    // Switch to catalog list view
    isViewingShop = true;
    const heroBanner = document.getElementById("hero-banner-section");
    const allProductsSec = document.getElementById("all-products-section");
    const homepageProductsSec = document.getElementById("homepage-products-section");

    if (heroBanner) heroBanner.style.display = "none";
    if (homepageProductsSec) homepageProductsSec.style.display = "none";
    if (allProductsSec) allProductsSec.style.display = "block";

    loadCatalog();

    // Scroll down to the products list grid
    const targetEl = document.getElementById("productGridList") || document.getElementById("all-products-section");
    if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value;

    // Auto switch to all products catalog view when typing starts
    if (currentSearchQuery.trim() !== "") {
        isViewingShop = true;
        const heroBanner = document.getElementById("hero-banner-section");
        const allProductsSec = document.getElementById("all-products-section");
        const homepageProductsSec = document.getElementById("homepage-products-section");

        if (heroBanner) heroBanner.style.display = "none";
        if (homepageProductsSec) homepageProductsSec.style.display = "none";
        if (allProductsSec) allProductsSec.style.display = "block";
    }

    loadCatalog();
});

// Trigger search redirection when hitting Enter
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        triggerSearchScroll();
    }
});

// Trigger search when clicking search icon SVG
const searchIcon = document.querySelector(".search-container svg");
if (searchIcon) {
    searchIcon.style.cursor = "pointer";
    searchIcon.addEventListener("click", () => {
        triggerSearchScroll();
    });
}
