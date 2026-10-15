import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Attachment } from "../types";

function AttachmentGallery({ incidentId }: { incidentId: string }) {
  const [files, setFiles] = useState<Attachment[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Attachment[]>(`/incidents/${incidentId}/attachments`)
      .then(setFiles)
      .catch((err: Error) => setError(err.message));
  }, [incidentId]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!files) return <p className="text-sm text-gray-500">Loading files…</p>;
  if (files.length === 0) return <p className="text-sm text-gray-500">No files attached.</p>;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {files.map((f) => (
        <li key={f.id}>
          <a href={f.url} className="group block" title={`Download ${f.fileName}`}>
            {f.contentType.startsWith("image/") ? (
              <img
                src={f.url}
                alt={f.fileName}
                loading="lazy"
                className="h-24 w-full rounded-md object-cover ring-1 ring-gray-200 group-hover:ring-primary"
              />
            ) : (
              <div className="flex h-24 w-full items-center justify-center rounded-md bg-gray-50 ring-1 ring-gray-200 group-hover:ring-primary">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="mt-1 truncate text-xs font-medium text-secondary">{f.fileName}</div>
            <div className="text-[11px] text-gray-400">
              {Math.max(1, Math.round(f.size / 1024))} KB
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default AttachmentGallery;
