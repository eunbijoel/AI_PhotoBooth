import type { CapturedPhoto, FilterId, FrameId, FrameLayoutId } from "@/types";
import { CAPTURE_HEIGHT, CAPTURE_WIDTH } from "@/types";
import { getFilter, getFilterCss, getFrame, getFrameLayout } from "@/lib/constants";
import { formatStripDate } from "@/lib/utils";
import { loadOverlayImage } from "@/lib/overlay-engine";
import {
  calculateObjectCoverCrop,
  renderOverlayToCanvas,
} from "@/lib/overlay-renderer";
import type { OverlayState } from "@/types/overlay";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawDecorations(
  ctx: CanvasRenderingContext2D,
  frameId: FrameId,
  width: number,
  height: number,
) {
  const frame = getFrame(frameId);
  if (frame.decoration === "grain") {
    ctx.fillStyle = "rgba(0,0,0,0.035)";
    for (let i = 0; i < 900; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
    }
  }
  if (frame.decoration === "caption-line") {
    ctx.strokeStyle = frame.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(34, height - 78);
    ctx.lineTo(width - 34, height - 78);
    ctx.stroke();
  }
}

/** Mac Photo Booth–style floating hearts overlay. */
function drawHeartOverlay(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const hearts = [
    { x: 0.12, y: 0.18, s: 0.045 },
    { x: 0.82, y: 0.22, s: 0.055 },
    { x: 0.2, y: 0.72, s: 0.04 },
    { x: 0.78, y: 0.68, s: 0.05 },
    { x: 0.5, y: 0.12, s: 0.035 },
    { x: 0.88, y: 0.48, s: 0.038 },
    { x: 0.1, y: 0.45, s: 0.032 },
  ];

  for (const h of hearts) {
    const size = Math.min(width, height) * h.s;
    drawHeart(ctx, width * h.x, height * h.y, size, "rgba(255, 90, 120, 0.72)");
  }
}

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, size * 0.3);
  ctx.bezierCurveTo(0, 0, -size, 0, -size, size * 0.3);
  ctx.bezierCurveTo(-size, size * 0.65, 0, size, 0, size * 1.25);
  ctx.bezierCurveTo(0, size, size, size * 0.65, size, size * 0.3);
  ctx.bezierCurveTo(size, 0, 0, 0, 0, size * 0.3);
  ctx.fill();
  ctx.restore();
}

export interface StripOptions {
  photos: CapturedPhoto[];
  frameId: FrameId;
  frameLayoutId: FrameLayoutId;
  caption?: string;
  logoText?: string;
}

/**
 * Compose a high-resolution AI photo booth frame.
 * Returns a PNG data URL.
 */
export async function generatePhotoStrip(options: StripOptions): Promise<string> {
  const {
    photos,
    frameId,
    frameLayoutId,
    caption = "",
    logoText = "나만의 AI 포토부스",
  } = options;
  const frame = getFrame(frameId);
  const layout = getFrameLayout(frameLayoutId);

  const canvas = document.createElement("canvas");
  canvas.width = layout.width;
  canvas.height = layout.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  ctx.fillStyle = frame.background;
  ctx.fillRect(0, 0, layout.width, layout.height);
  drawDecorations(ctx, frameId, layout.width, layout.height);

  ctx.fillStyle = frame.logoColor;
  ctx.textAlign = "center";
  if (layout.logoPlacement === "right") {
    // Clean vertical brand only — no side slogans
    ctx.save();
    ctx.translate(layout.width - 56, layout.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '600 28px "Noto Sans KR", sans-serif';
    ctx.fillText(logoText, 0, 0);
    ctx.restore();
  } else if (layout.logoPlacement === "top") {
    ctx.font = '700 34px "Noto Sans KR", sans-serif';
    ctx.fillText(logoText, layout.width / 2, 72);
  } else if (layout.logoPlacement === "bottom") {
    ctx.font = '700 28px "Noto Sans KR", sans-serif';
    ctx.fillText(logoText, layout.width / 2, layout.height - 78);
  } else {
    ctx.font = '600 22px "Noto Sans KR", sans-serif';
    ctx.fillText(logoText, layout.width / 2, layout.height - 52);
  }

  for (const [index, slot] of layout.slots.entries()) {
    const photo = photos[index];
    if (!photo) continue;
    const img = await loadImage(photo.dataUrl);
    warnIfAspectMismatch(img, slot.width, slot.height, frameLayoutId, index);
    // Captures already use the slot ratio. Never crop them a second time.
    ctx.drawImage(img, slot.x, slot.y, slot.width, slot.height);
  }

  ctx.fillStyle = frame.textColor;
  ctx.font = '500 16px "Noto Sans KR", sans-serif';
  ctx.textAlign = "center";
  const footerY = layout.height - 38;
  ctx.fillText(formatStripDate(), layout.width / 2, footerY);
  if (caption.trim()) {
    ctx.font = '600 18px "Noto Sans KR", sans-serif';
    ctx.fillText(caption.trim(), layout.width / 2, footerY - 26);
  }

  return canvas.toDataURL("image/png");
}

function warnIfAspectMismatch(
  img: HTMLImageElement,
  width: number,
  height: number,
  layoutId: FrameLayoutId,
  photoIndex: number,
): void {
  if (process.env.NODE_ENV === "production") return;
  const renderedHeight = width / (img.width / img.height);
  const differenceInSlotPixels = Math.abs(renderedHeight - height);
  if (differenceInSlotPixels <= 1) return;

  console.warn("[photo-strip] Capture/slot aspect mismatch; image was not cropped.", {
    layoutId,
    photoIndex,
    captured: { width: img.width, height: img.height, ratio: img.width / img.height },
    slot: { width, height, ratio: width / height },
    differenceInSlotPixels,
  });
}

/**
 * Capture a mirrored, filtered still from a video element into a resized data URL.
 * Capture dimensions should match the selected frame slot aspect.
 */
export function captureFromVideo(
  video: HTMLVideoElement,
  filter: FilterId,
  mirrored = true,
  captureWidth = CAPTURE_WIDTH,
  captureHeight = CAPTURE_HEIGHT,
  overlay?: OverlayState,
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = captureWidth;
  canvas.height = captureHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  const vw = video.videoWidth || captureWidth;
  const vh = video.videoHeight || captureHeight;
  const crop = calculateObjectCoverCrop(vw, vh, captureWidth, captureHeight);

  ctx.save();
  if (mirrored) {
    ctx.translate(captureWidth, 0);
    ctx.scale(-1, 1);
  }

  const filterCss = getFilterCss(filter);
  if (filterCss !== "none") {
    ctx.filter = filterCss;
  }

  ctx.drawImage(
    video,
    crop.sourceX,
    crop.sourceY,
    crop.sourceWidth,
    crop.sourceHeight,
    0,
    0,
    captureWidth,
    captureHeight,
  );
  ctx.restore();

  if (getFilter(filter).overlay === "hearts") {
    drawHeartOverlay(ctx, captureWidth, captureHeight);
  }

  return compositeAndEncode();

  async function compositeAndEncode(): Promise<string> {
    if (overlay?.visible && overlay.imageSrc) {
      // Never silently save a frame without the overlay the user saw.
      const overlayImage = await loadOverlayImage(overlay.imageSrc);
      renderOverlayToCanvas(ctx!, overlayImage, overlay, captureWidth, captureHeight);
    }

    return canvas.toDataURL("image/jpeg", 0.92);
  }
}

/** Convert a PNG data URL to JPEG. */
export async function pngToJpeg(dataUrl: string, quality = 0.92): Promise<Blob> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("JPEG encode failed"))),
      "image/jpeg",
      quality,
    );
  });
}
