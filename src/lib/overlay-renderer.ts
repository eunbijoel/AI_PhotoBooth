import type { OverlayState } from "@/types/overlay";

export interface OverlayTransform {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  rotationRadians: number;
  opacity: number;
}

export interface ObjectCoverCrop {
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
}

export const OVERLAY_DEBUG_ENABLED =
  process.env.NEXT_PUBLIC_OVERLAY_DEBUG === "true";

/**
 * Resolve the canonical normalized overlay state into viewport pixels.
 * Every non-DOM renderer must use this function.
 */
export function resolveOverlayTransform(
  overlay: OverlayState,
  viewportWidth: number,
  viewportHeight: number,
  imageWidth: number,
  imageHeight: number,
): OverlayTransform {
  const imageRatio =
    imageWidth > 0 && imageHeight > 0 ? imageHeight / imageWidth : 1;
  const width = viewportWidth * overlay.scale;

  return {
    centerX: viewportWidth * overlay.x,
    centerY: viewportHeight * overlay.y,
    width,
    height: width * imageRatio,
    rotationRadians: (overlay.rotation * Math.PI) / 180,
    opacity: overlay.opacity,
  };
}

/** Draw one overlay using only canonical state and decoded image dimensions. */
export function renderOverlayToCanvas(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  overlay: OverlayState,
  viewportWidth: number,
  viewportHeight: number,
  debug = OVERLAY_DEBUG_ENABLED,
): void {
  if (!overlay.visible || !overlay.imageSrc || overlay.opacity <= 0) return;

  const transform = resolveOverlayTransform(
    overlay,
    viewportWidth,
    viewportHeight,
    image.naturalWidth,
    image.naturalHeight,
  );

  ctx.save();
  ctx.globalAlpha = transform.opacity;
  ctx.translate(transform.centerX, transform.centerY);
  ctx.rotate(transform.rotationRadians);
  ctx.drawImage(
    image,
    -transform.width / 2,
    -transform.height / 2,
    transform.width,
    transform.height,
  );
  ctx.restore();

  if (debug) {
    drawCanvasDebug(ctx, overlay, transform);
    console.debug("[overlay:canvas]", {
      normalizedState: overlay,
      canvasTransform: transform,
      viewport: { width: viewportWidth, height: viewportHeight },
    });
  }
}

/**
 * Exact center-crop used by CSS `object-fit: cover; object-position: center`.
 * Capture uses this rather than maintaining a second crop implementation.
 */
export function calculateObjectCoverCrop(
  sourceWidth: number,
  sourceHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): ObjectCoverCrop {
  const sourceRatio = sourceWidth / sourceHeight;
  const viewportRatio = viewportWidth / viewportHeight;

  if (sourceRatio > viewportRatio) {
    const sourceCropWidth = sourceHeight * viewportRatio;
    return {
      sourceX: (sourceWidth - sourceCropWidth) / 2,
      sourceY: 0,
      sourceWidth: sourceCropWidth,
      sourceHeight,
    };
  }

  const sourceCropHeight = sourceWidth / viewportRatio;
  return {
    sourceX: 0,
    sourceY: (sourceHeight - sourceCropHeight) / 2,
    sourceWidth,
    sourceHeight: sourceCropHeight,
  };
}

function drawCanvasDebug(
  ctx: CanvasRenderingContext2D,
  overlay: OverlayState,
  transform: OverlayTransform,
): void {
  ctx.save();
  ctx.translate(transform.centerX, transform.centerY);
  ctx.rotate(transform.rotationRadians);
  ctx.strokeStyle = "#00ff88";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    -transform.width / 2,
    -transform.height / 2,
    transform.width,
    transform.height,
  );
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#ff2d55";
  ctx.beginPath();
  ctx.arc(transform.centerX, transform.centerY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "12px monospace";
  ctx.fillStyle = "#00ff88";
  ctx.fillText(
    `n=(${overlay.x.toFixed(3)}, ${overlay.y.toFixed(3)}) px=(${transform.centerX.toFixed(1)}, ${transform.centerY.toFixed(1)})`,
    Math.min(transform.centerX + 8, ctx.canvas.width - 330),
    Math.max(transform.centerY - 8, 14),
  );
  ctx.restore();
}
