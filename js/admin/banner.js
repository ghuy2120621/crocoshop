// ==========================================
// ADMIN: QUẢN LÝ BANNER TRANG CHỦ
// ==========================================

function showBannerPreview(src) {
    const imgPreview = document.getElementById("bannerImgPreview");
    const placeholder = document.getElementById("bannerPreviewPlaceholder");
    if (imgPreview) {
        imgPreview.src = src;
        imgPreview.style.display = "block";
    }
    if (placeholder) {
        placeholder.style.display = "none";
    }
}

// Đổ cấu hình banner đã lưu vào form
function applyBannerToForm(val) {
    if (!val) return;
    const fields = {
        bannerSubTitle: val.subTitle,
        bannerMainTitle: val.mainTitle,
        bannerBtnText: val.btnText,
        bannerBtnLink: val.btnLink
    };
    Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value || "";
    });
    if (val.bannerImg) showBannerPreview(val.bannerImg);
}

function loadBannerSettingsAdmin() {
    if (isFirebaseEnabled) {
        firebase.database().ref('banner_settings').once('value')
            .then(snapshot => applyBannerToForm(snapshot.val()))
            .catch(err => console.error("Lỗi kéo cấu hình banner từ Firebase:", err));
    } else {
        try {
            applyBannerToForm(JSON.parse(localStorage.getItem("banner_settings")));
        } catch (e) {
            console.error("Lỗi đọc cache local banner:", e);
        }
    }
}

function setBannerSaving(isSaving) {
    const saveBtn = document.getElementById("saveBannerBtn");
    if (!saveBtn) return;
    saveBtn.disabled = isSaving;
    saveBtn.textContent = isSaving ? "Đang lưu..." : "Lưu thay đổi Banner";
}

function setupBannerListeners() {
    const bannerImgInput = document.getElementById("bannerImgInput");
    const bannerForm = document.getElementById("bannerForm");

    // Chọn ảnh -> nén -> xem trước
    if (bannerImgInput) {
        bannerImgInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                showBannerPreview(await readAndCompressImage(file, 1200, 800, 0.75));
            } catch (err) {
                console.error("Lỗi đọc ảnh banner:", err);
            }
        });
    }

    // Lưu cấu hình banner
    if (bannerForm) {
        bannerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const imgPreview = document.getElementById("bannerImgPreview");
            const bannerData = {
                subTitle: document.getElementById("bannerSubTitle").value.trim() || "MÙA HÈ EXCLUSIVE",
                mainTitle: document.getElementById("bannerMainTitle").value.trim() || "BỘ SƯU TẬP SANG TRỌNG",
                btnText: document.getElementById("bannerBtnText").value.trim() || "MUA NGAY",
                btnLink: document.getElementById("bannerBtnLink").value.trim() || "#products-grid",
                bannerImg: imgPreview && imgPreview.style.display === "block" ? imgPreview.src : ""
            };

            setBannerSaving(true);

            if (isFirebaseEnabled) {
                firebase.database().ref('banner_settings').set(bannerData)
                    .then(() => alert("Lưu cấu hình banner thành công!"))
                    .catch(err => {
                        console.error("Lỗi lưu banner lên Firebase:", err);
                        alert("Có lỗi xảy ra khi lưu: " + err.message);
                    })
                    .finally(() => setBannerSaving(false));
            } else {
                safeSetLocalStorage("banner_settings", JSON.stringify(bannerData));
                alert("Lưu cấu hình banner thành công (Offline)!");
                setBannerSaving(false);
            }
        });
    }
}
