// ==========================================
// ADMIN: QUẢN LÝ ĐƠN HÀNG (danh sách, đổi trạng thái, ngày giao)
// ==========================================

let isAdminOrdersListening = false;
function initAdminOrders() {
    const tbody = document.getElementById('admin-orders-tbody');
    if (!tbody) return;

    if (isAdminOrdersListening) {
        if (window.firebaseOrders) {
            renderAdminOrdersHTML(window.firebaseOrders, tbody);
        }
        return;
    }
    isAdminOrdersListening = true;

    // Nạp nhanh từ local storage cache trước để vẽ giao diện tức thì
    const localData = localStorage.getItem("fashion_shop_db");
    if (localData) {
        try {
            const parsed = JSON.parse(localData);
            const orders = parsed.orders || [];
            if (orders.length > 0) {
                const ordersData = {};
                orders.forEach(o => {
                    const key = o.orderId || o.id;
                    if (key) {
                        ordersData[key] = o;
                    }
                });
                window.firebaseOrders = ordersData;
                renderAdminOrdersHTML(ordersData, tbody);
            }
        } catch (e) {
            console.error("Lỗi đọc cache orders admin:", e);
        }
    }

    if (isFirebaseEnabled) {
        firebase.database().ref('orders').on('value', (snapshot) => {
            try {
                const ordersData = snapshot.val();
                window.firebaseOrders = ordersData || {};
                if (!ordersData) {
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px; color:#888;">Chưa có đơn hàng nào trong hệ thống</td></tr>';
                    return;
                }
                renderAdminOrdersHTML(ordersData, tbody);
            } catch (err) {
                console.error("Lỗi khi xử lý dữ liệu đơn hàng realtime:", err);
            }
        });
    } else {
        // Fallback: build dictionary from local database.orders
        const ordersData = {};
        (database.orders || []).forEach(o => {
            const key = o.orderId || o.id;
            if (key) {
                ordersData[key] = o;
            }
        });
        window.firebaseOrders = ordersData;
        renderAdminOrdersHTML(ordersData, tbody);
    }
}

function matchesOrderStatusFilter(order, statusVal) {
    if (statusVal === "all") return true;
    const mappedFilter = ORDER_STATUS_KEY_TO_LABEL[statusVal] || statusVal;
    return order.status === statusVal || order.status === mappedFilter;
}

function buildOrderRowHTML(key, order) {
    // Danh sách sản phẩm (tránh lỗi [object Object])
    let itemsHTML = 'Không có thông tin SP';
    if (Array.isArray(order.items)) {
        itemsHTML = order.items.map(item => `
            <div style="margin-bottom: 4px; font-size: 13px;">
                • <b>${escapeHtml(item.name || item.title || 'Sản phẩm')}</b>
                <span style="color:#aaa;">(x${escapeHtml(item.quantity || 1)})</span>
            </div>
        `).join('');
    }

    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : (order.date || 'N/A');
    const keyAttr = escapeHtml(key);
    const keyArg = escapeJsArg(key);
    const statusOptions = ORDER_STATUSES.map(s =>
        `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    return `
        <tr style="border-bottom: 1px solid #2d3748;">
            <td style="padding: 12px;"><b>#${escapeHtml(order.orderId || key)}</b></td>
            <td style="padding: 12px;">
                <b>${escapeHtml(order.customerName || 'Khách hàng')}</b><br>
                <small style="color:#aaa;">SĐT: ${escapeHtml(order.phone || 'N/A')}</small><br>
                <small style="color:#aaa;">Đ/c: ${escapeHtml(order.address || 'N/A')}</small>
            </td>
            <td style="padding: 12px;">${itemsHTML}</td>
            <td style="padding: 12px;">${orderDate}</td>
            <td style="padding: 12px; color: #4ade80; font-weight: bold;">
                ${getOrderTotal(order).toLocaleString('vi-VN')} VNĐ
            </td>
            <td style="padding: 12px;">
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #374151; color: #fbbf24;">
                    ${escapeHtml(order.status || 'Chờ xác nhận')}
                </span>
            </td>
            <td style="padding: 12px;">
                <select onchange="updateOrderStatus('${keyArg}', this.value)" style="background: #1f2937; color: #fff; border: 1px solid #374151; padding: 4px; border-radius: 4px; margin-bottom: 6px;">
                    ${statusOptions}
                </select>
                <br>
                <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
                    <div>Từ ngày: <input type="date" id="from-${keyAttr}" value="${escapeHtml(order.deliveryFrom || '')}" style="background:#111827; color:#fff; border:1px solid #374151;"></div>
                    <div style="margin-top:2px;">Đến ngày: <input type="date" id="to-${keyAttr}" value="${escapeHtml(order.deliveryTo || '')}" style="background:#111827; color:#fff; border:1px solid #374151;"></div>
                    <button onclick="saveDeliveryDates('${keyArg}')" style="margin-top: 4px; background: #2563eb; color: #fff; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">Lưu ngày</button>
                </div>
            </td>
        </tr>
    `;
}

function renderAdminOrdersHTML(ordersData, tbody) {
    try {
        const searchInput = document.getElementById("orderSearch");
        const statusSelect = document.getElementById("orderStatusFilter");
        const searchVal = searchInput ? searchInput.value.toLowerCase() : "";
        const statusVal = statusSelect ? statusSelect.value : "all";

        const orderKeys = Object.keys(ordersData).reverse().filter(key => {
            try {
                const order = ordersData[key];
                if (!order) return false;

                const customerInfo = (order.customerName || order.customer || "").toLowerCase();
                const matchesSearch = customerInfo.includes(searchVal) || key.toLowerCase().includes(searchVal);
                return matchesSearch && matchesOrderStatusFilter(order, statusVal);
            } catch (filterErr) {
                console.error("Bỏ qua đơn hàng lỗi khi lọc:", key, filterErr);
                return false;
            }
        });

        if (orderKeys.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 20px; color:#888;">Không tìm thấy đơn hàng nào khớp bộ lọc</td></tr>';
            return;
        }

        tbody.innerHTML = orderKeys.map(key => {
            try {
                const order = ordersData[key];
                return order ? buildOrderRowHTML(key, order) : '';
            } catch (mapErr) {
                console.error("Bỏ qua đơn hàng lỗi khi render:", key, mapErr);
                return '';
            }
        }).join('');
    } catch (e) {
        console.error("Lỗi render danh sách đơn hàng:", e);
    }
}

function renderOrders() {
    initAdminOrders();
}

window.saveDeliveryDates = function (orderKey) {
    const fromDate = document.getElementById(`from-${orderKey}`).value;
    const toDate = document.getElementById(`to-${orderKey}`).value;

    if (!fromDate || !toDate) {
        alert("Vui lòng chọn đầy đủ Từ ngày và Đến ngày!");
        return;
    }

    const formatDateStr = (str) => {
        const [y, m, d] = str.split('-');
        return `${d}/${m}/${y}`;
    };

    const deliveryDateText = `Từ ${formatDateStr(fromDate)} đến ${formatDateStr(toDate)}`;

    if (isFirebaseEnabled) {
        firebase.database().ref(`orders/${orderKey}`).update({
            deliveryFrom: fromDate,
            deliveryTo: toDate,
            deliveryDate: deliveryDateText
        }).then(() => alert("Đã lưu lịch giao hàng dự kiến!"));
    } else {
        const index = database.orders.findIndex(o => o.id === orderKey || o.orderId === orderKey);
        if (index !== -1) {
            database.orders[index].deliveryFrom = fromDate;
            database.orders[index].deliveryTo = toDate;
            database.orders[index].deliveryDate = deliveryDateText;
            saveDatabase();
            renderOrders();
            alert("Đã lưu lịch giao hàng dự kiến (Offline)!");
        }
    }
};

window.updateOrderStatus = function (orderKey, newStatus) {
    if (isFirebaseEnabled) {
        firebase.database().ref(`orders/${orderKey}`).update({
            status: newStatus
        }).then(() => {
            alert("Đã cập nhật trạng thái đơn hàng!");
        });
    } else {
        const index = database.orders.findIndex(o => o.id === orderKey || o.orderId === orderKey);
        if (index !== -1) {
            database.orders[index].status = newStatus;
            saveDatabase();
            renderOrders();
            alert("Đã cập nhật trạng thái đơn hàng (Offline)!");
        }
    }
};

window.approveOrder = function (id) {
    const index = database.orders.findIndex(o => o.id === id);
    if (index !== -1) {
        database.orders[index].status = "Đã xác nhận";
        showToast(`Đã duyệt đơn hàng #${id} thành công!`);

        saveDatabase();
        renderOrders();
        updateDashboardOverview();
        updateChartsFromState();
    }
};

// Ô tìm kiếm + bộ lọc trạng thái đơn hàng
function setupOrderFilters() {
    const orderSearch = document.getElementById("orderSearch");
    if (orderSearch) {
        orderSearch.addEventListener("input", renderOrders);
    }
    const orderStatusFilter = document.getElementById("orderStatusFilter");
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener("change", renderOrders);
    }
}
