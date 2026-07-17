"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useBoothStore } from "@/store/booth-store";

/** Full-screen white flash timed with shutter capture. */
export function FlashOverlay() {
  const phase = useBoothStore((s) => s.phase);

  return (
    <AnimatePresence>
      {phase === "flash" && (
        <motion.div
          key="flash"
          className="pointer-events-none fixed inset-0 z-50 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.85, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, times: [0, 0.15, 0.45, 1] }}
          aria-hidden
        />
      )}
    </AnimatePresence>
  );
}

export function CountdownOverlay() {
  const { phase, countdown } = useBoothStore();

  return (
    <AnimatePresence>
      {phase === "countdown" && countdown > 0 && (
        <motion.div
          key={countdown}
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          aria-live="assertive"
          aria-atomic="true"
        >
          <span className="font-[family-name:var(--font-display)] text-[8rem] leading-none text-white drop-shadow-[0_8px_40px_rgba(0,0,0,0.55)] md:text-[11rem]">
            {countdown}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
