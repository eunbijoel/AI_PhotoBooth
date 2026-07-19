# 📸 나만의 AI 포토부스

브라우저에서 동작하는 셀프 포토부스 프로젝트입니다.  

사용자 웹캠으로 사진을 촬영하고, 다양한 프레임과 필터를 적용하여 나만의 4컷 사진을 만들 수 있습니다.


> **개인정보:** 사진·영상·세션 데이터는 **서버로 업로드되지 않습니다.**  
> 처리와 임시 저장은 전부 **사용자 브라우저(클라이언트)** 에서만 이뤄집니다.


---

## 실행

```bash
npm install
npm run dev
```

```
http://localhost:3000
```

카메라 권한은 `localhost` 또는 HTTPS에서만 허용됩니다.

### 오버레이 Debug Mode

`.env.local`에 아래 값을 추가하고 개발 서버를 다시 시작합니다.

```bash
NEXT_PUBLIC_OVERLAY_DEBUG=true
```

촬영 화면과 캡처 결과에 오버레이 중심점, 경계 상자, 정규화 좌표와 Canvas 좌표가 표시되며
개발자 콘솔에 `[overlay:canvas]` 로그가 출력됩니다. 라이브 미리보기와 캡처는 같은 Canvas
렌더러를 사용합니다.

---

## 페이지 흐름

| Step | 역할 |
|------|------|
| 1 | 랜딩 |
| 2 | 프레임 형태 · 촬영 방식 · 필터 |
| 3 | 본 촬영 (8컷) / 다시찍기 |
| 4 | 후보 선택·해제 · 재촬영(최대 2) · **전체 사진 ZIP 다운로드** |
| 5 | 테마 · 캡션 · 최종 합성 |
| 6 | PNG/JPEG/ZIP · 세션 영상 |
| - | 브라우저 localStorage 갤러리 |

촬영 방식:
- **버튼 촬영:** 누르면 3초 카운트다운
- **10초 자동:** 자동 10초 타이머

---
## Privacy & Storage

| 항목 | 동작 |
|------|------|
| 서버 업로드 | **없음** — API로 사진을 보내지 않음 |
| 처리 위치 | 브라우저(Canvas, MediaRecorder, JSZip) |
| 갤러리 | `localStorage` 키 `ai-photo-booth-gallery-v2` (용량 제한으로 오래된/큰 영상은 생략될 수 있음) |
| 테마/뮤트 | `localStorage`에 UI 설정만 저장 |
| 세션 종료 | `resetSession()` 또는 탭 종료 시 메모리 해제; 갤러리는 사용자가 삭제하기 전까지 유지 |

이 앱은 계정/백엔드/클라우드 스토리지를 사용하지 않습니다.  
브라우저 개발자 도구로 localStorage를 지우면 갤러리도 함께 삭제됩니다.

---
## 기술 스택

- **프레임워크:** Next.js 15 (App Router), React 19
- **언어:** TypeScript (`strict` 모드)
- **스타일링/애니메이션:** Tailwind CSS 4, Framer Motion
- **카메라/캡처:** react-webcam, html2canvas, MediaRecorder API
- **상태 관리:** Zustand
- **다운로드/유틸:** JSZip, file-saver, qrcode, canvas-confetti

---
## 브라우저 호환성

| 기능 | Chrome (Mac) | Safari (Mac) |
|------|--------------|--------------|
| 웹캠 접근 (`getUserMedia`) | ✅ 지원 | ✅ 지원 |
| 세션 영상 녹화 (`MediaRecorder`) | ✅ 지원 (주로 WebM) | ✅ 지원 (브라우저별 MIME 타입 상이) |
| 얼굴 감지 (`FaceDetector`) | ✅ 지원 | ❌ 미지원 시 관련 기능만 비활성화 |
| 임시 갤러리 (`localStorage`) | ✅ 지원 | ✅ 지원 |
| ZIP 다운로드 | ✅ 지원 | ✅ 지원 |

권장: 최신 Chrome 또는 Safari.
---
Interactive 기능 tbc..