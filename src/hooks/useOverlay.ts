"use client";

import { useCallback, useEffect, useState } from "react";
import { loadOverlayImage, preloadOverlayImage } from "@/lib/overlay-engine";
import { useOverlayStore } from "@/store/overlay-store";

const PNG_MIME_TYPE = "image/png";

/** UI-facing overlay controller. Uploaded PNGs are stored as durable data URLs. */
export function useOverlay() {
  const overlay = useOverlayStore();
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (overlay.imageSrc) preloadOverlayImage(overlay.imageSrc);
  }, [overlay.imageSrc]);

  const uploadPng = useCallback(
    async (file: File): Promise<boolean> => {
      setUploadError(null);

      if (file.type !== PNG_MIME_TYPE || !file.name.toLowerCase().endsWith(".png")) {
        setUploadError("투명 PNG 파일만 업로드할 수 있습니다.");
        return false;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        await preloadAndDecode(dataUrl);
        overlay.setImageSrc(dataUrl);
        return true;
      } catch {
        setUploadError("PNG 파일을 읽지 못했습니다. 다른 파일을 선택해주세요.");
        return false;
      }
    },
    [overlay],
  );

  return {
    ...overlay,
    uploadPng,
    uploadError,
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Invalid PNG"));
    reader.onerror = () => reject(reader.error ?? new Error("PNG read failed"));
    reader.readAsDataURL(file);
  });
}

async function preloadAndDecode(src: string): Promise<void> {
  await loadOverlayImage(src);
}
