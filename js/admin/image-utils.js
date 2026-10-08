// ==========================================
// ADMIN: XỬ LÝ ẢNH (nén ảnh trước khi lưu lên Firebase)
// ==========================================

// Hàm nén ảnh bằng canvas để giảm dung lượng trước khi đẩy lên Firebase
function compressImage(base64Str, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = function () {
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            const compressed = canvas.toDataURL("image/jpeg", quality);
            resolve(compressed);
        };
        img.onerror = function () {
            resolve(base64Str);
        };
    });
}

// Đọc file ảnh -> nén bằng canvas -> trả về chuỗi base64 (Promise)
function readAndCompressImage(file, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => resolve(await compressImage(e.target.result, maxWidth, maxHeight, quality));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}
