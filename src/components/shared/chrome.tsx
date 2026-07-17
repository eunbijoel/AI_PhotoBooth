"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GalleryVerticalEnd, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBoothStore } from "@/store/booth-store";
import { cn } from "@/lib/utils";

export function TopBar({ className }: { className?: string }) {
  const { muted, toggleMuted, theme, toggleTheme } = useBoothStore();

  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 md:px-8",
        className,
      )}
    >
      <Link
        href="/"
        className="pointer-events-auto text-sm font-semibold tracking-[0.28em] text-white/90"
        aria-label="나만의 AI 포토부스 홈"
      >
        나만의 AI 포토부스
      </Link>

      <div className="pointer-events-auto flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" aria-label="갤러리">
          <Link href="/gallery">
            <GalleryVerticalEnd className="h-5 w-5" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMuted}
          aria-label={muted ? "소리 켜기" : "소리 끄기"}
          aria-pressed={muted}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "라이트 모드" : "다크 모드"}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}

export function AnimatedLogo({ size = "lg" }: { size?: "sm" | "lg" }) {
  return (
    <motion.div
      className="relative inline-flex flex-col items-center"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.span
        className={cn(
          "font-semibold tracking-[-0.08em] text-white",
          size === "lg" ? "text-5xl md:text-8xl" : "text-2xl",
        )}
        animate={{
          textShadow: [
            "0 0 18px rgba(255,255,255,0.08)",
            "0 0 34px rgba(255,255,255,0.16)",
            "0 0 18px rgba(255,255,255,0.08)",
          ],
        }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        나만의 AI 포토부스
      </motion.span>
      <motion.span
        className="mt-3 text-sm tracking-[0.35em] text-white/45 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        PERSONAL AI STUDIO
      </motion.span>
    </motion.div>
  );
}

export function BoothBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.09),_transparent_52%),radial-gradient(ellipse_at_bottom,_rgba(128,128,128,0.12),_transparent_50%)]" />
      <motion.div
        className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-white/8 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-zinc-500/12 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, 25, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:56px_56px]" />
    </div>
  );
}
