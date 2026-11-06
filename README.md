# BG CLUB · Mini Game Bốc Thăm Thi Đấu

Ứng dụng bốc thăm chia cặp xoay vòng cầu lông, pickleball và thể thao thông minh, công bằng, tự động tính điểm và xếp hạng dành cho BG CLUB.

---

## 🚀 Hướng Dẫn Triển Khai Lên Netlify

Dự án đã được cấu hình sẵn toàn bộ cho Netlify:
- File cấu hình `netlify.toml` đã được tạo sẵn ở thư mục gốc.
- File điều hướng SPA `public/_redirects` đã sẵn sàng.

### Cách 1: Triển khai qua GitHub (Tự động cập nhật khi có code mới - Khuyên dùng)
1. Đẩy mã nguồn dự án này lên tài khoản GitHub của bạn.
2. Đăng nhập vào [Netlify](https://app.netlify.com).
3. Bấm **Add new site** > **Import an existing project**.
4. Chọn **GitHub** và chọn repository dự án của bạn.
5. Netlify sẽ tự nhận diện cài đặt từ file `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Bấm **Deploy Site**. Chỉ sau 1-2 phút, bạn sẽ có liên kết web trực tiếp để gửi cho tất cả thành viên trong câu lạc bộ!

---

### Cách 2: Triển khai nhanh bằng kéo thả (Netlify Drop - Không cần GitHub)
1. Chạy lệnh build trên máy tính của bạn:
   ```bash
   npm run build
   ```
2. Thư mục `dist` sẽ được tạo ra chứa toàn bộ mã nguồn tĩnh.
3. Truy cập [app.netlify.com/drop](https://app.netlify.com/drop).
4. Kéo thả thư mục `dist` vào trang web của Netlify.
5. Netlify sẽ cấp ngay cho bạn một link web hoạt động ngay lập tức!

---

## 🏸 Tính Năng Chính
1. **Chia 3 rổ thăm:** Nam A, Nam B và Nữ.
2. **Luật ghép cặp đôi:** Mỗi đội gồm **Nam A + Nam B** hoặc **Nam + Nữ**.
3. **Thuật toán xoay vòng công bằng:**
   - Ưu tiên những người đang chờ ở ngoài và có số lượt ra sân ít nhất.
   - Khi tất cả người chơi có mặt đã ra sân cùng số lượt, hệ thống tự động nhảy sang lượt mới.
   - Thuật toán phạt chống lặp: hạn chế tối đa việc chung đội hoặc đối đầu với cùng 1 đối thủ nhiều lần.
4. **Hiệu ứng bốc thăm:** Slot machine sinh động, rung haptic trên điện thoại.
5. **Nhập tỉ số nhanh:** Nút tắt chạm 15 điểm cho mỗi đội.
6. **Bảng xếp hạng tự động:**
   - Xếp theo: Số trận thắng → Tỉ lệ thắng → Hiệu số điểm.
   - Lọc theo từng rổ hoặc tất cả.
   - Nút **Sao chép kết quả gửi Zalo** định dạng đẹp mắt chỉ với 1 chạm.
7. **Bảo lưu dữ liệu:** Toàn bộ dữ liệu được lưu an toàn trên trình duyệt (LocalStorage) và có tính năng Tải file sao lưu / Khôi phục dữ liệu JSON.
