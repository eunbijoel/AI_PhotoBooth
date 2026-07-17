import html2canvas from "html2canvas";

/**
 * Rasterize a DOM node (e.g. live strip preview) to a PNG data URL via html2canvas.
 * Used as a complementary export path alongside the canvas strip composer.
 */
export async function captureElementPng(
  element: HTMLElement,
  scale = 2,
): Promise<string> {
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale,
    useCORS: true,
    logging: false,
  });
  return canvas.toDataURL("image/png");
}
