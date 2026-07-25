[한국어](README.md) | [English](README_EN.md)

# 📸 My AI Photo Booth

A browser-based self photo booth that combines webcam capture with interactive PNG overlays.
Shoot 8 candidates, pick 4, and build a final photo strip with frames, filters, and captions.

> **Privacy First:** Photos, video, and uploaded PNGs are never sent to a server.
> 
> All processing stays in the user's browser via Canvas, MediaRecorder, memory, and localStorage.

<img width="2048" height="1131" alt="image" src="https://github.com/user-attachments/assets/34c06ab9-b1af-42c7-ba44-38a1ce2e0400" />
<img width="1422" height="751" alt="스크린샷 2026-07-19 오후 10 41 17" src="https://github.com/user-attachments/assets/283a0e9f-51c1-44aa-a08c-bfe3c0744095" />

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in the browser.
Webcam permission is allowed only on `localhost` or HTTPS.

## Page flow

| Step | Screen | Features |
| --- | --- | --- |
| 01 | Landing | Start the photo booth |
| 02 | Setup | Choose layout, capture mode, filter, PNG overlay |
| 03 | Booth | Edit overlays and shoot 8 frames |
| 04 | Select | Pick 4, retake up to 2, ZIP all candidates |
| 05 | Finalize | Confirm frame theme and caption |
| 06 | Result | Download PNG, JPEG, ZIP, session video |
| - | Gallery | View and delete previously saved strips in the browser |

## Overlay rendering structure

```text
Zustand Overlay State
        ↓
Shared Overlay Renderer
        ↓
Live Preview Canvas
        ↓
Capture Canvas
        ↓
Composited JPEG
        ↓
Selection / Final Strip
```

## Privacy & Storage

| Item | Behavior |
| --- | --- |
| Server upload | None |
| Photo & PNG compositing | Browser Canvas |
| Video recording | Browser MediaRecorder |
| Download generation | Browser JSZip |
| Temporary gallery | `localStorage` key `ai-photo-booth-gallery-v2` |

localStorage has browser storage limits. Large session videos may not stay in the gallery,
so download Session Video or ZIP directly from the result screen.

## Tech stack

- Next.js 15 App Router, React 19
- TypeScript strict mode
- Tailwind CSS 4, shadcn/ui, Framer Motion
- Zustand
- react-webcam, Canvas API, MediaRecorder API
- JSZip, qrcode, canvas-confetti

## Browser compatibility

| Feature | Chrome (Mac) | Safari (Mac) |
| --- | --- | --- |
| Webcam access | Supported | Supported |
| Canvas PNG compositing | Supported | Supported |
| MediaRecorder | Mostly WebM | Uses browser-supported format |
| ZIP download | Supported | Supported |
| FaceDetector assist | Enabled when available | Auto-disabled when unsupported |

Latest Chrome or Safari is recommended.
