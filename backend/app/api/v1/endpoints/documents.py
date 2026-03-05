from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import FileResponse

from app.models.schemas import (
    DocumentCreateResponse,
    DocumentMetaResponse,
    SaveDocumentResponse,
)
from app.services.storage import StorageService, get_storage_service

router = APIRouter(prefix="/documents")


@router.post(
    "",
    response_model=DocumentCreateResponse,
    status_code=201,
    summary="PDF 문서 업로드",
    description="multipart/form-data로 PDF 파일을 업로드하고 문서 ID를 발급합니다.",
    response_description="업로드된 문서 기본 메타데이터",
)
async def create_document(
    file: UploadFile = File(...),
    storage: StorageService = Depends(get_storage_service),
) -> DocumentCreateResponse:
    file_bytes = await file.read()
    document_meta = storage.create_document(file.filename or "uploaded.pdf", file_bytes)
    return DocumentCreateResponse(
        document_id=document_meta.document_id,
        filename=document_meta.filename,
        size_bytes=document_meta.size_bytes,
    )


@router.get(
    "/{document_id}",
    response_model=DocumentMetaResponse,
    summary="문서 메타데이터 조회",
    description="문서 ID로 등록된 PDF의 메타데이터를 조회합니다.",
    response_description="문서 메타데이터",
)
def get_document(
    document_id: str,
    storage: StorageService = Depends(get_storage_service),
) -> DocumentMetaResponse:
    document_meta = storage.get_document(document_id)
    return DocumentMetaResponse.model_validate(document_meta)


@router.get(
    "/{document_id}/file",
    summary="문서 PDF 다운로드",
    description=(
        "뷰어에서 바로 로딩할 수 있는 PDF 바이너리를 반환합니다. "
        "edited.pdf가 있으면 edited.pdf를, 없으면 original.pdf를 반환합니다."
    ),
    response_description="PDF 바이너리 파일",
)
def get_document_file(
    document_id: str,
    storage: StorageService = Depends(get_storage_service),
) -> FileResponse:
    file_path = storage.get_viewer_file_path(document_id)
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=file_path.name,
    )


@router.post(
    "/{document_id}/save",
    response_model=SaveDocumentResponse,
    summary="문서 저장(스텁)",
    description=(
        "현재는 실제 PDF 재작성 대신 original.pdf를 edited.pdf로 복사하여 "
        "저장 결과 URL을 반환합니다."
    ),
    response_description="저장 결과 정보",
)
def save_document(
    document_id: str,
    storage: StorageService = Depends(get_storage_service),
) -> SaveDocumentResponse:
    edited_path = storage.save_document(document_id)
    return SaveDocumentResponse(
        document_id=document_id,
        saved_file_url=f"/api/v1/documents/{document_id}/file",
        edited_filename=edited_path.name,
    )
