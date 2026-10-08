// ==========================================
// TRANG KHÁCH: TÀI KHOẢN (modal đăng nhập/đăng ký, đếm ngược OTP)
// ==========================================

// --- CUSTOMER ACCOUNT & AUTH MODAL BINDINGS ---
const authModal = document.getElementById("authModalBackdrop");
const accountMenuBtn = document.getElementById("accountMenuBtn");
const closeAuthBtnModal = document.getElementById("closeAuthBtnModal");

const authStepPhone = document.getElementById("authStepPhone");
const authStepOtp = document.getElementById("authStepOtp");
const authStepRegister = document.getElementById("authStepRegister");

const phoneAuthForm = document.getElementById("phoneAuthForm");
const otpAuthForm = document.getElementById("otpAuthForm");
const registerForm = document.getElementById("registerForm");

const otpCountdownText = document.getElementById("otpCountdownText");
const resendOtpBtn = document.getElementById("resendOtpBtn");

let pendingPhoneNumber = "";
let otpTimer = null;
let otpCountdownVal = 60;
let mockUid = null;

// Open Modal
accountMenuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    try {
        if (typeof CustomerAuth === 'undefined') {
            alert("Lỗi: Không tìm thấy thư viện CustomerAuth (vui lòng kiểm tra js/customer/auth-service.js có được tải thành công không).");
            return;
        }
        const currentUser = CustomerAuth.getCurrentUser();
        if (currentUser) {
            const dropdown = document.getElementById("accountDropdown");
            dropdown.classList.toggle("mobile-visible");
        } else {
            openAuthModal();
        }
    } catch (err) {
        alert("Lỗi khi mở Modal: " + err.message);
        console.error(err);
    }
});

// Close Modal
closeAuthBtnModal.addEventListener("click", closeAuthModal);
authModal.addEventListener("click", (e) => {
    if (e.target === authModal) closeAuthModal();
});

function openAuthModal() {
    authStepPhone.classList.remove("hidden");
    authStepOtp.classList.add("hidden");
    authStepRegister.classList.add("hidden");
    phoneAuthForm.reset();
    otpAuthForm.reset();
    registerForm.reset();
    clearInterval(otpTimer);

    authModal.classList.add("open");
}

function closeAuthModal() {
    authModal.classList.remove("open");
    clearInterval(otpTimer);
}

// Dropdown logout action
document.getElementById("logoutBtn").addEventListener("click", () => {
    CustomerAuth.logout();
    const nameInput = document.getElementById("customerName");
    const phoneInput = document.getElementById("customerPhone");
    if (nameInput) nameInput.value = "";
    if (phoneInput) phoneInput.value = "";
});

// Header sync logic
window.updateHeaderAccount = function () {
    const currentUser = CustomerAuth.getCurrentUser();
    const btnContent = document.getElementById("accountBtnContent");
    const dropdownUsername = document.getElementById("dropdownUsername");
    const dropdownPhone = document.getElementById("dropdownPhone");

    if (currentUser) {
        const avatarUrl = currentUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100";
        btnContent.innerHTML = `
            <img src="${avatarUrl}" alt="${currentUser.displayName}">
            <span class="account-text">${currentUser.displayName}</span>
        `;
        dropdownUsername.textContent = currentUser.displayName;
        dropdownPhone.textContent = currentUser.phoneNumber ? `SĐT: ${currentUser.phoneNumber}` : "Google/FB Account";
    } else {
        btnContent.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span class="account-text">Tài khoản</span>
        `;
        dropdownUsername.textContent = "Khách hàng";
        dropdownPhone.textContent = "Chưa đăng nhập";
    }
};

// Google login click
document.getElementById("loginGoogleBtn").addEventListener("click", async () => {
    try {
        showCustomerToast("Đang kết nối Google...", "info");
        const user = await CustomerAuth.signInWithGoogle();
        showCustomerToast(`Chào mừng ${user.displayName} quay lại!`);
        closeAuthModal();
        if (typeof handlePendingPurchase === 'function') handlePendingPurchase();
    } catch (error) {
        showCustomerToast("Đăng nhập Google thất bại", "error");
    }
});

// Facebook login click
document.getElementById("loginFacebookBtn").addEventListener("click", async () => {
    try {
        showCustomerToast("Đang kết nối Facebook...", "info");
        const user = await CustomerAuth.signInWithFacebook();
        showCustomerToast(`Chào mừng ${user.displayName} quay lại!`);
        closeAuthModal();
        if (typeof handlePendingPurchase === 'function') handlePendingPurchase();
    } catch (error) {
        showCustomerToast("Đăng nhập Facebook thất bại", "error");
    }
});

// Phone Submit -> send OTP code
phoneAuthForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const phone = document.getElementById("regPhoneInput").value;
    pendingPhoneNumber = phone;

    try {
        showCustomerToast("Đang gửi mã xác thực OTP...", "info");
        await CustomerAuth.sendOTP(phone, 'recaptcha-container');
        showCustomerToast("Mã OTP đã được gửi!");

        authStepPhone.classList.add("hidden");
        authStepOtp.classList.remove("hidden");

        startOtpCountdown();
    } catch (error) {
        showCustomerToast("Gửi mã OTP thất bại.", "error");
    }
});

// OTP Code Verification
otpAuthForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = document.getElementById("otpInput").value;

    try {
        showCustomerToast("Đang xác thực OTP...", "info");
        const result = await CustomerAuth.verifyOTP(code);
        showCustomerToast("Xác thực OTP thành công!");
        mockUid = result.uid;

        authStepOtp.classList.add("hidden");
        authStepRegister.classList.remove("hidden");

        document.getElementById("regDisplayNameInput").value = "Khách hàng " + pendingPhoneNumber.slice(-4);
    } catch (error) {
        showCustomerToast("Mã OTP không chính xác!", "error");
    }
});

// Resend OTP click
resendOtpBtn.addEventListener("click", async () => {
    if (!resendOtpBtn.classList.contains("active")) return;
    try {
        showCustomerToast("Đang gửi lại mã OTP...", "info");
        await CustomerAuth.sendOTP(pendingPhoneNumber, 'recaptcha-container');
        showCustomerToast("Đã gửi lại mã OTP!");
        startOtpCountdown();
    } catch (error) {
        showCustomerToast("Gửi lại OTP thất bại.", "error");
    }
});

// Register Extra Fields Submission
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("regUsernameInput").value;
    const password = document.getElementById("regPasswordInput").value;
    const displayName = document.getElementById("regDisplayNameInput").value;

    if (password.length < 6) {
        showCustomerToast("Mật khẩu phải tối thiểu 6 ký tự!", "error");
        return;
    }

    try {
        showCustomerToast("Đang hoàn tất đăng ký...", "info");
        const user = await CustomerAuth.registerUser(username, password, displayName, pendingPhoneNumber, mockUid);
        showCustomerToast(`Đăng ký thành công! Xin chào ${user.displayName}`);
        closeAuthModal();
        if (typeof handlePendingPurchase === 'function') handlePendingPurchase();
    } catch (error) {
        showCustomerToast("Đăng ký tài khoản thất bại.", "error");
    }
});

// Start 60s countdown timer
function startOtpCountdown() {
    clearInterval(otpTimer);
    otpCountdownVal = 60;
    resendOtpBtn.classList.remove("active");
    otpCountdownText.style.display = "block";
    otpCountdownText.querySelector("span").textContent = otpCountdownVal;

    otpTimer = setInterval(() => {
        otpCountdownVal--;
        otpCountdownText.querySelector("span").textContent = otpCountdownVal;

        if (otpCountdownVal <= 0) {
            clearInterval(otpTimer);
            otpCountdownText.style.display = "none";
            resendOtpBtn.classList.add("active");
        }
    }, 1000);
}
