# Frontend (React + Vite + TypeScript)

## 요구사항
- Node.js 20+
- 백엔드(FastAPI) 실행 상태 (`http://localhost:8000` 기본)
- Yarn
- TailwindCSS (PostCSS)

## 환경 변수
`.env` 파일을 `frontend/`에 만들고 필요하면 변경하세요.

```env
VITE_API_BASE=http://localhost:8000
```

기본값도 `http://localhost:8000`로 동작하며, Vite dev proxy(`/api` -> `VITE_API_BASE`)가 설정되어 있습니다.

## 실행 방법
```bash
yarn install
yarn dev
```

## 문제 해결: `yarn` 명령이 인식되지 않을 때 (Windows PowerShell)
오류 예시:
```powershell
yarn: The term 'yarn' is not recognized ...
```

아래 순서로 실행하세요.
```powershell
npm install -g yarn
$env:Path += ";$env:APPDATA\npm"
Get-Command yarn
yarn -v
```

그 다음 다시 실행:
```powershell
yarn install
yarn dev
```

여전히 인식되지 않으면 `.cmd`를 직접 실행:
```powershell
& "$env:APPDATA\npm\yarn.cmd" install
& "$env:APPDATA\npm\yarn.cmd" dev
```

## 재현 절차 (upload -> render -> objects)
1. 백엔드를 실행하고 API가 `POST /api/v1/documents`, `GET /api/v1/documents/{id}/file`, `GET /api/v1/documents/{id}/objects`, `GET/PUT /api/v1/documents/{id}/objects/{obj_id}`를 응답하는지 확인합니다.
2. 프론트엔드에서 브라우저로 Vite 주소(예: `http://localhost:5173`)를 엽니다.
3. `Upload` 패널에서 PDF 파일을 선택하고 `Upload PDF`를 클릭합니다.
4. 업로드 성공 시 화면 상단에 `document_id`가 표시되고, `PdfViewer`가 `/api/v1/documents/{document_id}/file?ts=...` URL로 PDF를 렌더링합니다.
5. 왼쪽 `Objects` 패널에서 `Refresh`를 눌러 객체 목록을 가져옵니다.
6. 객체를 클릭하면 `Object Editor`가 `GET /api/v1/documents/{document_id}/objects/{obj_id}`로 RAW를 로드합니다.
7. RAW를 수정 후 `Save`를 누르면 `PUT /api/v1/documents/{document_id}/objects/{obj_id}`가 호출됩니다.
8. 필요 시 `PdfViewer`의 `Reload` 버튼으로 `ts`를 갱신해 뷰어 캐시를 무효화합니다.
