import { Document, Page, pdfjs } from "react-pdf";
import { buildViewerFileUrl } from "../api/client";
import { useEffect, useMemo, useRef, useState } from "react";

type PdfViewerProps = {
  documentId: string | null;
  reloadToken: number;
  onReload: () => void;
};

function PdfViewer({ documentId, reloadToken, onReload }: PdfViewerProps) {
  // 현재 뷰어 상태(페이지/줌/텍스트 패널)를 관리한다.
  const [numPages, setNumPages] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [scale, setScale] = useState(1);
  const [pageText, setPageText] = useState("");
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [pageBaseWidth, setPageBaseWidth] = useState(480);
  const pagesContainerRef = useRef<HTMLDivElement | null>(null);

  // document_id가 있을 때만 백엔드 PDF 파일 URL을 생성한다.
  const fileUrl = useMemo(() => {
    if (!documentId) {
      return null;
    }
    return buildViewerFileUrl(documentId, reloadToken);
  }, [documentId, reloadToken]);

  useEffect(() => {
    const element = pagesContainerRef.current;
    if (!element) {
      return;
    }

    // 뷰어 컨테이너 폭 변화에 맞춰 페이지 렌더링 폭을 동기화한다.
    const updateWidth = () => {
      const nextWidth = Math.max(240, Math.floor(element.clientWidth - 24));
      setPageBaseWidth(nextWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!fileUrl) {
      setPageText("");
      return;
    }

    let cancelled = false;
    // 활성 페이지 기준으로 텍스트를 추출해 하단 Text Layer 패널에 표시한다.
    const loadTextLayer = async () => {
      setIsTextLoading(true);
      try {
        const loadingTask = pdfjs.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(activePage);
        const textContent = await page.getTextContent();
        const mergedText = textContent.items
          .map((item) => {
            const candidate = item as { str?: unknown };
            return typeof candidate.str === "string" ? candidate.str : "";
          })
          .filter((value) => value.trim().length > 0)
          .join("\n");

        if (!cancelled) {
          setPageText(mergedText || "(텍스트 없음)");
        }
      } catch (error) {
        if (!cancelled) {
          setPageText("텍스트 추출 중 오류가 발생했습니다.");
          console.error("Text layer extraction error:", error);
        }
      } finally {
        if (!cancelled) {
          setIsTextLoading(false);
        }
      }
    };

    void loadTextLayer();
    return () => {
      cancelled = true;
    };
  }, [fileUrl, activePage, reloadToken]);

  return (
    <section className="grid h-[75vh] min-h-0 gap-3 lg:grid-rows-[minmax(0,3fr)_minmax(0,1fr)]">
      <div className="flex min-h-0 flex-col rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-700">
            Active Page {activePage}/{numPages || "-"}
          </span>
          <span className="text-xs text-slate-500">스크롤로 페이지 이동</span>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50"
            onClick={() => setScale((s) => Math.max(0.8, Number((s - 0.1).toFixed(2))))}
          >
            -
          </button>
          <span className="text-sm text-slate-700">Zoom {Math.round(scale * 100)}%</span>
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50"
            onClick={() => setScale((s) => Math.min(1.5, Number((s + 0.1).toFixed(2))))}
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
          <div
            ref={pagesContainerRef}
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden rounded border border-slate-200 bg-slate-50 p-2"
          >
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages: totalPages }) => {
                setNumPages(totalPages);
                setActivePage(1);
              }}
              onLoadError={(error) => {
                console.error("PDF load error:", error);
              }}
            >
              <div className="grid gap-3">
                {Array.from({ length: numPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <div
                      key={pageNumber}
                      className={
                        pageNumber === activePage
                          ? "overflow-hidden rounded border border-blue-300 bg-blue-50 p-2"
                          : "overflow-hidden rounded border border-slate-200 bg-white p-2"
                      }
                      onMouseEnter={() => setActivePage(pageNumber)}
                    >
                      {/* 텍스트/주석 레이어를 끄고 캔버스 렌더링만 표시한다. */}
                      <Page
                        pageNumber={pageNumber}
                        width={Math.floor(pageBaseWidth * scale)}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </div>
                  );
                })}
              </div>
            </Document>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-col rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Text Layer (Separated)</h3>
        <div className="min-h-0 flex-1 overflow-auto rounded border border-slate-200 bg-slate-50 p-2">
          {!fileUrl && <p className="text-sm text-slate-600">문서를 업로드하면 텍스트가 표시됩니다.</p>}
          {fileUrl && isTextLoading && <p className="text-sm text-slate-600">텍스트 추출 중...</p>}
          {fileUrl && !isTextLoading && (
            <pre className="whitespace-pre-wrap break-words font-mono text-xs text-slate-800">{pageText}</pre>
          )}
        </div>
      </div>
    </section>
  );
}

export default PdfViewer;
