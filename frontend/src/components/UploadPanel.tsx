type UploadPanelProps = {
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
};

import { useState } from "react";

function UploadPanel({ isUploading, onUpload }: UploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!selectedFile || isUploading) {
      return;
    }

    await onUpload(selectedFile);
  };

  return (
    <section className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-slate-900">Upload</h2>
      <div className="flex flex-col gap-2">
        <input
          className="text-sm text-slate-700 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-slate-700 hover:file:bg-slate-50"
          type="file"
          accept="application/pdf"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setSelectedFile(file);
          }}
        />
        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleSubmit}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>
    </section>
  );
}

export default UploadPanel;
