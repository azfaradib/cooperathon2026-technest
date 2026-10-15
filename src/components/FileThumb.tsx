import { Paperclip } from "lucide-react";
import { useEffect, useState } from "react";

// Small preview for a locally picked file; non-images fall back to an icon.
function FileThumb({ file }: { file: File }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setSrc(String(reader.result));
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);

  return src ? (
    <img src={src} alt="" className="h-10 w-10 shrink-0 rounded object-cover ring-1 ring-gray-200" />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100">
      <Paperclip className="h-4 w-4 text-gray-500" />
    </span>
  );
}

export default FileThumb;
