import axios, { AxiosError, type AxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const isApiPath = normalized.startsWith("/api/");
  const url = isApiPath ? normalized : `${API_BASE}${normalized}`;

  const config: AxiosRequestConfig = {
    url,
    method: init?.method as AxiosRequestConfig["method"],
    data: init?.body,
  };

  if (init?.headers) {
    config.headers = Object.fromEntries(new Headers(init.headers).entries());
  }

  try {
    const response = await axios.request<T>(config);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status ?? 0;
      const payload = error.response?.data;
      const message = typeof payload === "string" ? payload : JSON.stringify(payload);
      throw new Error(`API ${status}: ${message}`);
    }
    throw error;
  }
}

export function buildViewerFileUrl(documentId: string, ts: number): string {
  const encodedDocumentId = encodeURIComponent(documentId);
  return `/api/v1/documents/${encodedDocumentId}/file?ts=${ts}`;
}
