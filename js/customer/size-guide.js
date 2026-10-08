// ==========================================
// TRANG KHÁCH: BẢNG SIZE & TÌM SIZE PHÙ HỢP
// ==========================================

// --- SIZE GUIDE MODALS ---
const sizeGuideModal = document.getElementById("sizeGuideModalBackdrop");
const findSizeModal = document.getElementById("findSizeModalBackdrop");

document.getElementById("openSizeGuideBtn").addEventListener("click", (e) => {
    e.preventDefault();
    sizeGuideModal.classList.add("open");
});

document.getElementById("openFindSizeBtn").addEventListener("click", () => {
    findSizeModal.classList.add("open");
    document.getElementById("sizeCalculatorResult").style.display = "none";
    document.getElementById("findSizeCalculator").reset();
});

window.closeModals = function () {
    sizeGuideModal.classList.remove("open");
    findSizeModal.classList.remove("open");
};

// Calculator sizing logic
document.getElementById("findSizeCalculator").addEventListener("submit", (e) => {
    e.preventDefault();
    const height = parseInt(document.getElementById("heightCm").value);
    const weight = parseInt(document.getElementById("weightKg").value);

    let suggested = "S";
    const index = weight / ((height / 100) * (height / 100));

    if (index < 18) suggested = "XS";
    else if (index >= 18 && index < 21.5) suggested = "S";
    else if (index >= 21.5 && index < 24.5) suggested = "M";
    else if (index >= 24.5 && index < 27.5) suggested = "L";
    else suggested = "XL";

    const resultBox = document.getElementById("sizeCalculatorResult");
    resultBox.innerHTML = `Size đề xuất tốt nhất dành cho bạn: <strong style="font-size: 1.25rem; color:#111">${suggested}</strong>`;
    resultBox.style.display = "block";
});
