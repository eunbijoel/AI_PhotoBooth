"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useBoothStore } from "@/store/booth-store";
import { generatePhotoStrip } from "@/lib/strip";
import { getFrame, getFrameLayout } from "@/lib/constants";
import { FilterPicker, FrameThemePicker } from "@/components/booth/controls";
import { CaptionField } from "@/components/booth/caption-field";
import { BoothBackdrop, TopBar } from "@/components/shared/chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FinalizeExperience() {
  const router = useRouter();
  const {
    photos,
    selectedPhotoIds,
    frame,
    frameLayout,
    caption,
    hasFinalSelection,
    setStrip,
    setPhase,
  } = useBoothStore();
  const [finishing, setFinishing] = useState(false);
  const style = getFrame(frame);
  const layout = getFrameLayout(frameLayout);

  const selectedPhotos = useMemo(
    () =>
      selectedPhotoIds
        .map((id) => photos.find((p) => p.id === id))
        .filter((p): p is (typeof photos)[number] => Boolean(p)),
    [photos, selectedPhotoIds],
  );

  const finish = async () => {
    if (!hasFinalSelection() || finishing) return;
    setFinishing(true);
    try {
      const strip = await generatePhotoStrip({
        photos: selectedPhotos,
        frameId: frame,
        frameLayoutId: frameLayout,
        caption,
      });
      setStrip(strip);
      setPhase("complete");
      router.push("/result");
    } finally {
      setFinishing(false);
    }
  };

  if (!hasFinalSelection()) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center bg-[#050505] text-white">
        <BoothBackdrop />
        <TopBar />
        <Card className="relative z-10 max-w-md">
          <CardContent className="space-y-4 p-8 text-center">
            <p>먼저 4장의 사진을 선택해주세요.</p>
            <Button onClick={() => router.push("/select")}>선택 화면으로</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#050505] text-white">
      <BoothBackdrop />
      <TopBar />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 pb-24 pt-24 lg:grid-cols-[minmax(0,380px)_1fr] lg:px-8">
        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-white/40">Step 05</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">프레임 확정</h1>
          <p className="mt-2 text-sm text-white/50">테마·필터·캡션을 고른 뒤 최종 확정하세요.</p>

          <div
            className="mt-6 overflow-hidden rounded-[1.5rem] shadow-2xl ring-1 ring-white/10"
            style={{ background: style.background }}
          >
            <div
              className="relative w-full"
              style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
            >
              {layout.slots.map((slot, i) => {
                const photo = selectedPhotos[i];
                return (
                  <div
                    key={i}
                    className="absolute overflow-hidden"
                    style={{
                      left: `${(slot.x / layout.width) * 100}%`,
                      top: `${(slot.y / layout.height) * 100}%`,
                      width: `${(slot.width / layout.width) * 100}%`,
                      height: `${(slot.height / layout.height) * 100}%`,
                    }}
                  >
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.dataUrl}
                        alt=""
                        className="h-full w-full"
                        style={{
                          filter: undefined,
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-black/20" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <Card>
            <CardContent className="space-y-8 p-6">
              <FrameThemePicker />
              <FilterPicker />
              <p className="text-xs text-white/40">
                * 필터는 이미 촬영된 사진에는 소급 적용되지 않습니다. 다시 찍을 때 새 필터가
                적용됩니다.
              </p>
              <CaptionField />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="lg" onClick={() => router.push("/select")}>
              사진 다시 고르기
            </Button>
            <Button size="lg" disabled={finishing} onClick={() => void finish()}>
              <Check className="h-4 w-4" />
              {finishing ? "렌더링 중…" : "최종 확정"}
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
