# MyNotch

MyNotch biến notch của MacBook thành chỗ làm việc: nhạc và phụ đề phim, clipboard, lịch, hẹn giờ, pin, khay file, việc cần làm, AI agents, ảnh chụp, dịch và nhiều module khác, bật tắt riêng từng cái.

- Trang giới thiệu: https://mynotch.truongquocdat.id.vn/
- Hướng dẫn sử dụng: https://mynotch.truongquocdat.id.vn/huong-dan.html
- Tải bản mới nhất: [MyNotch-macOS.zip](https://github.com/DattruongRyan1912/mynotch-app/releases/latest/download/MyNotch-macOS.zip) · [tất cả các bản](https://github.com/DattruongRyan1912/mynotch-app/releases)

Repo này chỉ chứa các bản phát hành và mã nguồn trang web. Mã nguồn của app nằm ở repo riêng.

## Yêu cầu

- macOS 26 trở lên, Mac Apple silicon.
- Tối ưu cho MacBook có notch; màn hình không có notch thì MyNotch hiện dạng viên ở giữa cạnh trên.

## Cài đặt

1. Tải `MyNotch-macOS.zip` ở trang Releases, kiểm SHA-256 nếu muốn:

   ```bash
   shasum -a 256 ~/Downloads/MyNotch-macOS.zip
   ```

2. Giải nén và kéo `MyNotch.app` vào thư mục **Applications**. Khi cập nhật, thoát MyNotch rồi xoá bản cũ trước khi chép bản mới (không chép đè).
3. Lần mở đầu macOS chặn app vì app chưa được Apple công chứng (notarize). Mở **System Settings → Privacy & Security**, kéo xuống và bấm **Open Anyway**. Hoặc trong Terminal:

   ```bash
   xattr -dr com.apple.quarantine /Applications/MyNotch.app
   ```

4. Trong MyNotch, mở Settings → **Quyền** → **Cấp lần lượt** để cấp quyền cho các module đang bật.

Chi tiết từng module, phím tắt và xử lý sự cố: xem [Hướng dẫn sử dụng](https://mynotch.truongquocdat.id.vn/huong-dan.html).

## Cấu trúc repo

| Đường dẫn | Nội dung |
| --- | --- |
| `site/` | Trang giới thiệu (`index.html`), trang hướng dẫn (`huong-dan.html`) và video demo (`media/`) |
| Releases | `MyNotch-macOS.zip` và mã SHA-256 cho mỗi phiên bản |
