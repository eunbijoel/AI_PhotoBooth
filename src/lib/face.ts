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

/**
 * Heuristic "smile" score from face box aspect + brightness of mouth region.
 * Not ML-accurate — used as a gentle auto-capture assist when FaceDetector exists.
 */
export async function estimateSmileScore(
  video: HTMLVideoElement,
  face: FaceBox,
): Promise<number> {
  const canvas = document.createElement("canvas");
  const w = 64;
  const h = 64;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const fx = (face.x / 100) * vw;
  const fy = (face.y / 100) * vh;
  const fw = (face.width / 100) * vw;
  const fh = (face.height / 100) * vh;

  // Mouth region ≈ lower third of face box
  const mx = fx + fw * 0.2;
  const my = fy + fh * 0.62;
  const mw = fw * 0.6;
  const mh = fh * 0.28;

  ctx.drawImage(video, mx, my, mw, mh, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  let brightness = 0;
  for (let i = 0; i < data.length; i += 4) {
    brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  brightness /= w * h;

  // Wider faces + brighter mouth region → higher smile score
  const aspect = face.width / Math.max(face.height, 0.01);
  const score = Math.min(1, (aspect - 0.7) * 1.2 + (brightness - 90) / 120);
  return Math.max(0, score);
}

export function isFaceDetectorSupported(): boolean {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (window as any).FaceDetector === "function";
}
