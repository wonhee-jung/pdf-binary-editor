from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    status: str = Field(description="서버 상태 값", examples=["ok"])


class DocumentMeta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    document_id: str = Field(description="문서 고유 ID(UUID)")
    filename: str = Field(description="원본 업로드 파일명")
    size_bytes: int = Field(description="파일 크기(바이트)")
    created_at: datetime = Field(description="문서 생성 시각(UTC)")


class DocumentCreateResponse(BaseModel):
    document_id: str = Field(description="업로드 완료된 문서 ID(UUID)")
    filename: str = Field(description="저장된 원본 파일명")
    size_bytes: int = Field(description="저장된 파일 크기(바이트)")


class DocumentMetaResponse(DocumentMeta):
    pass


class SaveDocumentResponse(BaseModel):
    document_id: str = Field(description="저장 요청 대상 문서 ID")
    saved_file_url: str = Field(description="저장 결과 PDF 다운로드 URL")
    edited_filename: str = Field(description="저장된 편집본 파일명")


class ObjectListItem(BaseModel):
    obj_id: str = Field(description="PDF 오브젝트 ID 예: '1 0'")
    kind: str = Field(description="오브젝트 유형(스텁)")


class ObjectListResponse(BaseModel):
    document_id: str = Field(description="문서 ID")
    objects: list[ObjectListItem] = Field(description="오브젝트 목록")


class ObjectRawResponse(BaseModel):
    document_id: str = Field(description="문서 ID")
    obj_id: str = Field(description="조회 대상 오브젝트 ID")
    raw_object: str = Field(description="오브젝트 raw 문자열")


class ObjectUpdateRequest(BaseModel):
    raw_object: str = Field(description="저장할 오브젝트 raw 문자열")


class ObjectUpdateResponse(BaseModel):
    document_id: str = Field(description="문서 ID")
    obj_id: str = Field(description="업데이트 대상 오브젝트 ID")
    stored: bool = Field(description="저장 성공 여부")


class StreamDecodeRequest(BaseModel):
    obj_id: str = Field(description="디코드할 스트림 오브젝트 ID")


class StreamDecodeResponse(BaseModel):
    document_id: str = Field(description="문서 ID")
    obj_id: str = Field(description="요청한 오브젝트 ID")
    decoded: str = Field(description="디코드 결과 문자열(스텁)")
    note: str = Field(description="추가 안내 메시지")


class ErrorResponse(BaseModel):
    detail: str = Field(description="에러 메시지")
    request_id: str | None = Field(default=None, description="요청 추적 ID")
