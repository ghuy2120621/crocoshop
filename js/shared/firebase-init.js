// ==========================================
// KHỞI TẠO FIREBASE (chạy 1 lần cho cả trang Admin & Khách)
// Yêu cầu: SDK Firebase + config.js đã được nạp trước.
// ==========================================

let isFirebaseEnabled = false;

try {
    if (typeof firebase !== 'undefined' && window.firebaseConfig.apiKey !== "YOUR_API_KEY") {
        if (firebase.apps.length === 0) {
            firebase.initializeApp(window.firebaseConfig);
        }
        isFirebaseEnabled = true;
        console.log("Firebase initialized successfully.");
    }
} catch (error) {
    console.warn("Lỗi khởi tạo Firebase:", error);
}

// Giám sát trạng thái kết nối tới Firebase Realtime Database
if (isFirebaseEnabled) {
    firebase.database().ref(".info/connected").on("value", (snap) => {
        if (snap.val() === true) {
            console.log("Kết nối tới Firebase Realtime Database thành công!");
        } else {
            console.warn("Đang thử kết nối hoặc mất kết nối tới Firebase Realtime Database...");
        }
    }, (error) => {
        console.error("Lỗi khi kết nối hoặc xác thực Firebase Realtime Database:", error);
    });
}
