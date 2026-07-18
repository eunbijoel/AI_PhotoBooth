"use client";

import { memo, useRef } from "react";
import { useOverlayStore } from "@/store/overlay-store";
import { cn } from "@/lib/utils";

interface DragState {
  pointerId: number;
  offsetX: number;
  offsetY: number;
}

/** Interactive PNG layer rendered in normalized camera-frame coordinates. */
export const OverlayImage = memo(function OverlayImage() {
  const imageSrc = useOverlayStore((state) => state.imageSrc);
  const x = useOverlayStore((state) => state.x);
  const y = useOverlayStore((state) => state.y);
  const scale = useOverlayStore((state) => state.scale);
  const rotation = useOverlayStore((state) => state.rotation);
  const opacity = useOverlayStore((state) => state.opacity);
  const visible = useOverlayStore((state) => state.visible);
  const updateTransform = useOverlayStore((state) => state.updateTransform);
  const dragState = useRef<DragState | null>(null);

  if (!imageSrc || !visible) return null;

  const getNormalizedPointer = (
    event: React.PointerEvent<HTMLImageElement>,
  ): { x: number; y: number } | null => {
    const frame = event.currentTarget.parentElement;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    const point = getNormalizedPointer(event);
    if (!point) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      offsetX: point.x - x,
      offsetY: point.y - y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = getNormalizedPointer(event);
    if (!point) return;

    updateTransform({
      x: Math.min(1, Math.max(0, point.x - drag.offsetX)),
      y: Math.min(1, Math.max(0, point.y - drag.offsetY)),
    });
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLImageElement>) => {
    if (dragState.current?.pointerId !== event.pointerId) return;
    dragState.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    // Plain img is required for transparent object/blob URLs and direct dragging.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc}
      alt="포토부스 오버레이"
      draggable={false}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className={cn(
        "absolute z-10 h-auto max-w-none -translate-x-1/2 -translate-y-1/2",
        "cursor-grab touch-none select-none active:cursor-grabbing",
        "drop-shadow-[0_8px_24px_rgba(0,0,0,0.2)]",
      )}
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${scale * 100}%`,
        opacity,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        transformOrigin: "center",
      }}
      data-overlay-image
    />
  );
});
