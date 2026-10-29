import type React from "react";

/** A scene plays the same alone (a module clip) and as a slice of the tour; it never reads anything but its own frame. */
export type SceneProps = { title?: boolean };

export type SceneDef = {
  id: string;
  /** Chapter name on screen and in the caption label. */
  label: string;
  /** Length in frames at 30 fps. */
  dur: number;
  Comp: React.FC<SceneProps>;
};
