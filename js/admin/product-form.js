// ==========================================
// ADMIN: FORM THÊM / SỬA SẢN PHẨM
// ==========================================

// Trạng thái ảnh của form sản phẩm
let currentProductImages = [];
let selectedFiles = [];

function renderImagePreviews(images) {
    const container = document.getElementById("imagePreviewContainer");
    if (!container) return;
    container.innerHTML = "";

    const imageList = Array.isArray(images) ? images : (images ? [images] : []);
    imageList.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.style.width = "60px";
        img.style.height = "60px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "6px";
        img.style.border = "1px solid rgba(255,255,255,0.1)";
        container.appendChild(img);
    });
}

window.updateSubCategoryOptions = function (cat, selectedVal = "") {
    const productSubCategory = document.getElementById("productSubCategory");
    if (!productSubCategory) return;

    productSubCategory.innerHTML = `<option value="" disabled ${!selectedVal ? 'selected' : ''}>Chọn phân loại chi tiết</option>`;

    const options = subCategoryMap[cat] || [];
    if (options.length > 0) {
        productSubCategory.disabled = false;
        productSubCategory.required = true;
        options.forEach(opt => {
            const isSelected = opt.value === selectedVal;
            productSubCategory.innerHTML += `<option value="${opt.value}" ${isSelected ? 'selected' : ''}>${opt.label}</option>`;
        });
    } else {
        productSubCategory.disabled = true;
        productSubCategory.required = false;
    }
};

function upsertLocalProduct(id, productData) {
    const index = database.products.findIndex(p => p.id === id);
    if (index !== -1) {
        database.products[index] = { id, ...productData };
    }
}

// Đọc dữ liệu form -> lưu Firebase (hoặc localStorage khi offline)
async function saveProduct() {
    const prodIdInput = document.getElementById("productId").value;
    const name = document.getElementById("productName").value;
    const category = document.getElementById("productCategory").value.toLowerCase().trim();
    const subCategoryValue = document.getElementById("productSubCategory").value;
    const subCategory = subCategoryValue ? subCategoryValue.toLowerCase().trim() : "";
    const tag = document.getElementById("productTag").value;
    const price = parseInt(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value);

    const sizes = Array.from(document.querySelectorAll('input[name="sizes"]:checked')).map(cb => cb.value);
    const colors = Array.from(document.querySelectorAll('input[name="colors"]:checked')).map(cb => cb.value);

    if (sizes.length === 0) {
        showToast("Vui lòng chọn ít nhất một kích thước!", "error");
        return;
    }
    if (colors.length === 0) {
        showToast("Vui lòng chọn ít nhất một màu sắc!", "error");
        return;
    }

    const prodId = prodIdInput || ("PROD" + String(database.products.length + 1).padStart(3, '0'));

    // Nén từng ảnh mới chọn trước khi chuyển sang base64
    if (selectedFiles.length > 0) {
        currentProductImages = await Promise.all(
            selectedFiles.map(file => readAndCompressImage(file, 1000, 1000, 0.6))
        );
    }

    const productData = {
        name,
        category,
        subCategory,
        sizes,
        colors,
        price,
        stock,
        images: currentProductImages,
        image: currentProductImages[0] || "",
        tag
    };

    try {
        if (isFirebaseEnabled) {
            if (prodIdInput) {
                // Sửa: cập nhật đúng node con
                await firebase.database().ref('products/' + prodIdInput).set(productData);
                upsertLocalProduct(prodIdInput, productData);
            } else {
                // Thêm mới: BẮT BUỘC dùng push()
                const newProductRef = await firebase.database().ref('products').push(productData);
                database.products.push({ id: newProductRef.key, ...productData });
            }
            // Giữ node fashion_shop_db đồng bộ (như bản gốc)
            await firebase.database().ref('fashion_shop_db').set(database);
        } else {
            // Offline: sửa trực tiếp mảng cục bộ
            if (prodIdInput) {
                upsertLocalProduct(prodIdInput, productData);
            } else {
                database.products.push({ id: prodId, ...productData });
            }
            safeSetLocalStorage("fashion_shop_db", JSON.stringify(database));
        }

        showToast("Đã lưu sản phẩm thành công!");

        const modal = document.getElementById("productModal");
        if (modal) modal.classList.remove("open");

        const form = document.getElementById("productForm");
        if (form) form.reset();

        renderAdminDashboard();
    } catch (error) {
        alert("Lỗi lưu lên Firebase: " + error.message);
        console.error("Lỗi đồng bộ Firebase:", error);
        throw error;
    }
}

window.openEditProductModal = function (id) {
    const prod = database.products.find(p => p.id === id);
    if (!prod) return;

    // Reset file input
    const fileInput = document.getElementById("productImage");
    if (fileInput) fileInput.value = "";

    document.getElementById("modalTitle").textContent = "Sửa sản phẩm";
    document.getElementById("productId").value = prod.id;
    document.getElementById("productName").value = prod.name;
    document.getElementById("productCategory").value = prod.category;
    window.updateSubCategoryOptions(prod.category, prod.subCategory || "");
    document.getElementById("productTag").value = prod.tag || "";
    document.getElementById("productPrice").value = prod.price;
    document.getElementById("productStock").value = prod.stock;

    // Reset sizes checkboxes and check matching ones
    const sizeCheckboxes = document.querySelectorAll('input[name="sizes"]');
    sizeCheckboxes.forEach(cb => {
        cb.checked = prod.sizes.includes(cb.value);
    });

    // Reset colors checkboxes and check matching ones
    const colorCheckboxes = document.querySelectorAll('input[name="colors"]');
    colorCheckboxes.forEach(cb => {
        cb.checked = prod.colors.includes(cb.value);
    });

    selectedFiles = []; // Reset selected files state for edits
    currentProductImages = prod.images || [prod.image].filter(Boolean);
    renderImagePreviews(currentProductImages);

    document.getElementById("productModal").classList.add("open");
};

// Gắn sự kiện: mở/đóng modal, đổi danh mục, chọn ảnh, submit form
function setupProductForm() {
    const openAddProductModal = document.getElementById("openAddProductModal");
    const productModal = document.getElementById("productModal");
    const closeProductModal = document.getElementById("closeProductModal");
    const cancelProductBtn = document.getElementById("cancelProductBtn");

    if (openAddProductModal && productModal) {
        openAddProductModal.addEventListener("click", () => {
            document.getElementById("modalTitle").textContent = "Thêm sản phẩm mới";
            document.getElementById("productId").value = "";
            document.getElementById("productForm").reset();
            currentProductImages = []; // Reset current product images state
            selectedFiles = []; // Reset selected files state
            renderImagePreviews([]); // Reset previews
            const productSubCategory = document.getElementById("productSubCategory");
            if (productSubCategory) {
                productSubCategory.innerHTML = '<option value="" disabled selected>Chọn phân loại chi tiết</option>';
                productSubCategory.disabled = true;
            }
            productModal.classList.add("open");
        });
    }

    const productCategory = document.getElementById("productCategory");
    if (productCategory) {
        productCategory.addEventListener("change", () => {
            window.updateSubCategoryOptions(productCategory.value);
        });
    }

    const closeModal = () => productModal.classList.remove("open");

    if (closeProductModal) closeProductModal.addEventListener("click", closeModal);
    if (cancelProductBtn) cancelProductBtn.addEventListener("click", closeModal);

    const productForm = document.getElementById("productForm");
    if (productForm) {
        productForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const saveBtn = document.getElementById("saveProductBtn");
            const originalText = saveBtn ? saveBtn.textContent : "Lưu sản phẩm";
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.textContent = "Đang lưu...";
            }

            try {
                await saveProduct();
            } catch (err) {
                alert("Lỗi lưu sản phẩm: " + err.message);
            } finally {
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = originalText;
                }
            }
        });
    }

    const productImageInput = document.getElementById("productImage");
    if (productImageInput) {
        productImageInput.addEventListener("change", () => {
            const files = productImageInput.files;
            const container = document.getElementById("imagePreviewContainer");
            if (!container) return;
            container.innerHTML = "";

            selectedFiles = Array.from(files);
            currentProductImages = selectedFiles.map(file => URL.createObjectURL(file));
            renderImagePreviews(currentProductImages);
        });
    }
}
