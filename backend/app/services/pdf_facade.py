class PdfFacade:
    def list_objects(self, document_id: str) -> list[dict[str, str]]:
        # Placeholder object list until real parser is integrated.
        return [
            {"obj_id": "1 0", "kind": "Catalog"},
            {"obj_id": "2 0", "kind": "Pages"},
            {"obj_id": "3 0", "kind": "Page"},
        ]

    def get_object_raw(self, document_id: str, obj_id: str) -> str:
        return f"{obj_id} obj\n<< /Type /Example >>\nendobj"

    def decode_stream(self, document_id: str, obj_id: str) -> dict[str, str]:
        return {
            "decoded": f"Decoded stream placeholder for object {obj_id}",
            "note": "Real decode logic will be added in a later iteration.",
        }


def get_pdf_facade() -> PdfFacade:
    return PdfFacade()
