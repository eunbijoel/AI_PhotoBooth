"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Camera, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo, BoothBackdrop, TopBar } from "@/components/shared/chrome";

export function LandingPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#050505] px-6 text-white">
      <BoothBackdrop />
      <TopBar />

      <div className="relative z-10 flex flex-col items-center text-center">
        <AnimatedLogo size="lg" />

        <motion.p
          className="mt-8 max-w-md text-balance text-base text-white/65 md:text-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          8번의 순간 중 가장 마음에 드는 4장을 고르는
          <br />
          깔끔한 흑백 사진관 스타일 AI 포토부스.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button asChild size="lg" className="min-w-[180px]">
            <Link href="/setup">
              <Camera className="h-5 w-5" />
              Start
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/gallery">
              <Images className="h-5 w-5" />
              Gallery
            </Link>
          </Button>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-3 gap-6 text-center text-[11px] uppercase tracking-[0.2em] text-white/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div>
            <div className="mb-1 text-2xl text-white/90">8</div>
            Shots
          </div>
          <div>
            <div className="mb-1 text-2xl text-white/90">4</div>
            Picks
          </div>
          <div>
            <div className="mb-1 text-2xl text-white/90">AI</div>
            Studio
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-6 text-xs text-white/30">
        Works best on Chrome & Safari · Camera permission required
      </div>
    </main>
  );
}
