const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const isApiPath = normalized.startsWith("/api/");

  const url = isApiPath ? normalized : `${API_BASE}${normalized}`;
  const response = await fetch(url, init);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API ${response.status}: ${errorText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text.trim()) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export function buildViewerFileUrl(documentId: string, ts: number): string {
  return `/api/v1/documents/${documentId}/file?ts=${ts}`;
}
