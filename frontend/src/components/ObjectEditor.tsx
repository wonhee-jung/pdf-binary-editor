type ObjectEditorProps = {
  documentId: string | null;
  objectId: string | null;
  raw: string;
  isLoading: boolean;
  isSaving: boolean;
  onRawChange: (value: string) => void;
  onSave: () => Promise<void>;
};

function ObjectEditor({
  documentId,
  objectId,
  raw,
  isLoading,
  isSaving,
  onRawChange,
  onSave,
}: ObjectEditorProps) {
  return (
    <section className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Object Editor</h2>
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void onSave()}
          disabled={!documentId || !objectId || isSaving || isLoading}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      {!objectId && <p className="mb-2 text-sm text-slate-600">객체를 선택하면 RAW 내용이 표시됩니다.</p>}

      <textarea
        className="min-h-[220px] w-full resize-y rounded-md border border-slate-300 p-2 font-mono text-sm text-slate-900 focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
        value={raw}
        onChange={(event) => onRawChange(event.target.value)}
        disabled={!objectId || isLoading}
        placeholder="RAW object data"
      />
    </section>
  );
}

export default ObjectEditor;
