import { useCallback, useEffect, useState } from "react";
import UploadPanel from "../components/UploadPanel";
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

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await uploadDocument(file);
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
    <main className="min-h-screen p-3 md:p-4">
      <header className="mb-3 rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-slate-900">PDF Binary Editor</h1>
        <p className="text-sm text-slate-600">document_id: {documentId ?? "(none)"}</p>
      </header>

      <section className="grid min-h-[calc(100vh-120px)] grid-cols-1 gap-3 lg:grid-cols-[320px_1fr]">
        <aside className="grid min-h-0 gap-3">
          <UploadPanel isUploading={isUploading} onUpload={handleUpload} />
          <ObjectTree
            documentId={documentId}
            objects={objects}
            selectedObjectId={selectedObjectId}
            onSelect={setSelectedObjectId}
            onRefresh={refreshObjects}
          />
        </aside>

        <section className="grid min-h-0 gap-3 lg:grid-rows-[minmax(280px,2fr)_minmax(220px,1fr)]">
          <PdfViewer documentId={documentId} reloadToken={reloadToken} onReload={() => setReloadToken(Date.now())} />
          <ObjectEditor
            documentId={documentId}
            objectId={selectedObjectId}
            raw={raw}
            isLoading={isObjectLoading}
            isSaving={isObjectSaving}
            onRawChange={setRaw}
            onSave={handleSave}
          />
        </section>
      </section>
    </main>
  );
}

export default WorkspacePage;
