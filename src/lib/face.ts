import type { FaceBox } from "@/types";

type FaceDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
};

/**
 * Detect faces using the Chromium Shape Detection API when available.
 * Returns normalized boxes relative to the video element's display size.
 */
export async function detectFaces(
  video: HTMLVideoElement,
): Promise<FaceBox[]> {
  if (typeof window === "undefined") return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Detector = (window as any).FaceDetector as
    | (new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => FaceDetectorLike)
    | undefined;

  if (!Detector) return [];

  try {
    const detector = new Detector({ fastMode: true, maxDetectedFaces: 3 });
    const faces = await detector.detect(video);
    const vw = video.videoWidth || 1;
    const vh = video.videoHeight || 1;

    return faces.map((f) => ({
      x: (f.boundingBox.x / vw) * 100,
      y: (f.boundingBox.y / vh) * 100,
      width: (f.boundingBox.width / vw) * 100,
      height: (f.boundingBox.height / vh) * 100,
    }));
  } catch {
    return [];
  }
}

export function isFaceDetectorSupported(): boolean {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (window as any).FaceDetector === "function";
}
