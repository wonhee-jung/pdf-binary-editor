from fastapi import APIRouter

from app.models.schemas import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="헬스 체크",
    description="백엔드 서버가 정상 동작 중인지 확인합니다.",
    response_description="서버 상태",
)
def get_health() -> HealthResponse:
    return HealthResponse(status="ok")
