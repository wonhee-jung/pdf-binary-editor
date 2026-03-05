from fastapi import APIRouter, Depends

from app.models.schemas import (
    ObjectListItem,
    ObjectListResponse,
    ObjectRawResponse,
    ObjectUpdateRequest,
    ObjectUpdateResponse,
)
from app.services.pdf_facade import PdfFacade, get_pdf_facade
from app.services.storage import StorageService, get_storage_service

router = APIRouter(prefix="/documents/{document_id}/objects")


@router.get(
    "",
    response_model=ObjectListResponse,
    summary="오브젝트 목록 조회(스텁)",
    description="문서의 PDF 오브젝트 목록을 스텁 데이터로 반환합니다.",
    response_description="오브젝트 목록",
)
def list_objects(
    document_id: str,
    pdf_facade: PdfFacade = Depends(get_pdf_facade),
) -> ObjectListResponse:
    objects = [ObjectListItem.model_validate(item) for item in pdf_facade.list_objects(document_id)]
    return ObjectListResponse(document_id=document_id, objects=objects)


@router.get(
    "/{obj_id}",
    response_model=ObjectRawResponse,
    summary="오브젝트 원문 조회(스텁)",
    description="지정한 오브젝트 ID의 raw 문자열을 스텁 데이터로 반환합니다.",
    response_description="오브젝트 raw 문자열",
)
def get_object(
    document_id: str,
    obj_id: str,
    pdf_facade: PdfFacade = Depends(get_pdf_facade),
    storage: StorageService = Depends(get_storage_service),
) -> ObjectRawResponse:
    storage.ensure_document_exists(document_id)
    raw_object = pdf_facade.get_object_raw(document_id, obj_id)
    return ObjectRawResponse(document_id=document_id, obj_id=obj_id, raw_object=raw_object)


@router.put(
    "/{obj_id}",
    response_model=ObjectUpdateResponse,
    summary="오브젝트 원문 업데이트 저장(스텁)",
    description=(
        "raw_object 문자열을 session.json에 저장합니다. "
        "현재는 실제 PDF 본문에는 반영하지 않습니다."
    ),
    response_description="저장 결과",
)
def update_object(
    document_id: str,
    obj_id: str,
    payload: ObjectUpdateRequest,
    storage: StorageService = Depends(get_storage_service),
) -> ObjectUpdateResponse:
    storage.save_object_update(document_id, obj_id, payload.raw_object)
    return ObjectUpdateResponse(document_id=document_id, obj_id=obj_id, stored=True)
