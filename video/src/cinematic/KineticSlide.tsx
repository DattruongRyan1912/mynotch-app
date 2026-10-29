import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT } from "../lib/theme";
import { fade, kf, pop } from "../lib/time";

export type KineticLine = {
  text: string;
  highlight?: string;
  sub?: string;
  delay?: number;
};

export type KineticSlideProps = {
  lines: KineticLine[];
  variant?: "dark" | "light";
  durationInFrames: number;
  enterDelay?: number;
  badge?: string;
};

export const KineticSlide: React.FC<KineticSlideProps> = ({
  lines,
  variant = "dark",
  durationInFrames,
  enterDelay = 0,
  badge,
}) => {
  const f = useCurrentFrame();

  const isLight = variant === "light";
  const bg = isLight ? "#fafafa" : "#050507";
  const textColor = isLight ? "#09090b" : "#f4f4f5";
  const subColor = isLight ? "#71717a" : "#a1a1aa";
  const badgeBg = isLight ? "#f4f4f5" : "#18181b";
  const badgeBorder = isLight ? "#e4e4e7" : "#27272a";
  const badgeText = isLight ? "#52525b" : "#d4d4d8";

  // Slide overall in/out transition
  const slideOpacity = fade(f, enterDelay, durationInFrames, 12, 12);
  const slideY = kf(
    f,
    [
      [enterDelay, 20],
      [enterDelay + 14, 0],
      [durationInFrames - 12, 0],
      [durationInFrames, -16],
    ]
  );

  return (
    <AbsoluteFill
      style={{
        background: bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
        fontFamily: FONT.display,
        opacity: slideOpacity,
        transform: `translateY(${slideY}px)`,
        pointerEvents: "none",
      }}
    >
      {badge && (
        <div
          style={{
            marginBottom: 28,
            padding: "8px 20px",
            borderRadius: 999,
            background: badgeBg,
            border: `1px solid ${badgeBorder}`,
            fontFamily: FONT.ui,
            fontSize: 20,
            fontWeight: 600,
            color: badgeText,
            letterSpacing: "0.02em",
            opacity: fade(f, enterDelay + 4, durationInFrames, 10, 10),
            transform: `scale(${0.9 + 0.1 * pop(f, enterDelay + 4)})`,
          }}
        >
          {badge}
        </div>
      )}

      {lines.map((item, idx) => {
        const itemDelay = enterDelay + (item.delay ?? idx * 10);
        const itemPop = pop(f, itemDelay);
        const itemOpacity = fade(f, itemDelay, durationInFrames, 10, 10);

        // Split text around highlight if provided
        let beforeText = item.text;
        let highlightText = "";
        let afterText = "";

        if (item.highlight && item.text.includes(item.highlight)) {
          const parts = item.text.split(item.highlight);
          beforeText = parts[0];
          highlightText = item.highlight;
          afterText = parts.slice(1).join(item.highlight);
        }

        return (
          <div
            key={idx}
            style={{
              textAlign: "center",
              marginTop: idx === 0 ? 0 : 20,
              opacity: itemOpacity,
              transform: `translateY(${(1 - itemPop) * 32}px)`,
            }}
          >
            <div
              style={{
                fontSize: 84,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                color: textColor,
              }}
            >
              {beforeText}
              {highlightText && (
                <span
                  style={{
                    background: "linear-gradient(135deg, #ff7a45 0%, #ff2d70 65%, #c026d3 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    display: "inline-block",
                    padding: "0 6px",
                  }}
                >
                  {highlightText}
                </span>
              )}
              {afterText}
            </div>

            {item.sub && (
              <div
                style={{
                  fontFamily: FONT.ui,
                  fontSize: 32,
                  fontWeight: 500,
                  color: subColor,
                  marginTop: 18,
                  opacity: fade(f, itemDelay + 8, durationInFrames, 10, 10),
                }}
              >
                {item.sub}
              </div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
