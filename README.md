# 📸 나만의 AI 포토부스

웹캠 촬영과 인터랙티브 PNG 오버레이를 결합한 브라우저 기반 셀프 포토부스입니다.
8장의 후보를 촬영하고 4장을 골라 프레임, 필터, 캡션이 포함된 최종 포토 스트립을 만들 수 있습니다.

> **Privacy First:** 사진, 영상, 업로드한 PNG는 서버로 전송되지 않습니다.
> 
> 모든 처리는 사용자의 브라우저의 Canvas, MediaRecorder, 메모리 및 localStorage 안에서만 수행됩니다.

<img width="2048" height="1131" alt="image" src="https://github.com/user-attachments/assets/34c06ab9-b1af-42c7-ba44-38a1ce2e0400" />
<img width="1422" height="751" alt="스크린샷 2026-07-19 오후 10 41 17" src="https://github.com/user-attachments/assets/283a0e9f-51c1-44aa-a08c-bfe3c0744095" />

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 실행
웹캠 권한은 `localhost` 또는 HTTPS 환경에서만 허용됩니다.

## 페이지 흐름

| Step | 화면 | 기능 |
| --- | --- | --- |
| 01 | Landing | 포토부스 시작 |
| 02 | Setup | 레이아웃, 촬영 방식, 필터, PNG 오버레이 선택 |
| 03 | Booth | 오버레이 편집 및 8장 촬영 |
| 04 | Select | 4장 선택, 최대 2장 재촬영, 전체 후보 ZIP |
| 05 | Finalize | 프레임 테마와 캡션 확정 |
| 06 | Result | PNG, JPEG, ZIP, 세션 영상 다운로드 |
| - | Gallery | 브라우저에 저장된 이전 스트립 확인 및 삭제 |

## 오버레이 렌더링 구조

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

| 항목 | 동작 |
| --- | --- |
| 서버 업로드 | 없음 |
| 사진 및 PNG 합성 | 브라우저 Canvas |
| 영상 녹화 | 브라우저 MediaRecorder |
| 다운로드 생성 | 브라우저 JSZip 및 file-saver |
| 임시 갤러리 | `localStorage`의 `ai-photo-booth-gallery-v2` |

localStorage에는 브라우저 용량 제한이 있습니다. 큰 세션 영상은 갤러리에 유지되지 않을 수 있으므로
결과 화면에서 Session Video 또는 ZIP으로 직접 다운로드하는 것을 권장합니다.

## 기술 스택

- Next.js 15 App Router, React 19
- TypeScript strict mode
- Tailwind CSS 4, shadcn/ui, Framer Motion
- Zustand
- react-webcam, Canvas API, MediaRecorder API
- JSZip, file-saver, qrcode, canvas-confetti

## 브라우저 호환성

| 기능 | Chrome (Mac) | Safari (Mac) |
| --- | --- | --- |
| 웹캠 접근 | 지원 | 지원 |
| Canvas PNG 합성 | 지원 | 지원 |
| MediaRecorder | 주로 WebM | 브라우저 지원 형식 사용 |
| ZIP 다운로드 | 지원 | 지원 |
| FaceDetector 보조 기능 | 지원 환경에서 활성화 | 미지원 시 자동 비활성화 |

최신 Chrome 또는 Safari 사용을 권장합니다.
