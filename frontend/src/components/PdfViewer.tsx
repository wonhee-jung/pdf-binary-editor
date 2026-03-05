import { Document, Page } from "react-pdf";
import { buildViewerFileUrl } from "../api/client";
import { useMemo, useState } from "react";

type PdfViewerProps = {
  documentId: string | null;
  reloadToken: number;
  onReload: () => void;
};

function PdfViewer({ documentId, reloadToken, onReload }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  const fileUrl = useMemo(() => {
    if (!documentId) {
      return null;
    }

    return buildViewerFileUrl(documentId, reloadToken);
  }, [documentId, reloadToken]);

  return (
    <section className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          disabled={pageNumber <= 1}
        >
          Prev
        </button>
        <span className="text-sm text-slate-700">
          Page {pageNumber}/{numPages || "-"}
        </span>
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p + 1))}
          disabled={numPages > 0 && pageNumber >= numPages}
        >
          Next
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50"
          onClick={() => setScale((s) => Math.max(0.5, Number((s - 0.1).toFixed(2))))}
        >
          -
        </button>
        <span className="text-sm text-slate-700">Zoom {Math.round(scale * 100)}%</span>
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50"
          onClick={() => setScale((s) => Math.min(3, Number((s + 0.1).toFixed(2))))}
        >
          +
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onReload}
          disabled={!documentId}
        >
          Reload
        </button>
      </div>

      {!fileUrl && <p className="text-sm text-slate-600">문서를 업로드하면 PDF가 표시됩니다.</p>}

      {fileUrl && (
        <div className="overflow-auto rounded border border-slate-200 bg-slate-50 p-2">
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages: totalPages }) => {
              setNumPages(totalPages);
              setPageNumber(1);
            }}
            onLoadError={(error) => {
              console.error("PDF load error:", error);
            }}
          >
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        </div>
      )}
    </section>
  );
}

export default PdfViewer;
