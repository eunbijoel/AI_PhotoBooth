/** Transform and visibility state for a single transparent PNG overlay. */
export interface OverlayState {
  imageSrc: string | null;
  /** Normalized center coordinates within the camera frame (0..1). */
  x: number;
  y: number;
  /** Overlay width as a fraction of the camera frame width. */
  scale: number;
  /** Clockwise rotation in degrees. */
  rotation: number;
  opacity: number;
  visible: boolean;
}

export interface OverlayTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

/** Exact visual geometry sampled from the live preview at shutter time. */
export interface OverlayPreviewSnapshot {
  overlay: OverlayState;
  frameAspectRatio: number;
}

export const DEFAULT_OVERLAY_SRC = "/examples/puppy.png";

export const DEFAULT_OVERLAY_TRANSFORM: OverlayTransform = {
  x: 0.5,
  y: 0.56,
  scale: 0.38,
  rotation: 0,
  opacity: 1,
};
