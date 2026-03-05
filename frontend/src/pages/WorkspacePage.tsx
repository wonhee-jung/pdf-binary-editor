import { useCallback, useEffect, useState } from "react";
import PdfViewer from "../components/PdfViewer";
import ObjectTree from "../components/ObjectTree";
import ObjectEditor from "../components/ObjectEditor";
import {
  getObjectDetail,
  listObjects,
  updateObjectDetail,
  uploadDocument,
  type PdfObjectSummary,
} from "../api/documents";

function WorkspacePage() {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [objects, setObjects] = useState<PdfObjectSummary[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [raw, setRaw] = useState("");
  const [isObjectLoading, setIsObjectLoading] = useState(false);
  const [isObjectSaving, setIsObjectSaving] = useState(false);
  const [reloadToken, setReloadToken] = useState(Date.now());

  const refreshObjects = useCallback(async () => {
    if (!documentId) {
      setObjects([]);
      return;
    }

    const nextObjects = await listObjects(documentId);
    setObjects(nextObjects);
  }, [documentId]);

  const loadObjectDetail = useCallback(
    async (objId: string) => {
      if (!documentId) {
        return;
      }

      setIsObjectLoading(true);
      try {
        const detail = await getObjectDetail(documentId, objId);
        setRaw(detail.raw);
      } finally {
        setIsObjectLoading(false);
      }
    },
    [documentId],
  );

  useEffect(() => {
    void refreshObjects();
  }, [refreshObjects]);

  useEffect(() => {
    if (!selectedObjectId) {
      setRaw("");
      return;
    }

    void loadObjectDetail(selectedObjectId);
  }, [selectedObjectId, loadObjectDetail]);

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadDocument(selectedFile);
      setDocumentId(response.document_id);
      setSelectedObjectId(null);
      setRaw("");
      setReloadToken(Date.now());
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!documentId || !selectedObjectId) {
      return;
    }

    setIsObjectSaving(true);
    try {
      await updateObjectDetail(documentId, selectedObjectId, raw);
      await refreshObjects();
    } finally {
      setIsObjectSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-3 md:p-4">
      <header className="mb-3 rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-slate-900">PDF Binary Editor</h1>
          <p className="text-sm text-slate-600">document_id: {documentId ?? "(none)"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="text-sm text-slate-700 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-slate-700 hover:file:bg-slate-50"
            type="file"
            accept="application/pdf"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void handleUpload()}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload PDF"}
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setReloadToken(Date.now())}
            disabled={!documentId}
          >
            Reload Viewer
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void refreshObjects()}
            disabled={!documentId}
          >
            Refresh Objects
          </button>
        </div>
      </header>

      <section className="grid min-h-[calc(100vh-120px)] grid-cols-1 gap-3 overflow-hidden lg:grid-cols-2">
        <aside className="grid min-h-0 gap-3 lg:grid-rows-[minmax(130px,0.6fr)_minmax(260px,1.4fr)]">
          <ObjectTree
            documentId={documentId}
            objects={objects}
            selectedObjectId={selectedObjectId}
            onSelect={setSelectedObjectId}
            onRefresh={refreshObjects}
          />
          <ObjectEditor
            documentId={documentId}
            objectId={selectedObjectId}
            raw={raw}
            isLoading={isObjectLoading}
            isSaving={isObjectSaving}
            onRawChange={setRaw}
            onSave={handleSave}
          />
        </aside>

        <section className="min-h-0 overflow-hidden">
          {/* Right pane: viewer and separated text panel */}
          <PdfViewer documentId={documentId} reloadToken={reloadToken} onReload={() => setReloadToken(Date.now())} />
        </section>
      </section>
    </main>
  );
}

export default WorkspacePage;
