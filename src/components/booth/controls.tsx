"use client";

import { FILTERS, FRAME_LAYOUTS, FRAMES, getCaptureAspect, getFrameLayout } from "@/lib/constants";
import { useBoothStore } from "@/store/booth-store";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CaptureModePicker({ disabled = false }: { disabled?: boolean }) {
  const { captureMode, setCaptureMode } = useBoothStore();

  return (
    <section aria-labelledby="capture-mode-heading">
      <Label id="capture-mode-heading" className="mb-3 block">
        촬영 방식
      </Label>
      <div className="grid gap-3 md:grid-cols-2">
        {[
          {
            id: "manual3" as const,
            label: "버튼 촬영",
            desc: "촬영 버튼을 누르면 3초 뒤 한 장씩 촬영",
          },
          {
            id: "auto10" as const,
            label: "10초 자동 타이머",
            desc: "10초마다 자동 촬영 · 소리는 마지막 3초만",
          },
        ].map((mode) => (
          <button
            key={mode.id}
            type="button"
            disabled={disabled}
            onClick={() => setCaptureMode(mode.id)}
            className={cn(
              "rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
              captureMode === mode.id
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/[0.03] text-white hover:border-white/30",
            )}
            aria-pressed={captureMode === mode.id}
          >
            <span className="block text-sm font-semibold">{mode.label}</span>
            <span
              className={cn(
                "mt-1 block text-xs",
                captureMode === mode.id ? "text-black/55" : "text-white/45",
              )}
            >
              {mode.desc}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/** Show all frame layouts at once with visual previews. */
export function FrameLayoutGallery({ disabled = false }: { disabled?: boolean }) {
  const { frameLayout, setFrameLayout } = useBoothStore();

  return (
    <section aria-labelledby="layout-heading">
      <Label id="layout-heading" className="mb-3 block">
        프레임 형태
      </Label>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {FRAME_LAYOUTS.map((layout) => {
          const selected = frameLayout === layout.id;
          const aspect = layout.height / layout.width;
          return (
            <button
              key={layout.id}
              type="button"
              disabled={disabled}
              onClick={() => setFrameLayout(layout.id)}
              className={cn(
                "rounded-3xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
                selected
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-white/[0.03] text-white hover:border-white/30",
              )}
              aria-pressed={selected}
            >
              <div
                className="relative mx-auto mb-3 w-full max-w-[180px] overflow-hidden rounded-xl"
                style={{
                  aspectRatio: `${layout.width} / ${layout.height}`,
                  background: selected ? "#111" : "#0a0a0a",
                }}
              >
                {layout.slots.map((slot, i) => (
                  <div
                    key={i}
                    className="absolute bg-zinc-600/80"
                    style={{
                      left: `${(slot.x / layout.width) * 100}%`,
                      top: `${(slot.y / layout.height) * 100}%`,
                      width: `${(slot.width / layout.width) * 100}%`,
                      height: `${(slot.height / layout.height) * 100}%`,
                    }}
                  />
                ))}
              </div>
              <span className="block text-sm font-semibold">{layout.label}</span>
              <span className={cn("mt-1 block text-xs", selected ? "text-black/55" : "text-white/45")}>
                {layout.description}
              </span>
              <span className={cn("mt-2 block text-[10px] uppercase tracking-wider", selected ? "text-black/40" : "text-white/30")}>
                카메라 비율 {getCaptureAspect(layout.id).ratio.toFixed(2)} · {aspect > 1 ? "세로형" : "가로형"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function FilterPicker({ disabled = false }: { disabled?: boolean }) {
  const { filter, setFilter } = useBoothStore();

  return (
    <section aria-labelledby="filter-heading">
      <Label id="filter-heading" className="mb-3 block">
        필터
      </Label>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            disabled={disabled}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition disabled:opacity-50",
              filter === f.id
                ? "border-white bg-white text-black"
                : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10",
            )}
            aria-pressed={filter === f.id}
          >
            {f.id === "heart" ? "♥ " : ""}
            {f.label}
          </button>
        ))}
      </div>
    </section>
  );
}

/** Theme/color picker without fake white borders. */
export function FrameThemePicker() {
  const { frame, setFrame, frameLayout } = useBoothStore();
  const layout = getFrameLayout(frameLayout);

  return (
    <section aria-labelledby="theme-heading">
      <Label id="theme-heading" className="mb-3 block">
        프레임 색 / 테마
      </Label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {FRAMES.map((f) => {
          const selected = frame === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFrame(f.id)}
              className={cn(
                "rounded-2xl border p-3 text-left transition",
                selected ? "border-white ring-2 ring-white/40" : "border-white/10 hover:border-white/25",
              )}
              aria-pressed={selected}
            >
              <div
                className="relative mb-2 w-full overflow-hidden rounded-lg"
                style={{
                  aspectRatio: `${layout.width} / ${layout.height}`,
                  background: f.background,
                }}
              >
                {layout.slots.map((slot, i) => (
                  <div
                    key={i}
                    className="absolute bg-black/25"
                    style={{
                      left: `${(slot.x / layout.width) * 100}%`,
                      top: `${(slot.y / layout.height) * 100}%`,
                      width: `${(slot.width / layout.width) * 100}%`,
                      height: `${(slot.height / layout.height) * 100}%`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] text-white/75">{f.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
