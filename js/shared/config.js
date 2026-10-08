// ==========================================
// CẤU HÌNH DÙNG CHUNG (Firebase + Thanh toán)
// Chỉ sửa thông tin ở file này, không sửa trong code logic.
// ==========================================

if (typeof window.firebaseConfig === 'undefined') {
    window.firebaseConfig = {
        apiKey: "AIzaSyAklc0eHKgJn6qC_WAN2Kp8pb2AZfdod1k",
        authDomain: "croco-closet.firebaseapp.com",
        databaseURL: "https://croco-closet-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "croco-closet",
        storageBucket: "croco-closet.firebasestorage.app",
        messagingSenderId: "758509764425",
        appId: "1:758509764425:web:486445cb670f08ed716498",
        measurementId: "G-KJPC5HK3GT"
    };
}

// Tài khoản nhận chuyển khoản (dùng tạo mã VietQR ở bước thanh toán)
const BANK_CONFIG = {
    bankCode: "Techcombank",
    accountNumber: "9999993006",
    accountName: "TRAN NGUYEN KHANH VY"
};
