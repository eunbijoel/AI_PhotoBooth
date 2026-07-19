"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadOverlayImage } from "@/lib/overlay-engine";
import { renderOverlayToCanvas } from "@/lib/overlay-renderer";
import { useBoothStore } from "@/store/booth-store";
import { useOverlayStore } from "@/store/overlay-store";

interface ViewportSize {
  width: number;
  height: number;
  pixelRatio: number;
}

/**
 * Live overlay preview rendered by the exact Canvas renderer used for capture.
 * ResizeObserver only sizes this display canvas; its measurements never enter
 * capture state or captured-image calculations.
 */
export function OverlayPreviewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lockedOverlay = useBoothStore((state) => state.lockedOverlay);
  const editableOverlay = useOverlayStore();
  const [viewport, setViewport] = useState<ViewportSize>({
    width: 0,
    height: 0,
    pixelRatio: 1,
  });
  const overlay = useMemo(
    () =>
      lockedOverlay ?? {
        imageSrc: editableOverlay.imageSrc,
        x: editableOverlay.x,
        y: editableOverlay.y,
        scale: editableOverlay.scale,
        rotation: editableOverlay.rotation,
        opacity: editableOverlay.opacity,
        visible: editableOverlay.visible,
      },
    [editableOverlay, lockedOverlay],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = canvas?.parentElement;
    if (!canvas || !frame) return;

    const updateSize = (width: number, height: number) => {
      setViewport({
        width,
        height,
        pixelRatio: window.devicePixelRatio || 1,
      });
    };
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      updateSize(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewport.width <= 0 || viewport.height <= 0) return;

    canvas.width = Math.round(viewport.width * viewport.pixelRatio);
    canvas.height = Math.round(viewport.height * viewport.pixelRatio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(viewport.pixelRatio, 0, 0, viewport.pixelRatio, 0, 0);
    ctx.clearRect(0, 0, viewport.width, viewport.height);

    if (!overlay.visible || !overlay.imageSrc) return;
    let cancelled = false;
    void loadOverlayImage(overlay.imageSrc).then((image) => {
      if (cancelled) return;
      ctx.clearRect(0, 0, viewport.width, viewport.height);
      renderOverlayToCanvas(ctx, image, overlay, viewport.width, viewport.height);
    });
    return () => {
      cancelled = true;
    };
  }, [overlay, viewport]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
