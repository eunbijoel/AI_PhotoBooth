"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { detectFaces, estimateSmileScore, isFaceDetectorSupported } from "@/lib/face";
import type { FaceBox } from "@/types";

/**
 * Poll FaceDetector for face boxes and optional smile auto-capture assist.
 */
export function useFaceAssist(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  autoSmile: boolean,
  onSmile?: () => void,
) {
  const [faces, setFaces] = useState<FaceBox[]>([]);
  const [supported, setSupported] = useState(false);
  const smileLock = useRef(false);

  useEffect(() => {
    setSupported(isFaceDetectorSupported());
  }, []);

  const tick = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !enabled || !supported || video.readyState < 2) return;

    const next = await detectFaces(video);
    setFaces(next);

    if (autoSmile && next[0] && onSmile && !smileLock.current) {
      const score = await estimateSmileScore(video, next[0]);
      if (score > 0.55) {
        smileLock.current = true;
        onSmile();
        setTimeout(() => {
          smileLock.current = false;
        }, 4000);
      }
    }
  }, [videoRef, enabled, supported, autoSmile, onSmile]);

  useEffect(() => {
    if (!enabled || !supported) {
      setFaces([]);
      return;
    }
    const id = window.setInterval(() => {
      void tick();
    }, 350);
    return () => window.clearInterval(id);
  }, [enabled, supported, tick]);

  return { faces, supported };
}
