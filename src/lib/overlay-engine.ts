import type { OverlayPreviewSnapshot, OverlayState } from "@/types/overlay";

const imageCache = new Map<string, Promise<HTMLImageElement>>();

/** Load an overlay once and reuse the decoded image for preview and capture. */
export function loadOverlayImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;

  const pending = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => {
      imageCache.delete(src);
      reject(new Error("Overlay PNG could not be loaded."));
    };
    image.src = src;
  });

  imageCache.set(src, pending);
  return pending;
}

/** Prime the shared cache without forcing consumers to await it. */
export function preloadOverlayImage(src: string): void {
  void loadOverlayImage(src).catch(() => undefined);
}

/**
 * Read the actual laid-out overlay geometry instead of re-deriving it from
 * settings. This makes capture match the CSS preview at every responsive size.
 */
export function measureOverlayPreview(
  fallback: OverlayState,
): OverlayPreviewSnapshot | null {
  if (typeof document === "undefined") return null;

  const frame = document.querySelector<HTMLElement>("[data-overlay-frame]");
  if (!frame || frame.clientWidth <= 0 || frame.clientHeight <= 0) return null;

  const image = frame.querySelector<HTMLImageElement>("[data-overlay-image]");
  const frameAspectRatio = frame.clientWidth / frame.clientHeight;

  if (!image || !fallback.imageSrc || !fallback.visible) {
    return {
      overlay: fallback,
      frameAspectRatio,
    };
  }

  // offsetLeft/Top are the pre-transform center anchor set by CSS left/top.
  // offsetWidth is the exact rendered width before rotation.
  return {
    frameAspectRatio,
    overlay: {
      ...fallback,
      x: image.offsetLeft / frame.clientWidth,
      y: image.offsetTop / frame.clientHeight,
      scale: image.offsetWidth / frame.clientWidth,
      opacity: Number.parseFloat(getComputedStyle(image).opacity) || fallback.opacity,
    },
  };
}

/**
 * Draw the overlay using the same normalized coordinate system as the live
 * preview. The video is mirrored separately; the overlay itself is not.
 */
export function drawOverlayToCanvas(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  overlay: OverlayState,
  canvasWidth: number,
  canvasHeight: number,
): void {
  if (!overlay.visible || !overlay.imageSrc || overlay.opacity <= 0) return;

  const width = canvasWidth * overlay.scale;
  const naturalRatio =
    image.naturalWidth > 0 && image.naturalHeight > 0
      ? image.naturalHeight / image.naturalWidth
      : 1;
  const height = width * naturalRatio;
  const centerX = overlay.x * canvasWidth;
  const centerY = overlay.y * canvasHeight;

  ctx.save();
  ctx.globalAlpha = overlay.opacity;
  ctx.translate(centerX, centerY);
  ctx.rotate((overlay.rotation * Math.PI) / 180);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}
