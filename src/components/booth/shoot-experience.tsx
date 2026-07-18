"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Timer } from "lucide-react";
import { useWebcam } from "@/hooks/use-webcam";
import { useCaptureWorkflow } from "@/hooks/use-capture-workflow";
import { useFaceAssist } from "@/hooks/use-face-assist";
import { useBoothStore } from "@/store/booth-store";
import { CameraStage } from "@/components/booth/camera-stage";
import { CountdownOverlay, FlashOverlay } from "@/components/booth/overlays";
import { FilterPicker } from "@/components/booth/controls";
import { BoothBackdrop, TopBar } from "@/components/shared/chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TOTAL_SHOTS } from "@/types";
import { getFrameLayout } from "@/lib/constants";
import { OverlayToolbar } from "@/components/overlay/OverlayToolbar";

export function ShootExperience() {
  const router = useRouter();
  const webcam = useWebcam(true);
  const { startSession } = useCaptureWorkflow(webcam.videoRef, webcam.stream);
  const {
    phase,
    photos,
    captureMode,
    frameLayout,
    retakePhotoId,
    autoSmile,
    isSessionFull,
  } = useBoothStore();
  const [busy, setBusy] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const autoStarted = useRef(false);
  const layout = getFrameLayout(frameLayout);

  const handleShoot = useCallback(async () => {
    if (busy) return;
    const wasRetake = Boolean(useBoothStore.getState().retakePhotoId);
    setBusy(true);
    setCaptureError(null);
    try {
      await startSession();
      const state = useBoothStore.getState();

      if (wasRetake) {
        router.push("/select");
        return;
      }

      if (state.isSessionFull()) {
        router.push("/select");
      }
    } catch {
      setCaptureError("오버레이를 포함한 사진 저장에 실패했습니다. PNG를 다시 선택해주세요.");
    } finally {
      setBusy(false);
    }
  }, [busy, startSession, router]);

  const onSmile = useCallback(() => {
    if (phase === "idle" || phase === "review") {
      void handleShoot();
    }
  }, [phase, handleShoot]);

  const { faces } = useFaceAssist(
    webcam.videoRef,
    Boolean(webcam.ready),
    autoSmile && (phase === "idle" || phase === "review") && !retakePhotoId,
    onSmile,
  );

  useEffect(() => {
    webcam.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (webcam.webcamRef.current?.video) {
        webcam.videoRef.current = webcam.webcamRef.current.video;
      }
    }, 400);
    return () => window.clearInterval(id);
  }, [webcam.webcamRef, webcam.videoRef]);

  useEffect(() => {
    if (
      captureMode === "auto10" &&
      webcam.ready &&
      photos.length === 0 &&
      !retakePhotoId &&
      phase === "idle" &&
      !busy &&
      !autoStarted.current
    ) {
      autoStarted.current = true;
      void handleShoot();
    }
  }, [webcam.ready, captureMode, photos.length, retakePhotoId, phase, busy, handleShoot]);

  const shootDisabled =
    !webcam.ready ||
    phase === "countdown" ||
    phase === "flash" ||
    busy ||
    (isSessionFull() && !retakePhotoId);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#050505] text-white">
      <BoothBackdrop />
      <TopBar />
      <FlashOverlay />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 pb-20 pt-24 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <section>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">
              {retakePhotoId ? "Retake" : "Step 03"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
              {retakePhotoId ? "다시 찍기" : "본 촬영"}
            </h1>
            <p className="mt-2 text-sm text-white/50">
              {layout.label} · {photos.length}/{TOTAL_SHOTS}
              {captureMode === "auto10"
                ? " · 10초 타이머 (마지막 3초만 비프)"
                : " · 버튼 촬영 3초"}
            </p>
          </div>

          <div className="relative mx-auto max-w-3xl">
            <CameraStage webcam={webcam} faces={faces} />
            <CountdownOverlay />
          </div>

          {webcam.error && (
            <Card className="mt-4 border-white/20 bg-white/10">
              <CardContent className="p-4 text-sm">
                카메라 접근에 실패했습니다.
                <div className="mt-2 opacity-70">{webcam.error}</div>
                <Button className="mt-3" size="sm" onClick={() => webcam.start()}>
                  다시 시도
                </Button>
              </CardContent>
            </Card>
          )}

          {captureError && (
            <Card className="mt-4 border-red-300/25 bg-red-500/10">
              <CardContent className="p-4 text-sm text-red-100" role="alert">
                {captureError}
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {(captureMode === "manual3" || retakePhotoId) && (
              <Button size="lg" disabled={shootDisabled} onClick={() => void handleShoot()}>
                <Camera className="h-5 w-5" />
                {retakePhotoId ? "다시 촬영 (3초)" : "촬영 (3초)"}
              </Button>
            )}
            {captureMode === "auto10" && !retakePhotoId && !isSessionFull() && photos.length > 0 && (
              <Button size="lg" disabled={shootDisabled} onClick={() => void handleShoot()}>
                <Timer className="h-5 w-5" />
                이어서 자동 촬영
              </Button>
            )}
            {isSessionFull() && !retakePhotoId && (
              <Button size="lg" variant="soft" onClick={() => router.push("/select")}>
                사진 선택으로
              </Button>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <OverlayToolbar />
          <Card>
            <CardContent className="space-y-5 p-5">
              <FilterPicker disabled={phase === "countdown" || phase === "flash"} />
              <p className="text-xs text-white/40">
                필터는 촬영 중에도 바꿀 수 있습니다. 적용된 필터가 사진에 저장됩니다.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
