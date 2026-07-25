"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Webcam from "react-webcam";

export interface WebcamController {
  webcamRef: React.RefObject<Webcam | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  ready: boolean;
  error: string | null;
  active: boolean;
  mirrored: boolean;
  start: () => void;
  handleUserMedia: (stream: MediaStream) => void;
  handleUserMediaError: (error: string | DOMException) => void;
}

/**
 * Camera access state for react-webcam.
 * Exposes the MediaStream for still capture and MediaRecorder.
 */
export function useWebcam(mirrored = true): WebcamController {
  const webcamRef = useRef<Webcam | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  const start = useCallback(() => {
    setError(null);
    setActive(true);
  }, []);

  const handleUserMedia = useCallback((media: MediaStream) => {
    setStream(media);
    setReady(true);
    videoRef.current = webcamRef.current?.video ?? null;
  }, []);

  const handleUserMediaError = useCallback((err: string | DOMException) => {
    setReady(false);
    setError(typeof err === "string" ? err : err.message || "카메라 권한이 필요합니다.");
  }, []);

  useEffect(() => {
    if (ready && webcamRef.current?.video) {
      videoRef.current = webcamRef.current.video;
    }
  }, [ready, stream]);

  useEffect(
    () => () => {
      webcamRef.current?.stream?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  return {
    webcamRef,
    videoRef,
    stream,
    ready: ready && active,
    error,
    active,
    mirrored,
    start,
    handleUserMedia,
    handleUserMediaError,
  };
}
