from fastapi import APIRouter

router = APIRouter(prefix="/documents/{document_id}/tounicode")


@router.get(
    "/status",
    summary="ToUnicode 상태(스텁)",
    description="ToUnicode 관련 기능의 현재 구현 상태를 반환합니다.",
    response_description="ToUnicode 기능 상태",
)
def get_tounicode_status(document_id: str) -> dict[str, str]:
    return {
        "document_id": document_id,
        "status": "ToUnicode operations are placeholders",
    }
