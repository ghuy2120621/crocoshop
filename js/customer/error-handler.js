// ==========================================
// TRANG KHÁCH: BẮT LỖI TOÀN CỤC (bỏ qua lỗi do Zalo/webview chèn vào)
// ==========================================

window.onerror = function (message, source, lineno, colno, error) {
    const msgStr = String(message || "");
    const srcStr = String(source || "");
    // Suppress errors injected by Zalo or external webviews
    if (
        msgStr.includes("zaloJSV2") ||
        msgStr.includes("Zalo") ||
        msgStr.includes("zalo") ||
        srcStr.includes("zalo")
    ) {
        return true; // Ignore and do not let it block execution
    }
    console.error("Lỗi JavaScript (Toàn cục):", message, "tại dòng:", lineno, "file:", source);
    return true; // Suppress alerts in production
};
