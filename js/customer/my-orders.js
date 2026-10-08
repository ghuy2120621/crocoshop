// ==========================================
// TRANG KHÁCH: ĐƠN HÀNG CỦA TÔI (tra cứu, lọc, hủy đơn)
// ==========================================

// --- MY ORDERS SYSTEM ---
window.currentOrderTabFilter = "Tất cả";

window.showView = function (viewName) {
    const homeView = document.getElementById('home-view');
    const ordersView = document.getElementById('orders-view');
    const catalogSection = document.getElementById('catalog-section');
    const allProductsSection = document.getElementById('all-products-section');
    const detailSection = document.getElementById('detail-section');

    if (catalogSection) catalogSection.style.display = 'block';
    if (detailSection) detailSection.classList.remove('active');

    if (viewName === 'orders') {
        if (homeView) homeView.style.display = 'none';
        if (ordersView) ordersView.style.display = 'block';
        window.scrollTo(0, 0);
        window.location.hash = "#orders";
        loadCustomerOrders(); // Gọi hàm kéo đơn từ Firebase
    } else {
        if (homeView) homeView.style.display = 'block';
        if (ordersView) ordersView.style.display = 'none';
        if (allProductsSection) allProductsSection.style.display = 'none';
        window.scrollTo(0, 0);
        window.location.hash = "";
        // Vẽ lại sản phẩm trang chủ khi quay về trang chủ để đảm bảo hiển thị đầy đủ
        if (typeof renderHomepageProducts === "function") {
            renderHomepageProducts();
        }
    }
};

window.showMyOrdersSection = function (e) {
    if (e) e.preventDefault();
    showView('orders');
};

window.setOrderTabFilter = function (tabName) {
    window.currentOrderTabFilter = tabName;

    const tabs = document.querySelectorAll('.order-tab-btn');
    tabs.forEach(t => {
        if (t.textContent.trim() === tabName) {
            t.classList.add('active');
        } else {
            t.classList.remove('active');
        }
    });

    loadCustomerOrders();
};

window.loadCustomerOrders = function () {
    renderMyOrders(document.getElementById("lookupPhoneInput").value || "");
};

function renderCustomerOrders(orders) {
    const container = document.querySelector('#my-orders-list');
    if (!container) return;

    const orderKeys = Object.keys(orders);
    if (orderKeys.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">Bạn chưa có đơn hàng nào.</p>';
        return;
    }

    container.innerHTML = orderKeys.map(orderId => {
        const order = orders[orderId];
        if (!order) return '';

        // Render danh sách sản phẩm trong đơn của khách (Ảnh thu nhỏ 60x70px + Tên sản phẩm + Số lượng + Đơn giá)
        const itemsHTML = (order.items || []).map(item => `
            <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
                <img src="${item.image || (item.images ? item.images[0] : '')}" style="width:60px; height:70px; object-fit:cover; border-radius:4px;">
                <div>
                    <div style="font-weight:bold;">${item.name || item.title}</div>
                    <div style="font-size:13px; color:#666;">Số lượng: ${item.quantity || 1} x ${(item.price || 0).toLocaleString('vi-VN')} VNĐ</div>
                </div>
            </div>
        `).join('');

        // Nút hủy đơn (Chỉ hiện khi đơn ở trạng thái "Chờ xác nhận")
        const cancelBtnHTML = order.status === 'Chờ xác nhận'
            ? `<button onclick="cancelOrder('${orderId}')" style="background:#ef4444; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">Hủy đơn hàng</button>`
            : '';

        return `
            <div style="border:1px solid #e4e4e7; border-radius:8px; padding:15px; margin-bottom:15px; background:#fff;">
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding-bottom:8px;">
                    <div><b>Mã đơn: #${order.orderId || orderId}</b></div>
                    <div style="font-weight:bold; color:#2563eb;">Trạng thái: ${order.status || 'Chờ xác nhận'}</div>
                </div>

                <div>${itemsHTML}</div>

                <div style="margin-top:12px; padding:10px; background:#f8fafc; border-radius:6px; font-size:14px;">
                    <div><b>Tổng tiền:</b> ${(order.totalPrice || 0).toLocaleString('vi-VN')} VNĐ</div>
                    <div><b>Hình thức thanh toán:</b> ${order.paymentMethod === 'BANK' ? 'Chuyển khoản VietQR' : 'Tiền mặt (COD)'}</div>
                    <div style="color:#059669; font-weight:bold; margin-top:4px;">
                        🚚 Dự kiến giao hàng: ${order.deliveryDate || 'Đang cập nhật...'}
                    </div>
                </div>

                <div style="text-align:right; margin-top:10px;">
                    ${cancelBtnHTML}
                </div>
            </div>
        `;
    }).join('');
}

// Hàm Hủy Đơn phía Khách hàng
window.cancelOrder = function (orderId) {
    if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
        if (isFirebaseEnabled) {
            firebase.database().ref('orders/' + orderId).update({
                status: 'Đã hủy'
            }).then(() => {
                alert("Đã hủy đơn hàng thành công!");
                loadCustomerOrders();
            }).catch(err => {
                console.error("Lỗi hủy đơn hàng trên Firebase:", err);
                alert("Không thể hủy đơn hàng trên hệ thống. Vui lòng liên hệ hỗ trợ!");
            });
        } else {
            const index = database.orders.findIndex(o => o.id === orderId || o.orderId === orderId);
            if (index !== -1) {
                database.orders[index].status = 'Đã hủy';
                saveDatabase();
                loadCustomerOrders();
                alert("Đã hủy đơn hàng thành công (Offline)!");
            }
        }
    }
};

window.renderMyOrders = function (searchPhone = "") {
    const container = document.getElementById("my-orders-list");
    if (!container) return;

    let targetOrderIds = [];
    try {
        targetOrderIds = JSON.parse(localStorage.getItem("customer_placed_order_ids")) || [];
    } catch (e) { }

    // Filter orders from local database.orders
    const orders = database.orders || [];
    let displayOrders = [];

    if (searchPhone.trim() !== "") {
        const phoneQuery = searchPhone.trim().toLowerCase();
        displayOrders = orders.filter(o => o.phone && o.phone.toLowerCase().includes(phoneQuery));
    } else {
        displayOrders = orders.filter(o => targetOrderIds.includes(o.orderId) || targetOrderIds.includes(o.id));
    }

    // Filter by order tab status
    if (window.currentOrderTabFilter && window.currentOrderTabFilter !== 'Tất cả') {
        displayOrders = displayOrders.filter(o => {
            const status = o.status;
            if (window.currentOrderTabFilter === 'Chờ xác nhận') {
                return status === 'Chờ xác nhận' || status === 'pending';
            }
            if (window.currentOrderTabFilter === 'Đã xác nhận') {
                return status === 'Đã xác nhận' || status === 'approved';
            }
            if (window.currentOrderTabFilter === 'Đang giao') {
                return status === 'Đang giao' || status === 'Đang giao hàng' || status === 'processing';
            }
            if (window.currentOrderTabFilter === 'Hoàn thành') {
                return status === 'Hoàn thành' || status === 'Giao thành công' || status === 'shipped';
            }
            if (window.currentOrderTabFilter === 'Đã hủy') {
                return status === 'Đã hủy' || status === 'cancelled';
            }
            return false;
        });
    }

    // Convert array list back to dictionary/object for template
    const displayOrdersMap = {};
    displayOrders.forEach(o => {
        const id = o.orderId || o.id;
        displayOrdersMap[id] = o;
    });

    renderCustomerOrders(displayOrdersMap);
};

// Gắn sự kiện click cho nút "Đơn hàng của tôi" trên Header
const setupMyOrdersButton = () => {
    const myOrdersBtn = document.querySelector('.my-orders-btn');
    if (myOrdersBtn) {
        myOrdersBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showView('orders');
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMyOrdersButton);
} else {
    setupMyOrdersButton();
}

// Lookup search actions
const lookupOrdersBtn = document.getElementById("lookupOrdersBtn");
if (lookupOrdersBtn) {
    lookupOrdersBtn.addEventListener("click", () => {
        const phone = document.getElementById("lookupPhoneInput").value;
        renderMyOrders(phone);
    });
}
