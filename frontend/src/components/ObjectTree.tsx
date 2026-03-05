import type { PdfObjectSummary } from "../api/documents";

type ObjectTreeProps = {
  documentId: string | null;
  objects: PdfObjectSummary[];
  selectedObjectId: string | null;
  onSelect: (objId: string) => void;
  onRefresh: () => Promise<void>;
};

function ObjectTree({ documentId, objects, selectedObjectId, onSelect, onRefresh }: ObjectTreeProps) {
  return (
    <section className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Objects</h2>
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void onRefresh()}
          disabled={!documentId}
        >
          Refresh
        </button>
      </div>

      {!documentId && <p className="text-sm text-slate-600">문서를 먼저 업로드하세요.</p>}
      {documentId && objects.length === 0 && <p className="text-sm text-slate-600">객체 목록이 없습니다.</p>}

      <ul className="grid gap-1.5">
        {objects.map((obj) => {
          const isSelected = obj.id === selectedObjectId;
          return (
            <li key={obj.id}>
              <button
                type="button"
                className={
                  isSelected
                    ? "w-full rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-left text-sm text-blue-900"
                    : "w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-left text-sm text-slate-800 transition hover:bg-slate-50"
                }
                onClick={() => onSelect(obj.id)}
              >
                {obj.label ?? obj.id}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default ObjectTree;
