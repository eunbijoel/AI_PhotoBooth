"use client";

import { useRef } from "react";
import {
  Eye,
  EyeOff,
  ImagePlus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useOverlay } from "@/hooks/useOverlay";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export function OverlayToolbar() {
  const {
    imageSrc,
    visible,
    opacity,
    scale,
    rotation,
    uploadPng,
    uploadError,
    updateTransform,
    reset,
    toggleVisibility,
    deleteOverlay,
  } = useOverlay();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section
      className="rounded-3xl border border-white/15 bg-black/45 p-4 shadow-2xl backdrop-blur-2xl"
      aria-labelledby="overlay-toolbar-title"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p id="overlay-toolbar-title" className="text-sm font-semibold text-white">
            PNG Overlay
          </p>
          <p className="mt-1 text-[11px] text-white/45">드래그해 위치를 조정하세요.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!imageSrc}
          onClick={toggleVisibility}
          aria-label={visible ? "오버레이 숨기기" : "오버레이 보이기"}
          aria-pressed={visible}
        >
          {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,.png"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) uploadPng(file);
          event.currentTarget.value = "";
        }}
      />

      <div className="mb-5 grid grid-cols-3 gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          Upload
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={!imageSrc} onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={!imageSrc}
          onClick={deleteOverlay}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      {uploadError && (
        <p role="alert" className="mb-4 text-xs text-red-300">
          {uploadError}
        </p>
      )}

      <div className="space-y-4">
        <ControlRow label="Opacity" value={`${Math.round(opacity * 100)}%`}>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={opacity}
            disabled={!imageSrc}
            onChange={(event) => updateTransform({ opacity: Number(event.target.value) })}
            aria-label="오버레이 투명도"
          />
        </ControlRow>

        <ControlRow label="Scale" value={`${Math.round(scale * 100)}%`}>
          <Slider
            min={0.08}
            max={1.2}
            step={0.01}
            value={scale}
            disabled={!imageSrc}
            onChange={(event) => updateTransform({ scale: Number(event.target.value) })}
            aria-label="오버레이 크기"
          />
        </ControlRow>

        <ControlRow label="Rotation" value={`${Math.round(rotation)}°`}>
          <Slider
            min={-180}
            max={180}
            step={1}
            value={rotation}
            disabled={!imageSrc}
            onChange={(event) => updateTransform({ rotation: Number(event.target.value) })}
            aria-label="오버레이 회전"
          />
        </ControlRow>
      </div>
    </section>
  );
}

function ControlRow({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="font-mono text-[11px] text-white/50">{value}</span>
      </div>
      {children}
    </div>
  );
}
