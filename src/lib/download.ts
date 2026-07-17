import JSZip from "jszip";
import QRCode from "qrcode";
import { saveAs } from "file-saver";
import type { CapturedPhoto } from "@/types";
import { dataUrlToBlob, downloadBlob } from "@/lib/utils";
import { pngToJpeg } from "@/lib/strip";

export async function downloadPng(stripDataUrl: string, name = "my-ai-photo-booth.png") {
  const blob = await dataUrlToBlob(stripDataUrl);
  downloadBlob(blob, name);
}

export async function downloadJpeg(stripDataUrl: string, name = "my-ai-photo-booth.jpg") {
  const blob = await pngToJpeg(stripDataUrl);
  downloadBlob(blob, name);
}

export async function downloadVideo(blob: Blob, name = "my-ai-photo-booth-session.webm") {
  const ext = blob.type.includes("mp4") ? "mp4" : "webm";
  const filename = name.replace(/\.(webm|mp4)$/, `.${ext}`);
  downloadBlob(blob, filename);
}

export interface ZipPayload {
  photos: CapturedPhoto[];
  stripDataUrl: string;
  videoBlob?: Blob | null;
  caption?: string;
}

/** Build a ZIP with individual shots, final strip, and optional session video. */
export async function downloadZip(payload: ZipPayload, name = "my-ai-photo-booth.zip") {
  const zip = new JSZip();
  const folder = zip.folder("my-ai-photo-booth");
  if (!folder) throw new Error("ZIP create failed");

  payload.photos.forEach((photo, i) => {
    const base64 = photo.dataUrl.split(",")[1];
    folder.file(`photo-${i + 1}.jpg`, base64, { base64: true });
  });

  const stripBase64 = payload.stripDataUrl.split(",")[1];
  folder.file("strip.png", stripBase64, { base64: true });

  if (payload.videoBlob) {
    const ext = payload.videoBlob.type.includes("mp4") ? "mp4" : "webm";
    folder.file(`session.${ext}`, payload.videoBlob);
  }

  if (payload.caption) {
    folder.file("caption.txt", payload.caption);
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, name);
}

/** Build a ZIP containing every candidate photo from the select step. */
export async function downloadAllPhotosZip(
  photos: CapturedPhoto[],
  name = "my-ai-photo-booth-all-photos.zip",
) {
  const zip = new JSZip();
  const folder = zip.folder("all-photos");
  if (!folder) throw new Error("ZIP create failed");

  photos.forEach((photo, i) => {
    const base64 = photo.dataUrl.split(",")[1];
    const ext = photo.dataUrl.startsWith("data:image/png") ? "png" : "jpg";
    folder.file(`photo-${String(i + 1).padStart(2, "0")}.${ext}`, base64, { base64: true });
  });

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, name);
}

/** Generate a QR code data URL for sharing session metadata. */
export async function generateQrDataUrl(content: string): Promise<string> {
  const max = 800;
  const payload =
    content.length > max
      ? `나만의 AI 포토부스 · Session ready · ${new Date().toISOString()}`
      : content;
  return QRCode.toDataURL(payload, {
    width: 280,
    margin: 2,
    color: { dark: "#1a1a1a", light: "#ffffff" },
  });
}
