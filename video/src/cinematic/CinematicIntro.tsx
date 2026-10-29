import React from "react";
import { AbsoluteFill, Audio, Series, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, NOTCH, SCREEN, VIDEO } from "../lib/theme";
import { fade, kf, pop, springSteps } from "../lib/time";
import { Desktop, ON_NOTCH } from "../ui/Desktop";
import { Notch, Page, TabBar } from "../ui/Notch";
import { Cursor, Move } from "../ui/Cursor";
import { Btn, Window } from "../ui/Kit";
import { Icon } from "../ui/Icons";
import { Laptop } from "../scenes/Laptop";
import { KineticSlide } from "./KineticSlide";

export type CinematicIntroProps = {
  music: string | null;
};

// ============================================================================
// Scene 1: Mở đầu (240 frames / 8s)
// ============================================================================
const SceneIntro: React.FC = () => {
  const f = useCurrentFrame();
  const live = springSteps(f, [[0, 0], [40, 1]]);
  const push = kf(f, [[180, 0], [240, 1]]);
  const fullW = VIDEO.w / (1 - 2 * 0.012);
  const width = kf(f, [[0, 1080], [180, 1160], [240, fullW]]);
  const y = kf(f, [[0, 290], [180, 270], [240, -fullW * 0.012]]);
  const titleOpacity = fade(f, 30, 200, 12, 14);

  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Laptop width={width} x={VIDEO.w / 2} y={y} opacity={kf(f, [[0, 0], [16, 1]])}>
        <Notch
          live={live}
          leading={<span style={{ width: 14, height: 14, borderRadius: 4, background: C.accent }} />}
          trailing={<span style={{ fontFamily: FONT.mono, fontSize: 11, color: C.text2 }}>09:41</span>}
        />
      </Laptop>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 90,
          textAlign: "center",
          opacity: titleOpacity * (1 - push),
          transform: `translateY(${(1 - pop(f, 30)) * 24}px)`,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: FONT.display,
            fontWeight: 800,
            fontSize: 110,
            letterSpacing: "-0.03em",
            color: "#fafafa",
            lineHeight: 1,
          }}
        >
          MyNotch
        </div>
        <div
          style={{
            fontFamily: FONT.ui,
            fontSize: 32,
            color: "#a1a1aa",
            marginTop: 16,
            fontWeight: 500,
            opacity: fade(f, 50, 200, 12, 14),
          }}
        >
          Notch không còn là khoảng trống.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// Scene 2: Clipboard (480 frames / 16s)
// ============================================================================
const SceneClipboard: React.FC = () => {
  const f = useCurrentFrame();
  const slideDur = 110;
  const isSlide = f < slideDur;

  if (isSlide) {
    return (
      <KineticSlide
        variant="dark"
        durationInFrames={slideDur}
        badge="CLIPBOARD QUẢN LÝ"
        lines={[
          { text: "Kéo. Chọn. Dán.", highlight: "Dán." },
          { text: "Bộ nhớ tạm tiện lợi.", sub: "Lịch sử sao chép · Tìm kiếm siêu tốc · Board khoá" },
        ]}
      />
    );
  }

  const demoF = f - slideDur; // 0 to 370
  const notchOpen = springSteps(demoF, [[0, 0], [20, 1], [340, 1], [365, 0]]);
  const cursorMoves: Move[] = [
    { f: 0, x: 860, y: 350 },
    { f: 70, x: 740, y: 120, d: 25 },
    { f: 160, x: 620, y: 130, d: 25 },
    { f: 270, x: 880, y: 130, d: 25 },
  ];
  const clicks = [70, 160, 270];

  const cards = [
    { title: "Kế hoạch tuần 44: Launch MyNotch v2.0", tag: "Ghi chú", time: "2 phút trước", icon: "clipboard" as const },
    { title: "https://github.com/DattruongRyan1912/MyNotch", tag: "Liên kết", time: "5 phút trước", icon: "grid" as const },
    { title: "#7D5CFF · Màu thương hiệu Accent", tag: "Màu sắc", time: "12 phút trước", icon: "grid" as const },
  ];

  return (
    <Desktop camera={ON_NOTCH}>
      <Notch open={notchOpen} contentH={235}>
        <TabBar active={0} />
        <Page>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {cards.map((c, i) => {
              const active = demoF >= 60 + i * 90 && demoF < 150 + i * 90;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: active ? "rgba(125,92,255,0.22)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${active ? "rgba(125,92,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                    fontFamily: FONT.ui,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: active ? C.accent : "rgba(255,255,255,0.12)", display: "grid", placeItems: "center" }}>
                      <Icon name={c.icon} size={12} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: C.text3 }}>{c.time}</div>
                    </div>
                  </div>
                  <Btn active={active} style={{ fontSize: 11, height: 20 }}>Dán</Btn>
                </div>
              );
            })}
          </div>
        </Page>
      </Notch>
      <Cursor frame={demoF} moves={cursorMoves} clicks={clicks} />
    </Desktop>
  );
};

// ============================================================================
// Scene 3: Media & Web Subtitles (480 frames / 16s)
// ============================================================================
const SceneMedia: React.FC = () => {
  const f = useCurrentFrame();
  const slideDur = 110;

  if (f < slideDur) {
    return (
      <KineticSlide
        variant="light"
        durationInFrames={slideDur}
        badge="ÂM NHẠC & PHỤ ĐỀ"
        lines={[
          { text: "Mọi lời hát, mọi phụ đề.", highlight: "mọi phụ đề." },
          { text: "Bắt trọn lời ca từ YouTube, Chrome và Spotify trực tiếp trên Notch." },
        ]}
      />
    );
  }

  const demoF = f - slideDur; // 0 to 370
  const notchOpen = springSteps(demoF, [[0, 0], [20, 1], [340, 1], [365, 0]]);
  const lyrics = [
    "Đèn phố lên mờ sau làn mưa mỏng",
    "Giai điệu quen thuộc nhẹ trôi theo gió",
    "MyNotch tự động bắt từng lời ca",
  ];
  const lyricIdx = Math.min(lyrics.length - 1, Math.floor(demoF / 110));

  return (
    <Desktop camera={ON_NOTCH}>
      <Notch open={notchOpen} contentH={190}>
        <TabBar active={1} />
        <Page>
          <div style={{ padding: "10px 14px", fontFamily: FONT.ui }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #1db954, #191414)", display: "grid", placeItems: "center" }}>
                  <Icon name="music" size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Em Đồng Ý (I Do)</div>
                  <div style={{ fontSize: 12, color: C.text2 }}>Đức Phúc x 911 · YouTube Web</div>
                </div>
              </div>
              <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: "rgba(48,209,88,0.2)", color: C.green, fontWeight: 600 }}>Đang phát</span>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "12px 14px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, letterSpacing: "0.04em", marginBottom: 4 }}>
                LIVE LYRICS HUD
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>
                "{lyrics[lyricIdx]}"
              </div>
            </div>
          </div>
        </Page>
      </Notch>
    </Desktop>
  );
};

// ============================================================================
// Scene 4: Smart Translation (420 frames / 14s)
// ============================================================================
const SceneTranslation: React.FC = () => {
  const f = useCurrentFrame();
  const slideDur = 110;

  if (f < slideDur) {
    return (
      <KineticSlide
        variant="dark"
        durationInFrames={slideDur}
        badge="DỊCH THUẬT THÔNG MINH"
        lines={[
          { text: "Chọn. Dịch. Xong.", highlight: "Dịch." },
          { text: "Dịch nhanh tài liệu và email tức thì ngay trên vùng notch." },
        ]}
      />
    );
  }

  const demoF = f - slideDur; // 0 to 310
  const notchOpen = springSteps(demoF, [[0, 0], [30, 1], [280, 1], [305, 0]]);

  return (
    <Desktop camera={ON_NOTCH}>
      <Window x={SCREEN.w / 2 - 280} y={150} w={560} h={180} title="Email từ đối tác quốc tế" show={1}>
        <div style={{ padding: 16, fontFamily: FONT.ui }}>
          <div style={{ fontSize: 12, color: C.text3, marginBottom: 6 }}>Từ: Alex Morgan &lt;alex@studio.design&gt;</div>
          <div style={{ fontSize: 14, color: C.text, lineHeight: 1.5, background: "rgba(125,92,255,0.18)", padding: "4px 8px", borderRadius: 4 }}>
            "We confirmed the release schedule. All UI assets are verified and ready for deployment."
          </div>
        </div>
      </Window>

      <Notch open={notchOpen} contentH={180}>
        <TabBar active={2} />
        <Page>
          <div style={{ padding: "8px 12px", fontFamily: FONT.ui }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.text2, marginBottom: 8 }}>
              <span>Tiếng Anh</span>
              <Icon name="arrow" size={10} />
              <span style={{ color: C.accent, fontWeight: 600 }}>Tiếng Việt</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.4, marginBottom: 12 }}>
              "Chúng tôi đã xác nhận lịch phát hành. Toàn bộ tài nguyên UI đã được kiểm chứng và sẵn sàng triển khai."
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn icon="clipboard" active style={{ height: 24, fontSize: 11 }}>Sao chép</Btn>
              <Btn style={{ height: 24, fontSize: 11 }}>Thay thế văn bản</Btn>
            </div>
          </div>
        </Page>
      </Notch>
    </Desktop>
  );
};

// ============================================================================
// Scene 5: Timer & Pomodoro (420 frames / 14s)
// ============================================================================
const SceneTimer: React.FC = () => {
  const f = useCurrentFrame();
  const slideDur = 110;

  if (f < slideDur) {
    return (
      <KineticSlide
        variant="light"
        durationInFrames={slideDur}
        badge="HẸN GIỜ & POMODORO"
        lines={[
          { text: "Tập trung. Nghỉ đúng lúc.", highlight: "Tập trung." },
          { text: "Phiên làm việc sâu 25 phút với Live Activity tinh gọn trên mép notch." },
        ]}
      />
    );
  }

  const demoF = f - slideDur; // 0 to 310
  const notchOpen = springSteps(demoF, [[0, 0], [20, 1], [180, 1], [210, 0]]);
  const live = springSteps(demoF, [[210, 0], [230, 1]]);

  return (
    <Desktop camera={ON_NOTCH}>
      <Notch
        open={notchOpen}
        live={live}
        contentH={170}
        leading={<span style={{ width: 8, height: 8, borderRadius: 4, background: C.orange }} />}
        trailing={<span style={{ fontFamily: FONT.mono, fontSize: 11, color: C.orange, fontWeight: 700 }}>24:58</span>}
      >
        <TabBar active={6} badge="timer" />
        <Page>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", fontFamily: FONT.ui }}>
            <div style={{ fontSize: 12, color: C.text3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Phiên Pomodoro</div>
            <div style={{ fontFamily: FONT.display, fontSize: 38, fontWeight: 800, color: C.text, margin: "4px 0" }}>25:00</div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <Btn icon="timer" active style={{ background: C.orange, height: 24 }}>Bắt đầu đếm</Btn>
              <Btn style={{ height: 24 }}>+5 phút</Btn>
            </div>
          </div>
        </Page>
      </Notch>
    </Desktop>
  );
};

// ============================================================================
// Scene 6: File Shelf & Quick Hold (420 frames / 14s)
// ============================================================================
const SceneShelf: React.FC = () => {
  const f = useCurrentFrame();
  const slideDur = 110;

  if (f < slideDur) {
    return (
      <KineticSlide
        variant="dark"
        durationInFrames={slideDur}
        badge="KHAY TẠM THỜI"
        lines={[
          { text: "Kéo. Thả. Giữ file tạm.", highlight: "Giữ file tạm." },
          { text: "Giữ file tạm thời trên mép notch để thả vào email hoặc tài liệu." },
        ]}
      />
    );
  }

  const demoF = f - slideDur; // 0 to 310
  const notchOpen = springSteps(demoF, [[0, 0], [30, 1], [280, 1], [305, 0]]);

  return (
    <Desktop camera={ON_NOTCH}>
      <Notch open={notchOpen} contentH={180}>
        <TabBar active={6} badge="tray" />
        <Page>
          <div style={{ padding: "8px 12px", fontFamily: FONT.ui }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Khay file tạm thời</span>
              <span style={{ fontSize: 11, color: C.cyan, fontWeight: 600 }}>Chia sẻ qua AirDrop</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(100,210,255,0.2)", color: C.cyan, display: "grid", placeItems: "center" }}>
                  <Icon name="doc" size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Bao-cao-quy-4.pdf</div>
                  <div style={{ fontSize: 11, color: C.text3 }}>Tài liệu 2.4 MB · Sẵn sàng kéo thả</div>
                </div>
              </div>
              <Btn active style={{ background: C.cyan, color: "#000", fontWeight: 700, height: 22, fontSize: 11 }}>Thả vào app</Btn>
            </div>
          </div>
        </Page>
      </Notch>
    </Desktop>
  );
};

// ============================================================================
// Scene 7: Notch Pet & Multi-Display HUD (480 frames / 16s)
// ============================================================================
const ScenePet: React.FC = () => {
  const f = useCurrentFrame();
  const slideDur = 110;

  if (f < slideDur) {
    return (
      <KineticSlide
        variant="light"
        durationInFrames={slideDur}
        badge="THÚ CƯNG & DYNAMIC HUD"
        lines={[
          { text: "Notch sống dậy.", highlight: "sống dậy." },
          { text: "Chú mèo nhỏ đồng hành cùng bạn trên mọi màn hình Mac." },
        ]}
      />
    );
  }

  const demoF = f - slideDur; // 0 to 370
  // Cat walking animation along notch bottom edge
  const catX = kf(demoF, [
    [0, -50],
    [150, 0],
    [300, 60],
    [370, 90],
  ]);

  return (
    <Desktop camera={ON_NOTCH}>
      <Notch open={0} live={0} />

      {/* Cat walking outside Notch, along the bottom edge with zIndex > 20 */}
      <div
        style={{
          position: "absolute",
          left: SCREEN.w / 2 + catX,
          top: NOTCH.h - 18,
          zIndex: 50,
          pointerEvents: "none",
        }}
      >
        <svg width="42" height="26" viewBox="0 0 32 24" fill="none">
          {/* Tail with sway */}
          <path
            d={`M4,14 C1,10 0,${18 + Math.sin(demoF * 0.15) * 2} 3,${20 + Math.sin(demoF * 0.15) * 2}`}
            stroke="#e07a38"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Legs */}
          <rect x="9" y={15 + Math.sin(demoF * 0.25) * 2} width="3" height="5" rx="1.5" fill="#c46222" />
          <rect x="19" y={15 - Math.sin(demoF * 0.25) * 2} width="3" height="5" rx="1.5" fill="#c46222" />
          {/* Body */}
          <ellipse cx="15" cy="13" rx="10" ry="6.5" fill="#e07a38" />
          {/* Stripes */}
          <path d="M12,8 v3 M15,7.5 v3.5 M18,8 v3" stroke="#c46222" strokeWidth="1" strokeLinecap="round" />
          {/* Head */}
          <circle cx="23" cy="9.5" r="5.5" fill="#e07a38" />
          {/* Ears */}
          <polygon points="19,5 21,1 23,5" fill="#e07a38" />
          <polygon points="23,5 25,1 26,5" fill="#e07a38" />
          <polygon points="20,4.5 21,2 22,4.5" fill="#fca5a5" />
          <polygon points="23.5,4.5 24.5,2 25.5,4.5" fill="#fca5a5" />
          {/* Eyes & Nose */}
          <circle cx="25" cy="9" r="0.9" fill="#09090b" />
          <circle cx="27" cy="10.5" r="0.7" fill="#f43f5e" />
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 180,
          textAlign: "center",
          fontFamily: FONT.ui,
          opacity: fade(demoF, 40, 330, 16, 16),
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "8px 18px",
            borderRadius: 999,
            background: "rgba(9,9,11,0.85)",
            border: "1px solid #27272a",
            color: C.text,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Màn hình không có notch: MyNotch hiện dạng viên thuốc
        </span>
      </div>
    </Desktop>
  );
};

// ============================================================================
// Scene 8: Outro & Call to Action (360 frames / 12s)
// ============================================================================
const SceneOutro: React.FC = () => {
  const f = useCurrentFrame();
  const enter = pop(f, 20);
  const fadeOut = fade(f, 0, 360, 10, 20);

  return (
    <AbsoluteFill
      style={{
        background: C.ink,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT.ui,
        opacity: fadeOut,
        transform: `scale(${0.96 + 0.04 * enter})`,
      }}
    >
      {/* Linear Anti-AI-slop mechanical app icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 16,
          background: C.panel,
          border: "1px solid #27272a",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
          marginBottom: 24,
        }}
      >
        <div style={{ width: 44, height: 26, borderRadius: 13, background: "#050507", border: "1.5px solid rgba(255,255,255,0.45)" }} />
      </div>

      <div style={{ fontFamily: FONT.display, fontSize: 88, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
        MyNotch
      </div>

      <div style={{ fontSize: 24, color: "#a1a1aa", marginTop: 12, fontWeight: 500 }}>
        Dành riêng cho máy Mac · macOS 26 trở lên
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 36,
          opacity: fade(f, 60, 340, 12, 12),
        }}
      >
        <span
          style={{
            padding: "12px 28px",
            borderRadius: 6,
            background: "#fff",
            color: "#050507",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          mynotch.truongquocdat.id.vn
        </span>
        <span
          style={{
            padding: "12px 24px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Tải trên GitHub Releases
        </span>
      </div>

      <div style={{ marginTop: 28, fontSize: 14, color: "#52525b" }}>
        Phát triển bởi Indie Developer · Mặc định không gửi dữ liệu ra ngoài
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// Main Composition Component: CinematicIntro (Total: 3300 frames / 110s)
// ============================================================================
const BackgroundAudio: React.FC<{ src: string | null }> = ({ src }) => {
  const { durationInFrames } = useVideoConfig();
  if (!src) return null;
  return (
    <Audio
      src={staticFile(src)}
      loop
      loopVolumeCurveBehavior="extend"
      volume={(f) => 0.55 * Math.min(1, f / 30, (durationInFrames - f) / 60)}
    />
  );
};

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ music }) => {
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Series>
        {/* 1. Mở đầu (0–240f = 8s) */}
        <Series.Sequence durationInFrames={240} name="Mở đầu">
          <SceneIntro />
        </Series.Sequence>

        {/* 2. Clipboard (240–720f = 16s) */}
        <Series.Sequence durationInFrames={480} name="Clipboard">
          <SceneClipboard />
        </Series.Sequence>

        {/* 3. Media & Lời bài hát (720–1200f = 16s) */}
        <Series.Sequence durationInFrames={480} name="Media & Lời bài hát">
          <SceneMedia />
        </Series.Sequence>

        {/* 4. Dịch thuật (1200–1620f = 14s) */}
        <Series.Sequence durationInFrames={420} name="Dịch thuật thông minh">
          <SceneTranslation />
        </Series.Sequence>

        {/* 5. Hẹn giờ Pomodoro (1620–2040f = 14s) */}
        <Series.Sequence durationInFrames={420} name="Hẹn giờ Pomodoro">
          <SceneTimer />
        </Series.Sequence>

        {/* 6. Khay file tạm (2040–2460f = 14s) */}
        <Series.Sequence durationInFrames={420} name="Khay file tạm thời">
          <SceneShelf />
        </Series.Sequence>

        {/* 7. Thú cưng trên Notch (2460–2940f = 16s) */}
        <Series.Sequence durationInFrames={480} name="Thú cưng & Multi-Display">
          <ScenePet />
        </Series.Sequence>

        {/* 8. Kết thúc & CTA (2940–3300f = 12s) */}
        <Series.Sequence durationInFrames={360} name="Kết thúc">
          <SceneOutro />
        </Series.Sequence>
      </Series>

      <BackgroundAudio src={music} />
    </AbsoluteFill>
  );
};
