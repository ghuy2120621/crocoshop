// ==========================================
// TRANG KHÁCH: DỊCH VỤ ĐĂNG NHẬP (Google, Facebook, OTP số điện thoại)
// Chỉ chứa logic gọi Firebase Auth. Phần giao diện nằm ở account.js
// ==========================================

const CustomerAuth = {
    // Current user state
    getCurrentUser() {
        try {
            const stored = localStorage.getItem("current_customer");
            if (!stored || stored === "undefined") return null;
            return JSON.parse(stored);
        } catch (error) {
            console.error("Error parsing current_customer:", error);
            localStorage.removeItem("current_customer");
            return null;
        }
    },

    saveUser(user) {
        safeSetLocalStorage("current_customer", JSON.stringify(user));
        // Sync header if on customer page
        if (typeof updateHeaderAccount === 'function') {
            updateHeaderAccount();
        }
    },

    logout() {
        localStorage.removeItem("current_customer");
        if (isFirebaseEnabled) {
            firebase.auth().signOut().catch(err => console.error(err));
        }
        if (typeof updateHeaderAccount === 'function') {
            updateHeaderAccount();
        }
        if (typeof showCustomerToast === 'function') {
            showCustomerToast("Đã đăng xuất tài khoản", "info");
        }
    },

    // 1. Google Login
    async signInWithGoogle() {
        if (isFirebaseEnabled) {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                const result = await firebase.auth().signInWithPopup(provider);
                const user = result.user;
                const customer = {
                    uid: user.uid,
                    displayName: user.displayName || "Google User",
                    phoneNumber: user.phoneNumber || "",
                    photoURL: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
                    email: user.email || ""
                };
                this.saveUser(customer);
                return customer;
            } catch (error) {
                console.error("Google Sign-In Error:", error);
                throw error;
            }
        } else {
            // Mock Google Login
            return new Promise((resolve) => {
                setTimeout(() => {
                    const mockUser = {
                        uid: "MOCK_G_" + Math.random().toString(36).substr(2, 9),
                        displayName: "Khánh Vy (Google)",
                        phoneNumber: "0901234567",
                        photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
                        email: "khanhvy.google@gmail.com"
                    };
                    this.saveUser(mockUser);
                    resolve(mockUser);
                }, 1000);
            });
        }
    },

    // 2. Facebook Login
    async signInWithFacebook() {
        if (isFirebaseEnabled) {
            try {
                const provider = new firebase.auth.FacebookAuthProvider();
                const result = await firebase.auth().signInWithPopup(provider);
                const user = result.user;
                const customer = {
                    uid: user.uid,
                    displayName: user.displayName || "Facebook User",
                    phoneNumber: user.phoneNumber || "",
                    photoURL: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
                    email: user.email || ""
                };
                this.saveUser(customer);
                return customer;
            } catch (error) {
                console.error("Facebook Sign-In Error:", error);
                throw error;
            }
        } else {
            // Mock Facebook Login
            return new Promise((resolve) => {
                setTimeout(() => {
                    const mockUser = {
                        uid: "MOCK_FB_" + Math.random().toString(36).substr(2, 9),
                        displayName: "Khánh Vy (Facebook)",
                        phoneNumber: "0908888888",
                        photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
                        email: "khanhvy.fb@gmail.com"
                    };
                    this.saveUser(mockUser);
                    resolve(mockUser);
                }, 1000);
            });
        }
    },

    // 3. Phone OTP Auth State
    recaptchaVerifier: null,
    confirmationResult: null,

    // Step 3a: Send OTP code
    async sendOTP(phoneNumber, recaptchaContainerId) {
        let formattedPhone = phoneNumber;
        if (phoneNumber.startsWith('0')) {
            formattedPhone = '+84' + phoneNumber.slice(1);
        } else if (!phoneNumber.startsWith('+')) {
            formattedPhone = '+' + phoneNumber;
        }

        if (isFirebaseEnabled) {
            try {
                if (!this.recaptchaVerifier) {
                    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(recaptchaContainerId, {
                        size: 'invisible'
                    });
                }
                this.confirmationResult = await firebase.auth().signInWithPhoneNumber(formattedPhone, this.recaptchaVerifier);
                return this.confirmationResult;
            } catch (error) {
                console.error("sendOTP error:", error);
                throw error;
            }
        } else {
            // Mock OTP send
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log("Mock OTP sent to: " + formattedPhone);
                    resolve(true);
                }, 800);
            });
        }
    },

    // Step 3b: Verify OTP code
    async verifyOTP(otpCode) {
        if (isFirebaseEnabled) {
            try {
                if (!this.confirmationResult) {
                    throw new Error("Không có phiên xác thực OTP hiện tại. Vui lòng gửi lại OTP.");
                }
                const result = await this.confirmationResult.confirm(otpCode);
                const user = result.user;
                const customer = {
                    uid: user.uid,
                    displayName: user.displayName || "User " + user.phoneNumber,
                    phoneNumber: user.phoneNumber || "",
                    photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100",
                    email: user.email || ""
                };
                this.saveUser(customer);
                return customer;
            } catch (error) {
                console.error("verifyOTP error:", error);
                throw error;
            }
        } else {
            // Mock OTP verify: allow code '123456' or any 6-digit code for testing
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (otpCode === '123456' || otpCode.length === 6) {
                        const mockUser = {
                            uid: "MOCK_PH_" + Math.random().toString(36).substr(2, 9),
                            displayName: "Khách hàng " + (window.pendingRegisterName || "OTP"),
                            phoneNumber: "0901234567",
                            photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100"
                        };
                        this.saveUser(mockUser);
                        resolve(mockUser);
                    } else {
                        reject(new Error("Mã OTP không đúng."));
                    }
                }, 800);
            });
        }
    },

    // Step 3c: Complete Register
    async registerUser(username, password, displayName, phoneNumber, uid = null) {
        const customer = {
            uid: uid || "MOCK_PH_" + Math.random().toString(36).substr(2, 9),
            username: username,
            displayName: displayName,
            phoneNumber: phoneNumber,
            photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" // Stylish avatar
        };
        this.saveUser(customer);
        return customer;
    }
};

// Make CustomerAuth available globally
window.CustomerAuth = CustomerAuth;
