from fastapi import APIRouter

from app.api.v1.endpoints import (
    content,
    documents,
    health,
    objects,
    streams,
    tounicode,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(documents.router, tags=["documents"])
api_router.include_router(objects.router, tags=["objects"])
api_router.include_router(streams.router, tags=["streams"])
api_router.include_router(content.router, tags=["content"])
api_router.include_router(tounicode.router, tags=["tounicode"])
