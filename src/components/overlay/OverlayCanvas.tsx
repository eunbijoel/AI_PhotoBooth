"use client";

import { OverlayImage } from "@/components/overlay/OverlayImage";

/** Layer mounted directly above the webcam's object-cover viewport. */
export function OverlayCanvas() {
  return (
    <div
      className="absolute inset-0 z-10 overflow-hidden"
      aria-label="오버레이 편집 영역"
      data-overlay-frame
    >
      <OverlayImage />
    </div>
  );
}
