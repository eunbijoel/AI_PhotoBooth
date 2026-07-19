"use client";

import { useRef, useState } from "react";
import { Dog, FileUp, ImageOff } from "lucide-react";
import { useOverlay } from "@/hooks/useOverlay";
import { DEFAULT_OVERLAY_SRC } from "@/types/overlay";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/** Pre-shoot overlay choice: demo, user-selected PNG, or no overlay. */
export function OverlayPicker() {
  const {
    imageSrc,
    setImageSrc,
    deleteOverlay,
    uploadPng,
    uploadError,
  } = useOverlay();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const isCustom = Boolean(imageSrc && imageSrc !== DEFAULT_OVERLAY_SRC);

  return (
    <section aria-labelledby="overlay-picker-heading">
      <Label id="overlay-picker-heading" className="mb-3 block">
        투명 PNG 오버레이
      </Label>
      <p className="mb-4 text-xs text-white/45">
        데모를 선택하거나 내 파일에서 투명 PNG 한 장을 불러오세요. 브라우저는 선택한 파일에만
        접근합니다.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,.png"
        className="sr-only"
        onChange={async (event) => {
          const input = event.currentTarget;
          const file = input.files?.[0];
          if (!file) return;
          setUploading(true);
          try {
            await uploadPng(file);
          } finally {
            setUploading(false);
            input.value = "";
          }
        }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Choice
          selected={imageSrc === DEFAULT_OVERLAY_SRC}
          title="Puppy Demo"
          description="기본 투명 PNG"
          onClick={() => setImageSrc(DEFAULT_OVERLAY_SRC)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={DEFAULT_OVERLAY_SRC} alt="" className="h-20 w-20 object-contain" />
        </Choice>

        <Choice
          selected={isCustom}
          title={uploading ? "불러오는 중…" : "내 PNG 선택"}
          description="파일 선택 창 열기"
          onClick={() => inputRef.current?.click()}
        >
          {isCustom && imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt="" className="h-20 w-20 object-contain" />
          ) : (
            <FileUp className="h-10 w-10 text-white/70" />
          )}
        </Choice>

        <Choice
          selected={!imageSrc}
          title="오버레이 없음"
          description="PNG 없이 촬영"
          onClick={deleteOverlay}
        >
          <ImageOff className="h-10 w-10 text-white/55" />
        </Choice>
      </div>

      {uploadError && (
        <p role="alert" className="mt-3 text-xs text-red-300">
          {uploadError}
        </p>
      )}
    </section>
  );
}

function Choice({
  selected,
  title,
  description,
  onClick,
  children,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-4 text-left transition",
        selected
          ? "border-white bg-white text-black"
          : "border-white/10 bg-white/[0.03] text-white hover:border-white/30",
      )}
      aria-pressed={selected}
    >
      <div
        className={cn(
          "mb-3 flex h-24 items-center justify-center overflow-hidden rounded-xl",
          selected ? "bg-zinc-200" : "bg-black/35",
        )}
      >
        {children}
      </div>
      <span className="flex items-center gap-1.5 text-sm font-semibold">
        {title === "Puppy Demo" && <Dog className="h-3.5 w-3.5" />}
        {title}
      </span>
      <span className={cn("mt-1 block text-xs", selected ? "text-black/55" : "text-white/40")}>
        {description}
      </span>
    </button>
  );
}
