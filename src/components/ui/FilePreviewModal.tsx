"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, X, Loader2, FileText } from "lucide-react";

/* Matches the inline regex used by the existing DocItem components. */
export function isImageFile(f: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f);
}

/* Resolve a stored path (local `/uploads/...` or an absolute Space https URL)
   to a fully loadable URL. Space URLs already start with http and pass
   through untouched; local paths are prefixed with the backend origin. */
export function resolveFileUrl(p: string): string {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  const path = p.startsWith("/") ? p : `/${p}`;
  const encoded = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${process.env.NEXT_PUBLIC_API_BASE?.replace("/api", "") || "http://localhost:3001"}${encoded}`;
}

interface FilePreviewModalProps {
  url: string;
  label?: string;
  downloadUrl?: string;
  onClose: () => void;
}

/* Map a stored file name/URL to its expected MIME type so the preview blob is
   typed correctly even when the server serves it as application/octet-stream
   (a common cause of Space files downloading instead of previewing). */
function guessMime(f: string): string {
  const lower = f.toLowerCase().split("?")[0];
  if (/\.pdf$/.test(lower)) return "application/pdf";
  if (/\.png$/.test(lower)) return "image/png";
  if (/\.jpe?g$/.test(lower)) return "image/jpeg";
  if (/\.gif$/.test(lower)) return "image/gif";
  if (/\.webp$/.test(lower)) return "image/webp";
  if (/\.bmp$/.test(lower)) return "image/bmp";
  return "";
}

/*
   Robust preview for both local and DigitalOcean Space files.

   Why: files served straight from Space (or the backend) may come with
   `Content-Disposition: attachment` or a generic `application/octet-stream`
   content type, which makes the browser download instead of render when the
   URL is loaded directly by `<img>` / `<iframe>` / `<a target="_blank">`.

   Fix: we `fetch` the file ourselves and build an in-memory object URL, which
   bypasses the server's Content-Disposition/content-type entirely, so the eye
   / View action always previews (image or PDF/doc) instead of downloading.
   Download stays a separate, explicit action using the original URL.
*/
export default function FilePreviewModal({
  url,
  label,
  downloadUrl = url,
  onClose,
}: FilePreviewModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const objectUrlRef = useRef<string | null>(null);

  /* url alone is enough for a real server URL (always carries the file's
     extension), but a locally-picked-not-yet-uploaded file previewed via
     URL.createObjectURL has a blob: URL with no extension at all — fall
     back to label (the real filename) only when url itself doesn't match,
     so every existing caller's url-based detection is unaffected. */
  const isImage = useMemo(
    () => isImageFile(url) || (!!label && isImageFile(label)),
    [url, label]
  );

  useEffect(() => {
    let cancelled = false;

    const doFetch = async () => {
      if (!url) {
        return;
      }
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let blob = await res.blob();
        const expected = guessMime(url) || (label ? guessMime(label) : "");
        if (expected && blob.type !== expected) {
          blob = new Blob([blob], { type: expected });
        }
        if (cancelled) return;
        const objUrl = URL.createObjectURL(blob);
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = objUrl;
        setPreviewUrl(objUrl);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    doFetch();

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [url, label]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate pr-2">
            {label || "File Preview"}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  /* Keep navigation from being swallowed by the fetch-loop;
                     this is the explicit Download action. */
                  e.stopPropagation();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-600 hover:bg-sky-50 transition-all"
              >
                <Download size={13} /> Download
              </a>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="relative" style={{ height: "calc(90vh - 60px)" }}>
          {loading && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800/50 text-gray-500">
              <Loader2 size={28} className="animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          )}
          {!loading && error && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-100 dark:bg-gray-800/50 text-gray-500 p-6">
              <FileText size={32} />
              <p className="text-sm text-center">Unable to load this file.</p>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-600 hover:bg-sky-100 transition-all"
                >
                  <Download size={13} /> Open / Download
                </a>
              )}
            </div>
          )}
          {!loading && !error && previewUrl && (
            <div className="w-full h-full">
              {isImage ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 p-4">
                  <img
                    src={previewUrl}
                    alt={label || "preview"}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title={label || "preview"}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
