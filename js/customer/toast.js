// ==========================================
// TRANG KHÁCH: THÔNG BÁO NHANH (TOAST)
// ==========================================

function showCustomerToast(message, type = "success") {
    const container = document.getElementById("toastContainerCustomer");
    const toast = document.createElement("div");
    toast.className = `toast-customer ${type}`;

    let icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    if (type === "error") {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    }

    toast.innerHTML = `${icon} <span>${message}</span>`;
    if (type === "error") {
        toast.style.backgroundColor = "#cc0000";
    }

    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
