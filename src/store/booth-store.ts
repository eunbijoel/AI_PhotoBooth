"use client";

import { create } from "zustand";
import type {
  BoothPhase,
  CapturedPhoto,
  CaptureMode,
  FilterId,
  FrameLayoutId,
  FrameId,
  ThemeMode,
} from "@/types";
import { FINAL_PHOTO_COUNT, MAX_RETAKES, TOTAL_SHOTS } from "@/types";
import { MUTE_STORAGE_KEY, THEME_STORAGE_KEY } from "@/lib/constants";
import { uid } from "@/lib/utils";
import type { OverlayState } from "@/types/overlay";

interface BoothState {
  phase: BoothPhase;
  photos: CapturedPhoto[];
  currentShot: number;
  countdown: number;
  filter: FilterId;
  frame: FrameId;
  frameLayout: FrameLayoutId;
  captureMode: CaptureMode;
  caption: string;
  muted: boolean;
  theme: ThemeMode;
  stripDataUrl: string | null;
  videoBlob: Blob | null;
  autoSmile: boolean;
  poseGuide: boolean;
  backgroundBlur: boolean;
  flyingPhoto: string | null;
  selectedPhotoIds: string[];
  retakePhotoId: string | null;
  retakesUsed: number;
  /** Immutable overlay used by every capture in the current session. */
  lockedOverlay: OverlayState | null;

  setPhase: (phase: BoothPhase) => void;
  setCountdown: (n: number) => void;
  setFilter: (filter: FilterId) => void;
  setFrame: (frame: FrameId) => void;
  setFrameLayout: (layout: FrameLayoutId) => void;
  setCaptureMode: (mode: CaptureMode) => void;
  setCaption: (caption: string) => void;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  hydratePreferences: () => void;
  addPhoto: (dataUrl: string, filter: FilterId) => void;
  startRetake: (photoId: string) => boolean;
  clearRetake: () => void;
  togglePhotoSelected: (photoId: string) => void;
  resetSession: () => void;
  setStrip: (dataUrl: string | null) => void;
  setVideoBlob: (blob: Blob | null) => void;
  setAutoSmile: (v: boolean) => void;
  setPoseGuide: (v: boolean) => void;
  setBackgroundBlur: (v: boolean) => void;
  setFlyingPhoto: (url: string | null) => void;
  lockOverlay: (overlay: OverlayState) => void;
  isSessionFull: () => boolean;
  hasFinalSelection: () => boolean;
  canRetake: () => boolean;
}

export const useBoothStore = create<BoothState>()((set, get) => ({
  phase: "idle",
  photos: [],
  currentShot: 0,
  countdown: 0,
  filter: "normal",
  frame: "mono-white",
  frameLayout: "studio-grid",
  captureMode: "manual3",
  caption: "",
  // SSR and the first browser render must be identical. Persisted values are
  // loaded by ThemeBoot after hydration.
  muted: false,
  theme: "dark",
  stripDataUrl: null,
  videoBlob: null,
  autoSmile: false,
  poseGuide: true,
  backgroundBlur: false,
  flyingPhoto: null,
  selectedPhotoIds: [],
  retakePhotoId: null,
  retakesUsed: 0,
  lockedOverlay: null,

  setPhase: (phase) => set({ phase }),
  setCountdown: (countdown) => set({ countdown }),
  setFilter: (filter) => set({ filter }),
  setFrame: (frame) => set({ frame }),
  setFrameLayout: (frameLayout) => set({ frameLayout }),
  setCaptureMode: (captureMode) => set({ captureMode }),
  setCaption: (caption) => set({ caption }),
  setMuted: (muted) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(MUTE_STORAGE_KEY, muted ? "1" : "0");
    }
    set({ muted });
  },
  toggleMuted: () => get().setMuted(!get().muted),
  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      document.documentElement.classList.toggle("light", theme === "light");
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
  hydratePreferences: () => {
    if (typeof window === "undefined") return;
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    set({
      muted: localStorage.getItem(MUTE_STORAGE_KEY) === "1",
      theme: storedTheme === "light" ? "light" : "dark",
    });
  },

  addPhoto: (dataUrl, filter) => {
    const retakePhotoId = get().retakePhotoId;
    const photo: CapturedPhoto = {
      id: retakePhotoId ?? uid("photo"),
      dataUrl,
      capturedAt: Date.now(),
      filter,
    };

    let photos: CapturedPhoto[];
    let retakesUsed = get().retakesUsed;

    if (retakePhotoId) {
      photos = get().photos.map((p) => (p.id === retakePhotoId ? photo : p));
      retakesUsed += 1;
    } else {
      photos = [...get().photos, photo].slice(0, TOTAL_SHOTS);
    }

    // Keep selection if this id was already selected; never auto-select new shots.
    const selectedPhotoIds = get().selectedPhotoIds.includes(photo.id)
      ? get().selectedPhotoIds.map((id) => (id === retakePhotoId ? photo.id : id))
      : get().selectedPhotoIds;

    set({
      photos,
      currentShot: photos.length,
      flyingPhoto: dataUrl,
      selectedPhotoIds,
      retakePhotoId: null,
      retakesUsed,
    });
  },

  startRetake: (photoId) => {
    if (get().retakesUsed >= MAX_RETAKES) return false;
    if (!get().photos.some((p) => p.id === photoId)) return false;
    set({
      retakePhotoId: photoId,
      phase: "idle",
      stripDataUrl: null,
    });
    return true;
  },

  clearRetake: () => set({ retakePhotoId: null }),

  togglePhotoSelected: (photoId) => {
    const selected = get().selectedPhotoIds;
    if (selected.includes(photoId)) {
      set({ selectedPhotoIds: selected.filter((id) => id !== photoId) });
      return;
    }
    if (selected.length >= FINAL_PHOTO_COUNT) return;
    set({ selectedPhotoIds: [...selected, photoId] });
  },

  resetSession: () =>
    set({
      phase: "idle",
      photos: [],
      currentShot: 0,
      countdown: 0,
      caption: "",
      stripDataUrl: null,
      videoBlob: null,
      flyingPhoto: null,
      selectedPhotoIds: [],
      retakePhotoId: null,
      retakesUsed: 0,
      lockedOverlay: null,
    }),

  setStrip: (stripDataUrl) => set({ stripDataUrl }),
  setVideoBlob: (videoBlob) => set({ videoBlob }),
  setAutoSmile: (autoSmile) => set({ autoSmile }),
  setPoseGuide: (poseGuide) => set({ poseGuide }),
  setBackgroundBlur: (backgroundBlur) => set({ backgroundBlur }),
  setFlyingPhoto: (flyingPhoto) => set({ flyingPhoto }),
  lockOverlay: (overlay) => {
    if (get().lockedOverlay) return;
    set({ lockedOverlay: { ...overlay } });
  },
  isSessionFull: () => get().photos.length >= TOTAL_SHOTS,
  hasFinalSelection: () => get().selectedPhotoIds.length === FINAL_PHOTO_COUNT,
  canRetake: () => get().retakesUsed < MAX_RETAKES,
}));
