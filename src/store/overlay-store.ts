"use client";

import { create } from "zustand";
import {
  DEFAULT_OVERLAY_SRC,
  DEFAULT_OVERLAY_TRANSFORM,
  type OverlayState,
  type OverlayTransform,
} from "@/types/overlay";

interface OverlayActions {
  setImageSrc: (src: string) => void;
  updateTransform: (patch: Partial<OverlayTransform>) => void;
  reset: () => void;
  toggleVisibility: () => void;
  deleteOverlay: () => void;
}

export type OverlayStore = OverlayState & OverlayActions;

export const useOverlayStore = create<OverlayStore>((set) => ({
  imageSrc: DEFAULT_OVERLAY_SRC,
  ...DEFAULT_OVERLAY_TRANSFORM,
  visible: true,

  setImageSrc: (imageSrc) =>
    set({
      imageSrc,
      visible: true,
      ...DEFAULT_OVERLAY_TRANSFORM,
    }),

  updateTransform: (patch) => set(patch),

  reset: () =>
    set({
      ...DEFAULT_OVERLAY_TRANSFORM,
      visible: true,
    }),

  toggleVisibility: () => set((state) => ({ visible: !state.visible })),

  // A deleted demo stays deleted until reset/reload or a new PNG is uploaded.
  deleteOverlay: () =>
    set({
      imageSrc: null,
      visible: false,
      ...DEFAULT_OVERLAY_TRANSFORM,
    }),
}));
