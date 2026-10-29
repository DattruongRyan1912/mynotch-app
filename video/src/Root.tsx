import React from "react";
import { AbsoluteFill, Audio, Composition, Series, staticFile, useVideoConfig } from "remotion";
import { CLIP_IDS, SCENES } from "./scenes";
import { FPS, VIDEO } from "./lib/theme";
import { CinematicIntro, CinematicIntroProps } from "./cinematic";

type TourProps = { music: string | null };

/** Background music is optional: pass --props='{"music":"music.mp3"}' with the file in public/. It loops and fades out at the end. */
const Music: React.FC<{ src: string | null }> = ({ src }) => {
  const { durationInFrames } = useVideoConfig();
  if (!src) return null;
  return (
    <Audio
      src={staticFile(src)}
      loop
      // The volume curve runs over the whole video, not each pass of a track shorter than it.
      loopVolumeCurveBehavior="extend"
      volume={(f) => 0.55 * Math.min(1, f / 30, (durationInFrames - f) / 60)}
    />
  );
};

const Tour: React.FC<TourProps> = ({ music }) => (
  <AbsoluteFill style={{ background: "#050507" }}>
    <Series>
      {SCENES.map((s) => (
        <Series.Sequence key={s.id} durationInFrames={s.dur} name={s.label}>
          <s.Comp title />
        </Series.Sequence>
      ))}
    </Series>
    <Music src={music} />
  </AbsoluteFill>
);

const total = SCENES.reduce((n, s) => n + s.dur, 0);

export const Root: React.FC = () => (
  <>
    <Composition id="Tour" component={Tour} durationInFrames={total} fps={FPS} width={VIDEO.w} height={VIDEO.h} defaultProps={{ music: null } as TourProps} />
    <Composition id="CinematicIntro" component={CinematicIntro} durationInFrames={3300} fps={FPS} width={VIDEO.w} height={VIDEO.h} defaultProps={{ music: null } as CinematicIntroProps} />
    {CLIP_IDS.map((id) => {
      const s = SCENES.find((x) => x.id === id)!;
      const Clip: React.FC<TourProps> = ({ music }) => (
        <AbsoluteFill style={{ background: "#050507" }}>
          <s.Comp title />
          <Music src={music} />
        </AbsoluteFill>
      );
      return (
        <Composition key={id} id={`Clip-${id}`} component={Clip} durationInFrames={s.dur} fps={FPS} width={VIDEO.w} height={VIDEO.h} defaultProps={{ music: null } as TourProps} />
      );
    })}
  </>
);
