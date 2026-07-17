/** Shared domain types for the AI photo booth. */

export type BoothPhase =
  | "idle"
  | "countdown"
  | "flash"
  | "capturing"
  | "review"
  | "decorating"
  | "complete";

export type FilterId =
  | "normal"
  | "warm"
  | "cool"
  | "vintage"
  | "bw"
  | "film"
  | "soft"
  | "heart";

export type FrameId =
  | "mono-white"
  | "mono-black"
  | "warm-gray"
  | "deep-gray"
  | "soft-paper";

export type FrameLayoutId =
  | "vertical-strip"
  | "studio-grid"
  | "memory-card"
  | "poster-split"
  | "film-archive";

export type CaptureMode = "auto10" | "manual3";

export type ThemeMode = "dark" | "light";

export interface FilterOption {
  id: FilterId;
  label: string;
  /** CSS filter string applied to live preview and captures */
  css: string;
  /** Optional overlay drawn on capture (e.g. Mac Photo Booth hearts) */
  overlay?: "hearts";
}

export interface FrameStyle {
  id: FrameId;
  label: string;
  background: string;
  accent: string;
  textColor: string;
  logoColor: string;
  decoration?: "none" | "grain" | "caption-line";
}

export interface FrameLayout {
  id: FrameLayoutId;
  label: string;
  description: string;
  width: number;
  height: number;
  slots: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  logoPlacement: "top" | "right" | "bottom" | "minimal";
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  capturedAt: number;
  filter: FilterId;
}

export interface SessionRecord {
  id: string;
  createdAt: number;
  stripDataUrl: string;
  photos: string[];
  frame: FrameId;
  frameLayout: FrameLayoutId;
  filter: FilterId;
  caption: string;
  videoDataUrl?: string;
}

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const TOTAL_SHOTS = 8;
export const FINAL_PHOTO_COUNT = 4;
export const MAX_RETAKES = 2;
export const COUNTDOWN_SECONDS = 3;
export const AUTO_COUNTDOWN_SECONDS = 10;
/** Default portrait capture size — overridden by frame slot aspect at runtime. */
export const CAPTURE_WIDTH = 720;
export const CAPTURE_HEIGHT = 960;
