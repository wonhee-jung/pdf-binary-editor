import { apiFetch } from "./client";

export type UploadDocumentResponse = {
  document_id: string;
};

export type PdfObjectSummary = {
  id: string;
  label?: string;
};

export type PdfObjectDetail = {
  id: string;
  raw: string;
};

export async function uploadDocument(file: File): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<UploadDocumentResponse>("/api/v1/documents", {
    method: "POST",
    body: formData,
  });
}

export async function listObjects(documentId: string): Promise<PdfObjectSummary[]> {
  const data = await apiFetch<unknown>(`/api/v1/documents/${documentId}/objects`);

  if (Array.isArray(data)) {
    return data.map((item, index) => {
      const asRecord = item as Record<string, unknown>;
      const idValue = asRecord.id ?? asRecord.obj_id ?? asRecord.object_id ?? String(index);
      const labelValue = asRecord.label ?? asRecord.name ?? asRecord.type ?? String(idValue);

      return {
        id: String(idValue),
        label: String(labelValue),
      };
    });
  }

  if (typeof data === "object" && data !== null) {
    const wrapped = data as Record<string, unknown>;
    const list = Array.isArray(wrapped.objects) ? wrapped.objects : [];

    return list.map((item, index) => {
      const asRecord = item as Record<string, unknown>;
      const idValue = asRecord.id ?? asRecord.obj_id ?? asRecord.object_id ?? String(index);
      const labelValue = asRecord.label ?? asRecord.name ?? asRecord.type ?? String(idValue);

      return {
        id: String(idValue),
        label: String(labelValue),
      };
    });
  }

  return [];
}

export async function getObjectDetail(documentId: string, objId: string): Promise<PdfObjectDetail> {
  const data = await apiFetch<unknown>(`/api/v1/documents/${documentId}/objects/${objId}`);

  if (typeof data === "string") {
    return { id: objId, raw: data };
  }

  if (typeof data === "object" && data !== null) {
    const asRecord = data as Record<string, unknown>;
    const raw = asRecord.raw ?? asRecord.content ?? asRecord.object ?? JSON.stringify(data, null, 2);
    return { id: objId, raw: String(raw) };
  }

  return { id: objId, raw: "" };
}

export async function updateObjectDetail(documentId: string, objId: string, raw: string): Promise<void> {
  await apiFetch<unknown>(`/api/v1/documents/${documentId}/objects/${objId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });
}
