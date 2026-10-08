// ==========================================
// TRANG KHÁCH: BANNER TRANG CHỦ (đọc cấu hình từ Admin)
// ==========================================

// --- LOAD BANNER SETTINGS FROM FIREBASE ---
function loadBannerSettings() {
    const bannerSection = document.getElementById("hero-banner-section");
    if (!bannerSection) return;

    const heroSubtitle = bannerSection.querySelector(".hero-subtitle");
    const heroTitle = bannerSection.querySelector(".hero-title");
    const heroBtn = bannerSection.querySelector(".hero-btn");

    const applyBannerData = (data) => {
        if (!data) return;

        if (heroSubtitle) heroSubtitle.textContent = data.subTitle || "MÙA HÈ EXCLUSIVE";
        if (heroTitle) heroTitle.textContent = data.mainTitle || "Bộ Sưu Tập Sang Trọng";
        if (heroBtn) {
            heroBtn.textContent = data.btnText || "Mua ngay";
            if (data.btnLink) {
                heroBtn.href = data.btnLink;
                if (data.btnLink.startsWith("#")) {
                    heroBtn.onclick = (e) => {
                        e.preventDefault();
                        const targetEl = document.getElementById(data.btnLink.substring(1)) || document.getElementById("homepage-products-section");
                        if (targetEl) {
                            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                    };
                } else {
                    heroBtn.onclick = null;
                }
            }
        }

        if (data.bannerImg) {
            bannerSection.style.background = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3)), url('${data.bannerImg}') center/cover no-repeat`;
        }
    };

    // Local cache copy load
    try {
        const localBanner = localStorage.getItem("banner_settings");
        if (localBanner) {
            applyBannerData(JSON.parse(localBanner));
        }
    } catch (e) {
        console.error("Lỗi đọc local banner cache:", e);
    }

    // Real-time listener on Firebase
    if (isFirebaseEnabled) {
        firebase.database().ref('banner_settings').on('value', (snapshot) => {
            const val = snapshot.val();
            if (val) {
                applyBannerData(val);
                safeSetLocalStorage("banner_settings", JSON.stringify(val));
            }
        }, (error) => {
            console.error("Lỗi lắng nghe banner từ Firebase:", error);
        });
    }
}
