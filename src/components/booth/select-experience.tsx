"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, ArrowRight, Check, Download } from "lucide-react";
import { useBoothStore } from "@/store/booth-store";
import { downloadAllPhotosZip } from "@/lib/download";
import { BoothBackdrop, TopBar } from "@/components/shared/chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FINAL_PHOTO_COUNT, MAX_RETAKES, TOTAL_SHOTS } from "@/types";
import { cn } from "@/lib/utils";

export function SelectExperience() {
  const router = useRouter();
  const {
    photos,
    selectedPhotoIds,
    togglePhotoSelected,
    startRetake,
    retakesUsed,
    canRetake,
    hasFinalSelection,
    isSessionFull,
  } = useBoothStore();
  const [downloading, setDownloading] = useState(false);

  if (!isSessionFull() && photos.length === 0) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center bg-[#050505] text-white">
        <BoothBackdrop />
        <TopBar />
        <Card className="relative z-10 max-w-md">
          <CardContent className="space-y-4 p-8 text-center">
            <p>아직 촬영한 사진이 없습니다.</p>
            <Button onClick={() => router.push("/setup")}>촬영 준비로</Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const onRetake = (photoId: string) => {
    const ok = startRetake(photoId);
    if (!ok) return;
    router.push("/booth");
  };

  const onDownloadAll = async () => {
    if (photos.length === 0 || downloading) return;
    setDownloading(true);
    try {
      await downloadAllPhotosZip(photos);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#050505] text-white">
      <BoothBackdrop />
      <TopBar />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-24 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">Step 04</p>
            <h1 className="mt-2 text-4xl font-semibold">사진 확인 · 선택</h1>
            <p className="mt-2 max-w-xl text-white/55">
              {TOTAL_SHOTS}장 중 마음에 드는 {FINAL_PHOTO_COUNT}장을 고르세요. 클릭으로 선택/해제가
              가능합니다. 다시 찍기는 최대 {MAX_RETAKES}장까지 가능합니다. 전체 후보 사진도 ZIP으로
              받을 수 있습니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60">
              선택 {selectedPhotoIds.length} / {FINAL_PHOTO_COUNT}
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60">
              다시찍기 {retakesUsed} / {MAX_RETAKES}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={photos.length === 0 || downloading}
              onClick={() => void onDownloadAll()}
              aria-label="촬영한 전체 사진 ZIP 다운로드"
            >
              <Download className="h-4 w-4" />
              {downloading ? "ZIP 생성 중…" : `전체 사진 ZIP (${photos.length})`}
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-5 md:p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photos.map((photo, index) => {
                const selected = selectedPhotoIds.includes(photo.id);
                const order = selected ? selectedPhotoIds.indexOf(photo.id) + 1 : null;
                return (
                  <div
                    key={photo.id}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border bg-black/40",
                      selected ? "border-white ring-2 ring-white/50" : "border-white/10",
                    )}
                  >
                    <button
                      type="button"
                      className="block w-full"
                      onClick={() => togglePhotoSelected(photo.id)}
                      aria-pressed={selected}
                      aria-label={`${index + 1}번 사진 ${selected ? "선택 해제" : "선택"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.dataUrl}
                        alt={`${index + 1}번 후보`}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </button>

                    <div className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[10px] text-white">
                      {index + 1}
                    </div>
                    {order && (
                      <div className="absolute right-2 top-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-black">
                        #{order}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={!canRetake()}
                      onClick={() => onRetake(photo.id)}
                      className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 rounded-full bg-black/75 px-2 py-1.5 text-[11px] text-white opacity-90 transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <RotateCcw className="h-3 w-3" />
                      다시 찍기
                    </button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="lg" onClick={() => router.push("/booth")}>
            촬영으로
          </Button>
          <Button
            variant="outline"
            size="lg"
            disabled={photos.length === 0 || downloading}
            onClick={() => void onDownloadAll()}
          >
            <Download className="h-4 w-4" />
            {downloading ? "ZIP 생성 중…" : "전체 사진 다운로드"}
          </Button>
          <Button
            size="lg"
            disabled={!hasFinalSelection()}
            onClick={() => router.push("/finalize")}
          >
            <Check className="h-4 w-4" />
            프레임 꾸미기
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}
