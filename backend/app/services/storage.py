import json
import shutil
import uuid
from datetime import UTC, datetime
from pathlib import Path

from fastapi import HTTPException

from app.core.config import get_settings
from app.models.schemas import DocumentMeta


class StorageService:
    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir
        self.index_path = self.data_dir / "index.json"
        self._ensure_initialized()

    def _ensure_initialized(self) -> None:
        self.data_dir.mkdir(parents=True, exist_ok=True)
        if not self.index_path.exists():
            self._write_index({"documents": {}})

    def _read_index(self) -> dict:
        try:
            return json.loads(self.index_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=500, detail="Corrupted document index") from exc

    def _write_index(self, data: dict) -> None:
        self.index_path.write_text(json.dumps(data, indent=2), encoding="utf-8")

    def _document_dir(self, document_id: str) -> Path:
        return self.data_dir / document_id

    def create_document(self, filename: str, file_bytes: bytes) -> DocumentMeta:
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Empty upload is not allowed")

        document_id = str(uuid.uuid4())
        document_dir = self._document_dir(document_id)
        document_dir.mkdir(parents=True, exist_ok=False)

        original_path = document_dir / "original.pdf"
        original_path.write_bytes(file_bytes)

        meta = DocumentMeta(
            document_id=document_id,
            filename=filename,
            size_bytes=len(file_bytes),
            created_at=datetime.now(UTC),
        )

        index = self._read_index()
        index["documents"][document_id] = meta.model_dump(mode="json")
        self._write_index(index)
        return meta

    def ensure_document_exists(self, document_id: str) -> None:
        self.get_document(document_id)

    def get_document(self, document_id: str) -> DocumentMeta:
        index = self._read_index()
        raw_meta = index.get("documents", {}).get(document_id)
        if not raw_meta:
            raise HTTPException(status_code=404, detail="Document not found")
        return DocumentMeta.model_validate(raw_meta)

    def get_original_file_path(self, document_id: str) -> Path:
        self.ensure_document_exists(document_id)
        path = self._document_dir(document_id) / "original.pdf"
        if not path.exists():
            raise HTTPException(status_code=404, detail="Original PDF not found")
        return path

    def get_edited_file_path(self, document_id: str) -> Path:
        self.ensure_document_exists(document_id)
        return self._document_dir(document_id) / "edited.pdf"

    def get_viewer_file_path(self, document_id: str) -> Path:
        edited = self.get_edited_file_path(document_id)
        if edited.exists():
            return edited
        return self.get_original_file_path(document_id)

    def save_object_update(self, document_id: str, obj_id: str, raw_object: str) -> None:
        self.ensure_document_exists(document_id)
        session_path = self._document_dir(document_id) / "session.json"

        if session_path.exists():
            session = json.loads(session_path.read_text(encoding="utf-8"))
        else:
            session = {"object_updates": {}}

        session.setdefault("object_updates", {})[obj_id] = raw_object
        session_path.write_text(json.dumps(session, indent=2), encoding="utf-8")

    def save_document(self, document_id: str) -> Path:
        original = self.get_original_file_path(document_id)
        edited = self.get_edited_file_path(document_id)
        shutil.copy2(original, edited)
        return edited


def get_storage_service() -> StorageService:
    settings = get_settings()
    return StorageService(settings.data_dir)
