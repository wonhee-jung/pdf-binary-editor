import logging
import uuid

from fastapi import FastAPI, HTTPException, Request
from fastapi.exception_handlers import http_exception_handler
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.utils.errors import AppError

configure_logging()
logger = logging.getLogger(__name__)

openapi_tags = [
    {"name": "health", "description": "서버 상태 확인 API"},
    {"name": "documents", "description": "PDF 문서 업로드/조회/저장 API"},
    {"name": "objects", "description": "PDF 오브젝트 조회/수정(스텁) API"},
    {"name": "streams", "description": "PDF 스트림 디코드(스텁) API"},
    {"name": "content", "description": "콘텐츠 스트림 기능(향후 구현) API"},
    {"name": "tounicode", "description": "ToUnicode 기능(향후 구현) API"},
]

app = FastAPI(
    title="PDF Binary Editor API",
    description=(
        "저수준 PDF 편집기를 위한 백엔드 API입니다. "
        "현재 버전은 파일 저장소/세션/기본 스텁 API를 제공합니다."
    ),
    version="0.1.0",
    openapi_tags=openapi_tags,
)
settings = get_settings()


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    return response


if settings.cors_enabled and settings.is_local_dev:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.message,
            "request_id": getattr(request.state, "request_id", None),
            "details": exc.details,
        },
    )


@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    response = await http_exception_handler(request, exc)
    payload = {
        "detail": exc.detail,
        "request_id": getattr(request.state, "request_id", None),
    }
    response.body = JSONResponse(status_code=exc.status_code, content=payload).body
    response.headers["content-type"] = "application/json"
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.on_event("startup")
def on_startup() -> None:
    settings.data_dir.mkdir(parents=True, exist_ok=True)


app.include_router(api_router, prefix=settings.api_v1_prefix)
