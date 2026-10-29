import { Config } from "@remotion/cli/config";

// H.264 at the quality OneNotch's web videos use; flat UI compresses well.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setCrf(24);
Config.setPixelFormat("yuv420p");
