// Renders every module clip (Clip-*) at 1280×720 for the website, one after another.
// Usage: node scripts/render-clips.mjs [extra remotion flags, e.g. --props='{"music":"music.mp3"}']
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const bin = "./node_modules/.bin/remotion";
const extra = process.argv.slice(2);
const ids = execFileSync(bin, ["compositions", "src/index.ts", "--quiet"], { encoding: "utf8" })
  .split(/\s+/)
  .filter((id) => id.startsWith("Clip-"));

mkdirSync("out/clips", { recursive: true });
for (const id of ids) {
  const name = id.slice("Clip-".length);
  console.log(`Rendering ${name}`);
  execFileSync(bin, ["render", "src/index.ts", id, `out/clips/${name}.mp4`, "--scale=0.6666666666666666", "--crf=26", ...extra], { stdio: "inherit" });
}
