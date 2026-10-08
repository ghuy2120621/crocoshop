// ==========================================
// TRANG KHÁCH: ĐẶT HÀNG (xác nhận đơn, VietQR, trừ tồn kho)
// Thông tin ngân hàng lấy từ BANK_CONFIG trong js/shared/config.js
// ==========================================

// --- ORDER CONFIRMATION MODAL LOGIC ---
const confirmOrderModalBackdrop = document.getElementById("confirmOrderModalBackdrop");
const closeConfirmOrderBtn = document.getElementById("closeConfirmOrderBtn");
const cancelConfirmOrderBtn = document.getElementById("cancelConfirmOrderBtn");
const submitConfirmOrderBtn = document.getElementById("submitConfirmOrderBtn");
const vietqrDisplayContainer = document.getElementById("vietqrDisplayContainer");
const vietqrImage = document.getElementById("vietqrImage");

let currentOrderData = null; // Temp holder for order info

function openConfirmOrderModal(orderData) {
    currentOrderData = orderData;

    // Populate summary items
    const summaryList = document.getElementById("confirmOrderItemsList");
    summaryList.innerHTML = "";
    orderData.items.forEach(item => {
        const div = document.createElement("div");
        div.className = "confirm-order-item";
        div.innerHTML = `
            <span>${item.name} (${item.size}, ${item.color}) x ${item.quantity}</span>
            <span>${formatPrice(item.price * item.quantity)}</span>
        `;
        summaryList.appendChild(div);
    });

    document.getElementById("confirmOrderTotal").textContent = formatPrice(orderData.totalPrice);
    document.getElementById("confirmCustomerName").textContent = orderData.customerName;
    document.getElementById("confirmCustomerPhone").textContent = orderData.phone;
    document.getElementById("confirmCustomerAddress").textContent = orderData.address;

    // Default radio selection to COD
    const codRadio = document.querySelector('input[name="paymentMethod"][value="COD"]');
    if (codRadio) codRadio.checked = true;
    vietqrDisplayContainer.style.display = "none";

    // Show modal
    confirmOrderModalBackdrop.classList.add("open");
}

function closeConfirmOrderModal() {
    confirmOrderModalBackdrop.classList.remove("open");
    currentOrderData = null;
}

// Close actions
if (closeConfirmOrderBtn) closeConfirmOrderBtn.addEventListener("click", closeConfirmOrderModal);
if (cancelConfirmOrderBtn) cancelConfirmOrderBtn.addEventListener("click", closeConfirmOrderModal);

// Listen for payment method switch
document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
        if (e.target.value === "BANK" && currentOrderData) {
            // Update VietQR image src and show it
            const amount = currentOrderData.totalPrice;
            const orderId = currentOrderData.orderId;
            vietqrImage.src = `https://img.vietqr.io/image/${BANK_CONFIG.bankCode}-${BANK_CONFIG.accountNumber}-compact2.png?amount=${amount}&addInfo=DATHANG%20${orderId}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
            vietqrDisplayContainer.style.display = "block";
        } else {
            vietqrDisplayContainer.style.display = "none";
        }
    });
});

// Checkout submit (opens confirm modal)
document.getElementById("checkoutForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const customerName = document.getElementById("customerName").value;
    const customerPhone = document.getElementById("customerPhone").value;
    const customerAddress = document.getElementById("customerAddress").value;
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

    // Generate order details
    const orderId = "DH" + Date.now();
    const items = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        size: item.size,
        color: item.color,
        quantity: item.quantity || 1,
        image: item.image || ""
    }));

    const orderData = {
        orderId: orderId,
        customerName: customerName,
        phone: customerPhone,
        address: customerAddress,
        items: items,
        totalPrice: totalPrice
    };

    openConfirmOrderModal(orderData);
});

// Touchstart and Click handling for Place Order Button to make it bulletproof on Mobile
const placeOrderBtn = document.querySelector("#checkoutForm .place-order-btn");
if (placeOrderBtn) {
    const handlePlaceOrderMobileTrigger = (e) => {
        // Check validity of form fields before manual trigger
        const form = document.getElementById("checkoutForm");
        if (form && form.checkValidity()) {
            e.preventDefault();
            // Dispatch submit event to form
            form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
    };
    placeOrderBtn.addEventListener("touchstart", handlePlaceOrderMobileTrigger, { passive: false });
}

// Touchstart and Click handling for submitConfirmOrderBtn to prevent mobile delays
if (submitConfirmOrderBtn) {
    const handleOrderSubmission = (e) => {
        e.preventDefault();
        if (!currentOrderData) return;

        // Disable button to prevent double submits
        submitConfirmOrderBtn.disabled = true;

        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const orderId = currentOrderData.orderId;

        const finalOrder = {
            id: orderId, // compat with admin
            orderId: orderId,
            customerName: currentOrderData.customerName,
            phone: currentOrderData.phone,
            address: currentOrderData.address,
            items: currentOrderData.items,
            totalPrice: currentOrderData.totalPrice,
            total: currentOrderData.totalPrice, // compat with admin
            paymentMethod: paymentMethod,
            status: "Chờ xác nhận",
            deliveryDate: "Đang cập nhật",
            createdAt: new Date().toISOString(),
            customer: `${currentOrderData.customerName} (SĐT: ${currentOrderData.phone}, Đ/c: ${currentOrderData.address})`,
            date: new Date().toLocaleDateString('vi-VN')
        };

        // Push directly to orders/${orderId} node on Firebase
        if (isFirebaseEnabled) {
            firebase.database().ref('orders/' + orderId).set(finalOrder)
                .then(() => {
                    finalizeCheckoutFlow(orderId);
                })
                .catch(err => {
                    console.error("Lỗi đặt đơn hàng lên Firebase:", err);
                    alert("Đã xảy ra lỗi khi gửi đơn hàng lên hệ thống. Vui lòng liên hệ hỗ trợ!");
                    submitConfirmOrderBtn.disabled = false;
                });
        } else {
            // Fallback to local array
            database.orders.push(finalOrder);
            saveDatabase();
            finalizeCheckoutFlow(orderId);
        }
    };

    submitConfirmOrderBtn.addEventListener("click", handleOrderSubmission);
    submitConfirmOrderBtn.addEventListener("touchstart", handleOrderSubmission, { passive: false });
}

function finalizeCheckoutFlow(orderId) {
    // Save placed order ID to local history for tracking
    let placedIds = [];
    try {
        placedIds = JSON.parse(localStorage.getItem("customer_placed_order_ids")) || [];
    } catch (e) { }
    placedIds.push(orderId);
    localStorage.setItem("customer_placed_order_ids", JSON.stringify(placedIds));

    // Reduce stock locally if Firebase not sync, though Firebase does it when we fetch
    currentOrderData.items.forEach(cartItem => {
        const prod = database.products.find(p => p.id === cartItem.id);
        if (prod) {
            prod.stock = Math.max(0, (prod.stock || 0) - (cartItem.quantity || 1));
        }
    });

    // Update Firebase products stock
    if (isFirebaseEnabled) {
        currentOrderData.items.forEach(cartItem => {
            const prod = database.products.find(p => p.id === cartItem.id);
            if (prod) {
                firebase.database().ref('products/' + prod.id + '/stock').set(prod.stock)
                    .then(() => console.log(`Cập nhật tồn kho sản phẩm ${prod.id} thành công.`))
                    .catch(err => console.error(`Lỗi cập nhật tồn kho cho sản phẩm ${prod.id}:`, err));
            }
        });
    } else {
        saveDatabase();
    }

    // Clear cart
    cart = [];
    updateCartBadge();
    closeConfirmOrderModal();
    closeCart();

    alert(`Chúc mừng! Đơn hàng #${orderId} của bạn đã được đặt thành công.`);

    // Reset forms
    document.getElementById("checkoutForm").reset();
    if (submitConfirmOrderBtn) submitConfirmOrderBtn.disabled = false;

    // Redirect user to My Orders section
    showMyOrdersSection(null);
}
