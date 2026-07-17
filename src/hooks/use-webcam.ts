"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Webcam from "react-webcam";

export interface WebcamController {
  webcamRef: React.RefObject<Webcam | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  ready: boolean;
  error: string | null;
  permission: "prompt" | "granted" | "denied" | "unknown";
  active: boolean;
  mirrored: boolean;
  start: () => void;
  stop: () => void;
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
  const [permission, setPermission] = useState<"prompt" | "granted" | "denied" | "unknown">(
    "unknown",
  );
  const [active, setActive] = useState(false);

  const stop = useCallback(() => {
    const media = webcamRef.current?.stream ?? stream;
    media?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setReady(false);
    setActive(false);
  }, [stream]);

  const start = useCallback(() => {
    setError(null);
    setActive(true);
  }, []);

  const handleUserMedia = useCallback((media: MediaStream) => {
    setPermission("granted");
    setStream(media);
    setReady(true);
    videoRef.current = webcamRef.current?.video ?? null;
  }, []);

  const handleUserMediaError = useCallback((err: string | DOMException) => {
    setPermission("denied");
    setReady(false);
    setError(typeof err === "string" ? err : err.message || "카메라 권한이 필요합니다.");
  }, []);

  useEffect(() => {
    if (ready && webcamRef.current?.video) {
      videoRef.current = webcamRef.current.video;
    }
  }, [ready, stream]);

  useEffect(() => () => {
    webcamRef.current?.stream?.getTracks().forEach((t) => t.stop());
  }, []);

  return {
    webcamRef,
    videoRef,
    stream,
    ready: ready && active,
    error,
    permission,
    active,
    mirrored,
    start,
    stop,
    handleUserMedia,
    handleUserMediaError,
  };
}
