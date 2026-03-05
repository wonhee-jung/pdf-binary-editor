from fastapi import APIRouter, Depends

from app.models.schemas import StreamDecodeRequest, StreamDecodeResponse
from app.services.pdf_facade import PdfFacade, get_pdf_facade
from app.services.storage import StorageService, get_storage_service

router = APIRouter(prefix="/documents/{document_id}/streams")


@router.post(
    "/decode",
    response_model=StreamDecodeResponse,
    summary="스트림 디코드(스텁)",
    description="오브젝트 ID를 받아 디코드 결과를 스텁 문자열로 반환합니다.",
    response_description="디코드 결과",
)
def decode_stream(
    document_id: str,
    payload: StreamDecodeRequest,
    storage: StorageService = Depends(get_storage_service),
    pdf_facade: PdfFacade = Depends(get_pdf_facade),
) -> StreamDecodeResponse:
    storage.ensure_document_exists(document_id)
    result = pdf_facade.decode_stream(document_id, payload.obj_id)
    return StreamDecodeResponse(
        document_id=document_id,
        obj_id=payload.obj_id,
        decoded=result["decoded"],
        note=result["note"],
    )
