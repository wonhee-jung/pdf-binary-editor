from fastapi import APIRouter

router = APIRouter(prefix="/documents/{document_id}/content")


@router.get(
    "/status",
    summary="콘텐츠 스트림 상태(스텁)",
    description="콘텐츠 스트림 관련 기능의 현재 구현 상태를 반환합니다.",
    response_description="콘텐츠 스트림 기능 상태",
)
def get_content_status(document_id: str) -> dict[str, str]:
    return {
        "document_id": document_id,
        "status": "content stream operations are placeholders",
    }
