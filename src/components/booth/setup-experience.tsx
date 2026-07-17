"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CaptureModePicker, FilterPicker, FrameLayoutGallery } from "@/components/booth/controls";
import { BoothBackdrop, TopBar } from "@/components/shared/chrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBoothStore } from "@/store/booth-store";

export function SetupExperience() {
  const router = useRouter();
  const resetSession = useBoothStore((s) => s.resetSession);

  const start = () => {
    // Clears photos / retakes only — keeps layout, capture mode, and filter
    resetSession();
    router.push("/booth");
  };

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#050505] text-white">
      <BoothBackdrop />
      <TopBar />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-24 md:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-white/40">Step 02</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">촬영 준비</h1>
          <p className="mt-3 text-white/55">
            프레임 형태와 촬영 방식, 필터를 먼저 고른 뒤 촬영을 시작합니다. 카메라 화면 비율은 선택한
            프레임 슬롯에 맞춰집니다.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardContent className="space-y-8 p-6 md:p-8">
              <FrameLayoutGallery />
              <CaptureModePicker />
              <FilterPicker />
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="secondary" size="lg">
              <Link href="/">뒤로</Link>
            </Button>
            <Button size="lg" onClick={start}>
              촬영 시작
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
