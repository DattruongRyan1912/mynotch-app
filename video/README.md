# Video giới thiệu MyNotch

Video được dựng bằng [Remotion](https://www.remotion.dev/) (React), không quay màn hình. Notch, các trang và cửa sổ đều vẽ lại bằng code theo giao diện của app, nên khi app đổi chỉ cần sửa code rồi render lại.

- **Tour**: video "Toàn bộ MyNotch", khoảng 4 phút 20 giây, 1920×1080, 30 khung hình/giây, 20 chương.
- **Clip-&lt;module&gt;**: 16 clip ngắn, mỗi module một clip, dùng cùng cảnh với tour. Bản cho web render ở 1280×720.

## Chạy trên máy

```bash
cd video
npm ci
npm run studio
```

Studio mở composition trên trình duyệt để xem từng khung. Để render một ảnh khung hình:

```bash
./node_modules/.bin/remotion still src/index.ts Clip-timer out/timer.jpg --frame=120
```

Render đầy đủ nặng máy, nên giao cho GitHub Actions (workflow **Video** ở `.github/workflows/video.yml`). Workflow chạy khi bấm tay trong tab Actions, hoặc tự chạy khi đăng một release; khi đó video được đính vào release.

## Nhạc nền

Nhạc là tuỳ chọn. Có hai cách đưa nhạc vào:
- **Trên máy:** đặt file vào `public/music.mp3`, rồi thêm `--props='{"music":"music.mp3"}'` khi render.
- **Trên GitHub Actions:** đặt secret `MUSIC_URL` là link tải thẳng file nhạc. File chỉ được tải lúc render.

Không commit file nhạc vào repo công khai. Phần lớn giấy phép nhạc miễn phí bản quyền không cho phân phối lại file gốc. `.gitignore` đã loại `public/music.*`.

## Sửa một cảnh

Mỗi chương là một file trong `src/scenes/`. Quy tắc viết cảnh nằm ở `AUTHORING.md`; cảnh mẫu là `src/scenes/Timer.tsx`. Thứ tự và độ dài các chương nằm ở `src/scenes/index.ts`.

## Giấy phép

Remotion miễn phí cho cá nhân và công ty tối đa 3 người; xem [remotion.dev/license](https://www.remotion.dev/license). Font Be Vietnam Pro, Bricolage Grotesque và JetBrains Mono lấy từ Google Fonts (giấy phép OFL). Icon và hình nền vẽ riêng cho video này.
