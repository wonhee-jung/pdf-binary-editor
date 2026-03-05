# Backend - PDF Binary Editor

FastAPI 기반의 초기 백엔드 스캐폴딩입니다.
현재는 PDF 편집 엔진(`pdf_facade`)이 스텁이며, API 골격/파일 저장소/세션 저장/에러 처리/테스트 기반을 제공합니다.

## 1) 프로젝트 구조

```text
backend/
  app/
    main.py
    api/
      v1/
        router.py
        endpoints/
          health.py
          documents.py
          objects.py
          streams.py
          content.py
          tounicode.py
    core/
      config.py
      logging.py
    services/
      storage.py
      pdf_facade.py
    models/
      schemas.py
    utils/
      errors.py
  tests/
    test_health_and_documents.py
  pyproject.toml
  README.md
```

## 2) 사전 준비 및 실행

### Python 3.12 가상환경 생성

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
source .venv/bin/activate
```

### 의존성 설치

```bash
pip install -e .[dev]
```

### 데이터 디렉터리 생성(선택)

앱 시작 시 자동 생성되지만, 사전 생성하려면:

```bash
mkdir -p .data
```

### 서버 실행

```bash
uvicorn app.main:app --reload --port 8000
```

## 2-1) Docker 실행

리포 루트(`repo-root/`)에서 실행:

```bash
docker compose up --build
```

백엔드만 백그라운드 실행:

```bash
docker compose up -d --build backend
```

중지:

```bash
docker compose down
```

## 3) 데이터 디렉터리

앱 시작 시 기본 경로에 자동 생성됩니다.

- 기본: `backend/.data/`
- 문서 원본: `backend/.data/{document_id}/original.pdf`
- 편집본: `backend/.data/{document_id}/edited.pdf`
- 레지스트리: `backend/.data/index.json`
- 세션(객체 업데이트): `backend/.data/{document_id}/session.json`

필요 시 환경 변수로 변경 가능:

```bash
APP_DATA_DIR=./.data
```

## 4) 환경 변수

- `APP_APP_ENV` (기본 `development`)
- `APP_API_V1_PREFIX` (기본 `/api/v1`)
- `APP_DATA_DIR` (기본 `backend/.data`)
- `APP_CORS_ENABLED` (기본 `true`)
- `APP_CORS_ALLOW_ORIGINS` (기본 localhost 개발 포트들)
- `APP_CORS_ALLOW_CREDENTIALS` (기본 `true`)

CORS는 로컬 개발 환경(`APP_APP_ENV=development/local/dev`)에서만 활성화됩니다.

## 5) API 예시(curl)

### Health

```bash
curl -X GET http://127.0.0.1:8000/api/v1/health
```

### 문서 업로드

```bash
curl -X POST http://127.0.0.1:8000/api/v1/documents \
  -F "file=@./sample.pdf"
```

### 문서 메타 조회

```bash
curl -X GET http://127.0.0.1:8000/api/v1/documents/{document_id}
```

### Viewer용 PDF 다운로드

```bash
curl -X GET http://127.0.0.1:8000/api/v1/documents/{document_id}/file -o out.pdf
```

### 객체 목록(스텁)

```bash
curl -X GET http://127.0.0.1:8000/api/v1/documents/{document_id}/objects
```

### 객체 조회(스텁)

```bash
curl -X GET http://127.0.0.1:8000/api/v1/documents/{document_id}/objects/1%200
```

### 객체 업데이트 저장(스텁)

```bash
curl -X PUT http://127.0.0.1:8000/api/v1/documents/{document_id}/objects/1%200 \
  -H "Content-Type: application/json" \
  -d '{"raw_object":"1 0 obj\n<< /Type /Catalog >>\nendobj"}'
```

### 스트림 디코드(스텁)

```bash
curl -X POST http://127.0.0.1:8000/api/v1/documents/{document_id}/streams/decode \
  -H "Content-Type: application/json" \
  -d '{"obj_id":"4 0"}'
```

### 저장(현재는 original.pdf -> edited.pdf 복사)

```bash
curl -X POST http://127.0.0.1:8000/api/v1/documents/{document_id}/save
```

## 6) 테스트 실행

```bash
pytest -q
```

## 7) 린트 실행(ruff)

```bash
ruff check .
```
