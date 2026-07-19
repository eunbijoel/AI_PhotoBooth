"use client";

import { useCallback, useRef } from "react";
import { useBoothStore } from "@/store/booth-store";
import { captureFromVideo } from "@/lib/strip";
import { createSessionRecorder, type SessionRecorder } from "@/lib/recorder";
import { playCountdownBeep, playShutter, playComplete } from "@/lib/sounds";
import { AUTO_COUNTDOWN_SECONDS, COUNTDOWN_SECONDS, TOTAL_SHOTS } from "@/types";
import { getCaptureAspect } from "@/lib/constants";
import { sleep } from "@/lib/utils";
import { useOverlayStore } from "@/store/overlay-store";

/**
 * Orchestrates countdown → flash → capture for the 8-shot candidate pool.
 * Auto mode: 10s timer, beep only on the last 3 seconds.
 */
export function useCaptureWorkflow(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  stream: MediaStream | null,
) {
  const busy = useRef(false);
  const recorderRef = useRef<SessionRecorder | null>(null);

  const {
    phase,
    captureMode,
    filter,
    frameLayout,
    muted,
    setPhase,
    setCountdown,
    addPhoto,
    setVideoBlob,
    isSessionFull,
  } = useBoothStore();

  const captureOne = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return false;
    const overlayState =
      useBoothStore.getState().lockedOverlay ?? useOverlayStore.getState();
    const captureAspect = getCaptureAspect(frameLayout);

    setPhase("flash");
    await playShutter(muted);
    await sleep(120);
    const dataUrl = await captureFromVideo(
      video,
      filter,
      true,
      captureAspect.width,
      captureAspect.height,
      overlayState,
    );
    addPhoto(dataUrl, filter);
    setPhase("review");
    await sleep(450);
    return true;
  }, [videoRef, filter, frameLayout, muted, setPhase, addPhoto]);

  /** Countdown with optional beep only for the final N seconds. */
  const runCountdown = useCallback(
    async (seconds: number, beepLastSeconds = seconds) => {
      for (let n = seconds; n >= 1; n--) {
        setCountdown(n);
        setPhase("countdown");
        if (n <= beepLastSeconds) {
          await playCountdownBeep(muted);
        }
        await sleep(1000);
      }
      setCountdown(0);
    },
    [muted, setCountdown, setPhase],
  );

  const startSession = useCallback(async (): Promise<"shot" | "complete" | "idle"> => {
    const currentRetakeId = useBoothStore.getState().retakePhotoId;
    if (busy.current || (isSessionFull() && !currentRetakeId)) return "idle";
    busy.current = true;

    try {
      const sessionState = useBoothStore.getState();
      if (!sessionState.lockedOverlay) {
        sessionState.lockOverlay(useOverlayStore.getState());
      }

      // Record the original 8-shot session once. A later retake must not
      // overwrite the completed session video with a short replacement clip.
      if (stream && !currentRetakeId && !sessionState.videoBlob) {
        if (!recorderRef.current?.isRecording()) {
          recorderRef.current = createSessionRecorder(stream);
          recorderRef.current.start();
        }
      }

      if (captureMode === "auto10" && !currentRetakeId) {
        while (!useBoothStore.getState().isSessionFull()) {
          // 10s wait, sound only on last 3
          await runCountdown(AUTO_COUNTDOWN_SECONDS, COUNTDOWN_SECONDS);
          const ok = await captureOne();
          if (!ok) break;
          if (useBoothStore.getState().photos.length < TOTAL_SHOTS) {
            await sleep(600);
          }
        }
      } else {
        await runCountdown(COUNTDOWN_SECONDS, COUNTDOWN_SECONDS);
        await captureOne();
      }

      const full = useBoothStore.getState().isSessionFull();
      const wasRetake = Boolean(currentRetakeId);

      if (full && recorderRef.current?.isRecording()) {
        const blob = await recorderRef.current.stop();
        if (blob) setVideoBlob(blob);
        recorderRef.current = null;
        await playComplete(muted);
      }

      if (wasRetake) return "shot";
      if (full) return "complete";
      return "shot";
    } finally {
      busy.current = false;
    }
  }, [
    stream,
    captureMode,
    isSessionFull,
    runCountdown,
    captureOne,
    setVideoBlob,
    muted,
  ]);

  return {
    phase,
    startSession,
    captureOne,
    busy: busy.current,
  };
}
