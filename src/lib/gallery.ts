import type { SessionRecord } from "@/types";
import { GALLERY_STORAGE_KEY } from "@/lib/constants";

const MAX_SESSIONS = 12;

/** Load gallery sessions from localStorage. */
export function loadGallery(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SessionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Persist a completed session; keeps the newest MAX_SESSIONS entries. */
export function saveSession(session: SessionRecord): SessionRecord[] {
  const current = loadGallery();
  const next = [session, ...current].slice(0, MAX_SESSIONS);
  try {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage quota — drop oldest video payloads and retry
    const slim = next.map((s, i) =>
      i > 2 ? { ...s, videoDataUrl: undefined, photos: s.photos.slice(0, 1) } : s,
    );
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(slim));
      return slim;
    } catch {
      return current;
    }
  }
  return next;
}

export function deleteSession(id: string): SessionRecord[] {
  const next = loadGallery().filter((s) => s.id !== id);
  localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearGallery() {
  localStorage.removeItem(GALLERY_STORAGE_KEY);
}
