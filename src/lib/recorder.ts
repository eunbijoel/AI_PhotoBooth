/**
 * MediaRecorder helpers for recording the webcam session
 * from first countdown until the final photo.
 */

export interface SessionRecorder {
  start: () => boolean;
  stop: () => Promise<Blob | null>;
  isRecording: () => boolean;
}

function pickMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

/** Create a session recorder bound to an existing MediaStream. */
export function createSessionRecorder(stream: MediaStream): SessionRecorder {
  let recorder: MediaRecorder | null = null;
  let chunks: BlobPart[] = [];
  let recording = false;

  return {
    start() {
      if (!stream || recording || typeof MediaRecorder === "undefined") return false;
      const mimeType = pickMimeType();
      try {
        recorder = mimeType
          ? new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000 })
          : new MediaRecorder(stream);
      } catch {
        try {
          recorder = new MediaRecorder(stream);
        } catch {
          recorder = null;
          return false;
        }
      }
      chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      try {
        recorder.start(250);
        recording = true;
      } catch {
        recorder = null;
        recording = false;
      }
      return recording;
    },
    stop() {
      return new Promise((resolve) => {
        if (!recorder || !recording) {
          resolve(null);
          return;
        }
        recorder.onstop = () => {
          recording = false;
          const type = recorder?.mimeType || "video/webm";
          const blob = new Blob(chunks, { type });
          resolve(blob.size > 0 ? blob : null);
        };
        recorder.onerror = () => {
          recording = false;
          resolve(null);
        };
        try {
          recorder.requestData();
          recorder.stop();
        } catch {
          recording = false;
          resolve(null);
        }
      });
    },
    isRecording() {
      return recording;
    },
  };
}
