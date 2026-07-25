"use client";

import { useCallback, useEffect, useState } from "react";
import { detectFaces, isFaceDetectorSupported } from "@/lib/face";
import type { FaceBox } from "@/types";

/** Poll FaceDetector for live face boxes when supported. */
export function useFaceAssist(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
) {
  const [faces, setFaces] = useState<FaceBox[]>([]);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isFaceDetectorSupported());
  }, []);

  const tick = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !enabled || !supported || video.readyState < 2) return;
    setFaces(await detectFaces(video));
  }, [videoRef, enabled, supported]);

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
