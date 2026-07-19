"use client";

import { useRef } from "react";
import { OverlayPreviewCanvas } from "@/components/overlay/OverlayPreviewCanvas";
import { useBoothStore } from "@/store/booth-store";
import { useOverlayStore } from "@/store/overlay-store";
import { cn } from "@/lib/utils";

interface DragState {
  pointerId: number;
  offsetX: number;
  offsetY: number;
}

/** Layer mounted directly above the webcam's object-cover viewport. */
export function OverlayCanvas() {
  const locked = useBoothStore((state) => Boolean(state.lockedOverlay));
  const x = useOverlayStore((state) => state.x);
  const y = useOverlayStore((state) => state.y);
  const imageSrc = useOverlayStore((state) => state.imageSrc);
  const visible = useOverlayStore((state) => state.visible);
  const updateTransform = useOverlayStore((state) => state.updateTransform);
  const dragState = useRef<DragState | null>(null);

  const normalizedPointer = (
    event: React.PointerEvent<HTMLDivElement>,
  ): { x: number; y: number } | null => {
    const frame = event.currentTarget;
    if (frame.clientWidth <= 0 || frame.clientHeight <= 0) return null;
    return {
      x: event.nativeEvent.offsetX / frame.clientWidth,
      y: event.nativeEvent.offsetY / frame.clientHeight,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (locked || !imageSrc || !visible) return;
    const point = normalizedPointer(event);
    if (!point) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      offsetX: point.x - x,
      offsetY: point.y - y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = normalizedPointer(event);
    if (!point) return;
    updateTransform({
      x: Math.min(1, Math.max(0, point.x - drag.offsetX)),
      y: Math.min(1, Math.max(0, point.y - drag.offsetY)),
    });
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId !== event.pointerId) return;
    dragState.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 touch-none overflow-hidden",
        locked ? "cursor-default" : "cursor-grab active:cursor-grabbing",
      )}
      aria-label={locked ? "고정된 오버레이" : "오버레이 편집 영역"}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <OverlayPreviewCanvas />
    </div>
  );
}
