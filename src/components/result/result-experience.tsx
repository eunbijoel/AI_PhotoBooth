"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Download, Film, Archive, RefreshCw, QrCode } from "lucide-react";
import { useBoothStore } from "@/store/booth-store";
import { downloadJpeg, downloadPng, downloadVideo, downloadZip, generateQrDataUrl } from "@/lib/download";
import { saveSession } from "@/lib/gallery";
import { blobToDataUrl, uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BoothBackdrop, TopBar } from "@/components/shared/chrome";
import { getFrame } from "@/lib/constants";

export function ResultExperience() {
  const {
    photos,
    selectedPhotoIds,
    stripDataUrl,
    videoBlob,
    frame,
    frameLayout,
    filter,
    caption,
    resetSession,
  } = useBoothStore();
  const [qr, setQr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const style = getFrame(frame);
  const selectedPhotos = useMemo(
    () =>
      selectedPhotoIds
        .map((id) => photos.find((photo) => photo.id === id))
        .filter((photo): photo is (typeof photos)[number] => Boolean(photo)),
    [photos, selectedPhotoIds],
  );

  const videoUrl = useMemo(() => (videoBlob ? URL.createObjectURL(videoBlob) : null), [videoBlob]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.55 },
      colors: ["#ffffff", "#d4d4d4", "#737373", "#111111"],
    });
  }, []);

  useEffect(() => {
    if (!stripDataUrl || saved) return;
    void (async () => {
      let videoDataUrl: string | undefined;
      if (videoBlob && videoBlob.size < 4_000_000) {
        try {
          videoDataUrl = await blobToDataUrl(videoBlob);
        } catch {
          videoDataUrl = undefined;
        }
      }
      saveSession({
        id: uid("session"),
        createdAt: Date.now(),
        stripDataUrl,
        photos: selectedPhotos.map((p) => p.dataUrl),
        frame,
        frameLayout,
        filter,
        caption,
        videoDataUrl,
      });
      setSaved(true);
    })();
  }, [stripDataUrl, saved, selectedPhotos, frame, frameLayout, filter, caption, videoBlob]);

  useEffect(() => {
    void generateQrDataUrl(`나만의 AI 포토부스 · ${new Date().toLocaleString("ko-KR")}`).then(setQr);
  }, []);

  if (!stripDataUrl) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center bg-[#050505] text-white">
        <BoothBackdrop />
        <TopBar />
        <Card className="relative z-10 max-w-md">
          <CardContent className="space-y-4 p-8 text-center">
            <p>아직 완성된 스트립이 없습니다.</p>
            <Button asChild>
              <Link href="/setup">촬영 준비로</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#050505] text-white">
      <BoothBackdrop />
      <TopBar />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 pb-20 pt-24 md:grid-cols-[minmax(0,320px)_1fr] md:px-8">
        <motion.div
          className="relative mx-auto w-full max-w-[320px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            id="result-strip-node"
            className="relative overflow-hidden rounded-[1.75rem] p-2 shadow-2xl"
            style={{ background: style.background }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stripDataUrl} alt="완성된 AI 포토부스 프레임" className="w-full rounded-[1.25rem]" />
          </div>
        </motion.div>

        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl">완성!</h1>
            <p className="mt-2 text-white/60">선택한 4장으로 만든 프레임을 다운로드하거나 다시 촬영하세요.</p>
          </motion.div>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">Downloads</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={() => void downloadPng(stripDataUrl)} aria-label="PNG 다운로드">
                <Download className="h-4 w-4" />
                PNG
              </Button>
              <Button variant="secondary" onClick={() => void downloadJpeg(stripDataUrl)}>
                <Download className="h-4 w-4" />
                JPEG
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  void downloadZip({
                    photos: selectedPhotos,
                    stripDataUrl,
                    videoBlob,
                    caption,
                  })
                }
              >
                <Archive className="h-4 w-4" />
                ZIP
              </Button>
              <Button
                variant="outline"
                disabled={!videoBlob}
                onClick={() => videoBlob && void downloadVideo(videoBlob)}
              >
                <Film className="h-4 w-4" />
                Session Video
              </Button>
              <Button asChild variant="soft">
                <Link href="/setup" onClick={() => resetSession()}>
                  <RefreshCw className="h-4 w-4" />
                  Start Again
                </Link>
              </Button>
            </CardContent>
          </Card>

          {videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Session Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <video src={videoUrl} controls className="w-full rounded-2xl" />
              </CardContent>
            </Card>
          )}

          {qr && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <QrCode className="h-4 w-4" />
                  Session QR
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="세션 QR 코드" className="h-32 w-32 rounded-xl bg-white p-2" />
                <p className="text-sm text-white/55">
                  세션 메타데이터 QR입니다. 갤러리에서도 이전 촬영을 확인할 수 있어요.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
