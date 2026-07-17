import type { FilterOption, FrameLayout, FrameStyle } from "@/types";

export const FILTERS: FilterOption[] = [
  { id: "normal", label: "Normal", css: "none" },
  { id: "warm", label: "Soft Warm", css: "grayscale(0.15) sepia(0.12) contrast(1.04) brightness(1.03)" },
  { id: "cool", label: "Clean Cool", css: "grayscale(0.2) hue-rotate(190deg) contrast(1.02) brightness(1.04)" },
  { id: "vintage", label: "Studio Matte", css: "grayscale(0.35) sepia(0.08) contrast(0.96) brightness(1.02)" },
  { id: "bw", label: "B&W", css: "grayscale(1) contrast(1.12)" },
  { id: "film", label: "Silver Film", css: "grayscale(0.8) contrast(1.18) brightness(1.02)" },
  { id: "soft", label: "Soft Gray", css: "grayscale(0.4) brightness(1.08) contrast(0.92)" },
  {
    id: "heart",
    label: "Hearts",
    css: "saturate(1.15) brightness(1.05) contrast(1.05)",
    overlay: "hearts",
  },
];

export const FRAMES: FrameStyle[] = [
  {
    id: "mono-white",
    label: "Mono White",
    background: "#f3f3f1",
    accent: "#9a8a78",
    textColor: "#191919",
    logoColor: "#8c755e",
    decoration: "caption-line",
  },
  {
    id: "mono-black",
    label: "Mono Black",
    background: "#030303",
    accent: "#f5f5f5",
    textColor: "#f5f5f5",
    logoColor: "#f5f5f5",
    decoration: "none",
  },
  {
    id: "warm-gray",
    label: "Warm Gray",
    background: "#d8d5cf",
    accent: "#7b7369",
    textColor: "#202020",
    logoColor: "#5d554d",
    decoration: "grain",
  },
  {
    id: "deep-gray",
    label: "Deep Gray",
    background: "#1b1f20",
    accent: "#8f8f89",
    textColor: "#f7f7f4",
    logoColor: "#d8d2c7",
    decoration: "none",
  },
  {
    id: "soft-paper",
    label: "Soft Paper",
    background: "#eeeae2",
    accent: "#b9aa98",
    textColor: "#222222",
    logoColor: "#a88764",
    decoration: "none",
  },
];

export const FRAME_LAYOUTS: FrameLayout[] = [
  {
    id: "vertical-strip",
    label: "Classic Strip",
    description: "길게 떨어지는 기본 4컷",
    width: 600,
    height: 1800,
    logoPlacement: "bottom",
    slots: [
      { x: 54, y: 120, width: 492, height: 360 },
      { x: 54, y: 512, width: 492, height: 360 },
      { x: 54, y: 904, width: 492, height: 360 },
      { x: 54, y: 1296, width: 492, height: 360 },
    ],
  },
  {
    id: "studio-grid",
    label: "Studio Grid",
    description: "깨끗한 2x2 사진관 프레임",
    width: 1200,
    height: 760,
    logoPlacement: "right",
    slots: [
      { x: 36, y: 36, width: 480, height: 300 },
      { x: 534, y: 36, width: 480, height: 300 },
      { x: 36, y: 370, width: 480, height: 300 },
      { x: 534, y: 370, width: 480, height: 300 },
    ],
  },
  {
    id: "memory-card",
    label: "Memory Card",
    description: "여백과 세로 타이포가 있는 카드",
    width: 640,
    height: 960,
    logoPlacement: "minimal",
    slots: [
      { x: 46, y: 88, width: 250, height: 330 },
      { x: 344, y: 88, width: 250, height: 330 },
      { x: 46, y: 452, width: 250, height: 330 },
      { x: 344, y: 452, width: 250, height: 330 },
    ],
  },
  {
    id: "poster-split",
    label: "Poster Split",
    description: "포스터 느낌의 비대칭 배치",
    width: 720,
    height: 1080,
    logoPlacement: "top",
    slots: [
      { x: 70, y: 166, width: 260, height: 355 },
      { x: 390, y: 166, width: 260, height: 355 },
      { x: 70, y: 560, width: 260, height: 355 },
      { x: 390, y: 560, width: 260, height: 355 },
    ],
  },
  {
    id: "film-archive",
    label: "Film Archive",
    description: "흑백 아카이브 보드",
    width: 760,
    height: 1040,
    logoPlacement: "minimal",
    slots: [
      { x: 76, y: 92, width: 280, height: 360 },
      { x: 404, y: 92, width: 280, height: 360 },
      { x: 76, y: 496, width: 280, height: 360 },
      { x: 404, y: 496, width: 280, height: 360 },
    ],
  },
];

export const GALLERY_STORAGE_KEY = "ai-photo-booth-gallery-v2";
export const THEME_STORAGE_KEY = "ai-photo-booth-theme";
export const MUTE_STORAGE_KEY = "ai-photo-booth-muted";

export function getFilterCss(id: string): string {
  return FILTERS.find((f) => f.id === id)?.css ?? "none";
}

export function getFilter(id: string): FilterOption {
  return FILTERS.find((f) => f.id === id) ?? FILTERS[0];
}

export function getFrame(id: string): FrameStyle {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}

export function getFrameLayout(id: string): FrameLayout {
  return FRAME_LAYOUTS.find((f) => f.id === id) ?? FRAME_LAYOUTS[0];
}

/** Capture aspect ratio from the first slot of a layout. */
export function getCaptureAspect(layoutId: string): { width: number; height: number; ratio: number } {
  const layout = getFrameLayout(layoutId);
  const slot = layout.slots[0];
  const ratio = slot.width / slot.height;
  // Keep long edge ~960 for quality
  if (ratio >= 1) {
    const width = 960;
    const height = Math.round(width / ratio);
    return { width, height, ratio };
  }
  const height = 960;
  const width = Math.round(height * ratio);
  return { width, height, ratio };
}
