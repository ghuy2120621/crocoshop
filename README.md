# AURA / Croco closet – cấu trúc code mới

Hai trang: **index.html** (quản trị AURA) và **customer.html** (cửa hàng cho khách). Dữ liệu dùng Firebase Realtime Database.

## Chạy thử
```
python -m http.server 8000      # mở http://localhost:8000/index.html
ngrok http 8000                 # nếu cần link public (log cũ nằm trong logs/)
```
Cần có thư mục `images/` (ví dụ `images/admin_avatar.png`) cạnh `index.html`.

## Cấu trúc
```
index.html            Trang quản trị
customer.html         Trang khách
css/admin/*.css       12 file: variables, reset, layout, sidebar, header, content, overview,
                      inventory-orders, revenue, modal, toast, responsive
css/customer/*.css    21 file: base, header, hero, catalog, product-detail, cart-checkout, ...
js/shared/            Dùng chung 2 trang
  config.js           Firebase config + thông tin ngân hàng VietQR  (SỬA THÔNG TIN Ở ĐÂY)
  firebase-init.js    Khởi tạo Firebase 1 lần
  storage.js          localStorage an toàn, đối tượng `database`, saveDatabase()
  utils.js            formatPrice, escapeHtml (chống XSS)
  normalizers.js      Chuẩn hóa sản phẩm / đơn hàng từ Firebase
  products-sync.js    Đồng bộ realtime sản phẩm + đơn hàng
js/admin/             constants, toast, layout, navigation, image-utils, order-helpers,
                      dashboard, inventory, product-form, orders, charts, banner, main
js/customer/          error-handler, constants, state, toast, data-sync, wishlist, navigation,
                      product-cards, routing, product-detail, search, cart, checkout,
                      my-orders, size-guide, auth-service, account, banner, main
logs/                 Log ngrok cũ (không dùng cho web)
```

## Quy tắc quan trọng
- Các file JS là script thường (không phải module) nên **thứ tự thẻ `<script>` trong HTML là thứ tự bắt buộc**. `main.js` luôn nạp cuối cùng.
- Đồng bộ Firebase **không tự chạy**: `main.js` của mỗi trang gọi `startProductsSync()` / `startOrdersSync()` sau khi đã nạp xong mọi file.
- Muốn đổi tài khoản nhận tiền: sửa `BANK_CONFIG` trong `js/shared/config.js`.
- Sau khi sửa file, tăng `?v=2.0` trong HTML để trình duyệt/ngrok không dùng bản cũ.

## Đã sửa so với bản gốc
1. **KPI doanh thu = 0**: bản gốc so trạng thái `"shipped"`, trong khi đơn mới lưu `"Giao thành công"`. Nay chuẩn hóa cả 2 kiểu (ảnh hưởng: doanh thu, số đơn, tỷ lệ hủy, huy hiệu đơn chờ, thẻ báo cáo).
2. **XSS**: tên/SĐT/địa chỉ khách nhập được đưa thẳng vào bảng admin. Nay đã escape.
3. Trang khách không còn tải code admin (nhẹ hơn); bỏ code trùng (config Firebase 3 chỗ, chuẩn hóa sản phẩm 2 chỗ, đọc đơn hàng 2 chỗ, 3 khối màu biểu đồ).
4. Lỗi font ở thông báo banner, lỗi chính tả "Khống có thông tin SP".
5. Admin không bị xóa trắng danh sách khi mở trang khách ở tab khác.

## Còn tồn tại (chưa đổi vì ảnh hưởng dữ liệu/quy trình của bạn)
- Biểu đồ đường doanh thu đang dùng **số liệu mẫu** (45, 62, 58…), chưa tính từ đơn thật.
- Mỗi lần lưu sản phẩm, code ghi cả `database` (kèm ảnh base64) vào node `fashion_shop_db` trên Firebase – nặng và không có chỗ nào đọc lại.
- Trang admin chưa có đăng nhập; trang khách tải toàn bộ node `orders`. Cần siết **Firebase Rules** (xem ghi chú trong tin nhắn).
