from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import app


def _create_client(tmp_path, monkeypatch) -> TestClient:
    monkeypatch.setenv("APP_DATA_DIR", str(tmp_path / ".data"))
    get_settings.cache_clear()
    return TestClient(app)


def _upload_sample_pdf(client: TestClient) -> tuple[str, bytes]:
    pdf_bytes = b"%PDF-1.4\n%stub\n"
    upload_response = client.post(
        "/api/v1/documents",
        files={"file": ("sample.pdf", pdf_bytes, "application/pdf")},
    )
    assert upload_response.status_code == 201
    return upload_response.json()["document_id"], pdf_bytes


def test_health(tmp_path, monkeypatch) -> None:
    client = _create_client(tmp_path, monkeypatch)
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_document_upload_and_fetch(tmp_path, monkeypatch) -> None:
    client = _create_client(tmp_path, monkeypatch)
    document_id, pdf_bytes = _upload_sample_pdf(client)

    meta_response = client.get(f"/api/v1/documents/{document_id}")
    assert meta_response.status_code == 200
    assert meta_response.json()["filename"] == "sample.pdf"

    file_response = client.get(f"/api/v1/documents/{document_id}/file")
    assert file_response.status_code == 200
    assert file_response.content == pdf_bytes


def test_object_and_stream_stubs(tmp_path, monkeypatch) -> None:
    client = _create_client(tmp_path, monkeypatch)
    document_id, _ = _upload_sample_pdf(client)

    list_response = client.get(f"/api/v1/documents/{document_id}/objects")
    assert list_response.status_code == 200
    assert len(list_response.json()["objects"]) > 0

    get_object_response = client.get(f"/api/v1/documents/{document_id}/objects/1%200")
    assert get_object_response.status_code == 200
    assert "obj" in get_object_response.json()["raw_object"]

    update_response = client.put(
        f"/api/v1/documents/{document_id}/objects/1%200",
        json={"raw_object": "1 0 obj\n<< /Type /Catalog >>\nendobj"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["stored"] is True

    decode_response = client.post(
        f"/api/v1/documents/{document_id}/streams/decode",
        json={"obj_id": "4 0"},
    )
    assert decode_response.status_code == 200
    assert "placeholder" in decode_response.json()["decoded"].lower()


def test_save_creates_edited_file(tmp_path, monkeypatch) -> None:
    client = _create_client(tmp_path, monkeypatch)
    document_id, pdf_bytes = _upload_sample_pdf(client)

    save_response = client.post(f"/api/v1/documents/{document_id}/save")
    assert save_response.status_code == 200
    assert save_response.json()["saved_file_url"] == f"/api/v1/documents/{document_id}/file"

    viewer_file_response = client.get(f"/api/v1/documents/{document_id}/file")
    assert viewer_file_response.status_code == 200
    assert viewer_file_response.content == pdf_bytes
