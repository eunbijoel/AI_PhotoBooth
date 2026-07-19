# 📸 나만의 AI 포토부스

웹캠 촬영과 인터랙티브 PNG 오버레이를 결합한 브라우저 기반 셀프 포토부스입니다.
8장의 후보를 촬영하고 4장을 골라 프레임, 필터, 캡션이 포함된 최종 포토 스트립을 만들 수 있습니다.

> **Privacy First:** 사진, 영상, 업로드한 PNG는 서버로 전송되지 않습니다. 모든 처리는 사용자
> 브라우저의 Canvas, MediaRecorder, 메모리 및 localStorage 안에서만 수행됩니다.

## 주요 기능

- 프레임 슬롯과 동일한 비율의 반응형 웹캠 미리보기
- 3초 버튼 촬영 또는 10초 자동 촬영
- 8장 촬영 후 4장 선택, 최대 2장 재촬영
- Normal, Warm, Cool, B&W, Film, Hearts 등 실시간 필터
- 프레임 레이아웃, 흑백 테마, 캡션 적용
- PNG/JPEG/ZIP 및 세션 영상 다운로드
- 브라우저 localStorage 기반 임시 갤러리
- 카운트다운, 플래시, 셔터음, 음소거 및 모션 효과

## Interactive PNG Overlay

촬영 전에 투명 PNG 한 장을 카메라 위에 배치할 수 있습니다.

- 기본 `puppy.png` 데모, 사용자 PNG 업로드 또는 오버레이 없음 선택
- 드래그로 위치 이동
- 크기, 회전, 투명도 조절
- 숨기기/보이기, 초기화, 삭제
- 첫 촬영이 시작되면 위치와 설정을 불변 스냅샷으로 잠금
- 이후 8장 촬영과 재촬영에서 동일한 오버레이 상태 사용
- 합성된 사진이 선택 화면과 최종 스트립에 그대로 전달됨

라이브 미리보기와 사진 캡처는 모두 동일한 `renderOverlayToCanvas()` 렌더러와 정규화 좌표
`x`, `y`, `scale`, `rotation`을 사용합니다. DOM 위치를 다시 측정하거나 캡처 단계에서 임의의
offset을 적용하지 않습니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 웹캠 권한은 `localhost` 또는 HTTPS 환경에서만
허용됩니다.

## 사용자 흐름

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

- 카메라 viewport가 유일한 좌표계입니다.
- `x`, `y`는 viewport 기준 `0~1` 중심 좌표입니다.
- `scale`은 viewport 너비 대비 PNG 너비입니다.
- 웹캠의 `object-cover` crop도 공통 수학 함수로 계산합니다.
- 최종 스트립은 이미 합성된 사진을 다시 crop하지 않습니다.

주요 구현 파일:

- `src/components/overlay/OverlayPicker.tsx`
- `src/components/overlay/OverlayToolbar.tsx`
- `src/components/overlay/OverlayPreviewCanvas.tsx`
- `src/lib/overlay-renderer.ts`
- `src/hooks/use-capture-workflow.ts`
- `src/lib/strip.ts`
- `src/store/overlay-store.ts`

## Debug Mode

`.env.local`에 다음 값을 추가하고 개발 서버를 다시 시작합니다.

```bash
NEXT_PUBLIC_OVERLAY_DEBUG=true
```

미리보기와 캡처 이미지에 중심점, 경계 상자, 정규화 좌표 및 Canvas 좌표가 표시되고 개발자
콘솔에 `[overlay:canvas]` 로그가 출력됩니다.

## 다운로드와 영상

- PNG/JPEG: 완성된 포토 스트립
- 전체 후보 ZIP: 촬영한 8장
- 결과 ZIP: 선택 사진, 최종 스트립, 세션 영상
- Session Video: 첫 촬영부터 8번째 촬영까지의 웹캠 세션

재촬영 영상은 완성된 원본 세션 영상을 덮어쓰지 않습니다. MediaRecorder 결과는 브라우저에 따라
WebM 또는 MP4로 저장됩니다.

## Privacy & Storage

| 항목 | 동작 |
| --- | --- |
| 서버 업로드 | 없음 |
| 사진 및 PNG 합성 | 브라우저 Canvas |
| 영상 녹화 | 브라우저 MediaRecorder |
| 다운로드 생성 | 브라우저 JSZip 및 file-saver |
| 임시 갤러리 | `localStorage`의 `ai-photo-booth-gallery-v2` |
| UI 설정 | 테마와 음소거 설정만 `localStorage`에 저장 |

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

