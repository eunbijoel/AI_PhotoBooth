"use client";

import Webcam from "react-webcam";
import { motion } from "framer-motion";
import type { FaceBox } from "@/types";
import { TOTAL_SHOTS } from "@/types";
import { useBoothStore } from "@/store/booth-store";
import { getCaptureAspect, getFilter, getFilterCss } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { WebcamController } from "@/hooks/use-webcam";
import { OverlayCanvas } from "@/components/overlay/OverlayCanvas";

interface CameraStageProps {
  webcam: WebcamController;
  faces: FaceBox[];
  className?: string;
}

export function CameraStage({ webcam, faces, className }: CameraStageProps) {
  const { filter, poseGuide, backgroundBlur, currentShot, phase, frameLayout, retakePhotoId } =
    useBoothStore();
  const aspect = getCaptureAspect(frameLayout);
  const filterMeta = getFilter(filter);

  const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
    facingMode: "user",
    width: { ideal: Math.max(1280, aspect.width) },
    height: { ideal: Math.max(720, aspect.height) },
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[2rem] border border-white/15 bg-zinc-950 shadow-[0_30px_80px_rgba(0,0,0,0.45)]",
        className,
      )}
      style={{ aspectRatio: `${aspect.width} / ${aspect.height}` }}
    >
      {webcam.active ? (
        <Webcam
          ref={webcam.webcamRef}
          audio={false}
          mirrored={webcam.mirrored}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.92}
          videoConstraints={VIDEO_CONSTRAINTS}
          onUserMedia={webcam.handleUserMedia}
          onUserMediaError={webcam.handleUserMediaError}
          className={cn("h-full w-full object-cover", backgroundBlur && "scale-105")}
          style={{
            filter: `${getFilterCss(filter)}${backgroundBlur ? " blur(1.5px)" : ""}`,
          }}
          forceScreenshotSourceSize
          aria-label="라이브 웹캠 미리보기"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-white/70">
          카메라 대기 중…
        </div>
      )}

      {/* Live heart overlay for Photo Booth–style hearts filter */}
      {filterMeta.overlay === "hearts" && (
        <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden>
          {["12% 18%", "82% 22%", "20% 72%", "78% 68%", "50% 12%", "88% 48%", "10% 45%"].map(
            (pos, i) => (
              <span
                key={i}
                className="absolute text-rose-400/70"
                style={{
                  left: pos.split(" ")[0],
                  top: pos.split(" ")[1],
                  fontSize: `${18 + (i % 3) * 8}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                ♥
              </span>
            ),
          )}
        </div>
      )}

      <OverlayCanvas />

      {webcam.active && !webcam.ready && !webcam.error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/80 text-sm text-white/70">
          카메라 준비 중…
        </div>
      )}

      {poseGuide && phase !== "flash" && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="h-[68%] w-[58%] rounded-[40%] border border-dashed border-white/35" />
        </div>
      )}

      {faces.map((face, i) => (
        <div
          key={i}
          className="pointer-events-none absolute z-20 rounded-xl border-2 border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.25)]"
          style={{
            left: `${100 - face.x - face.width}%`,
            top: `${face.y}%`,
            width: `${face.width}%`,
            height: `${face.height}%`,
          }}
        />
      ))}

      <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
        {retakePhotoId
          ? "다시 찍기"
          : `Photo ${Math.min(currentShot + (phase === "countdown" || phase === "flash" ? 1 : 0), TOTAL_SHOTS)} / ${TOTAL_SHOTS}`}
      </div>

      {!retakePhotoId && <ProgressDots />}
    </div>
  );
}

function ProgressDots() {
  const photos = useBoothStore((s) => s.photos);
  return (
    <div
      className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5"
      aria-label="촬영 진행도"
    >
      {Array.from({ length: TOTAL_SHOTS }).map((_, i) => (
        <motion.span
          key={i}
          className={cn(
            "h-2 w-2 rounded-full border border-white/40",
            i < photos.length ? "bg-white" : "bg-white/20",
          )}
          animate={i === photos.length ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.9, repeat: i === photos.length ? Infinity : 0 }}
        />
      ))}
    </div>
  );
}
