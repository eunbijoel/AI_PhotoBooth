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
