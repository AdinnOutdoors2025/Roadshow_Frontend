"use client";

/* -------------------------------------------------------------------------- */
/*                    AGENCY PO DOCUMENT UPLOAD (optional)                     */
/* -------------------------------------------------------------------------- */
/*  Shown only for Agency accounts (accountType === "agency") — gate this at    */
/*  the call site with isAgency, this component itself renders unconditionally  */
/*  whenever it's mounted. A booking has at most one PO document, so this is    */
/*  a single-file picker, not a list like CampaignMediaUpload.                  */

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Eye, FileText, Paperclip, X } from "lucide-react";
import toast from "react-hot-toast";

import {
  type AgencyPoDocument,
  resolvePoDocumentUrl,
  validatePoDocumentFile,
} from "@/lib/roadshowAgencyPoDocument";
import FilePreviewModal from "@/components/ui/FilePreviewModal";

import "./AgencyPoDocumentUpload.css";

type AgencyPoDocumentUploadProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Already-saved document from a previous upload, if any. */
  existingDocument?: AgencyPoDocument | null;
  /** Clears the saved document server-side. Omit to hide the option. */
  onRemoveExisting?: () => void;
  disabled?: boolean;
};

const formatSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);

  if (mb >= 1) return `${mb.toFixed(1)} MB`;

  return `${Math.max(Math.round(bytes / 1024), 1)} KB`;
};

export default function AgencyPoDocumentUpload({
  file,
  onFileChange,
  existingDocument,
  onRemoveExisting,
  disabled = false,
}: AgencyPoDocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  /* Which preview is open, if any — "existing" for an already-saved
     document (server URL), "local" for a freshly-picked file not yet
     uploaded (previewed from an in-memory object URL). */
  const [previewTarget, setPreviewTarget] = useState<
    "existing" | "local" | null
  >(null);

  /* Backs both the Preview and Download icon buttons for a freshly-picked
     file, so it's created as soon as a file is set rather than only once
     the user opens the preview. */
  const localFileUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (localFileUrl) URL.revokeObjectURL(localFileUrl);
    };
  }, [localFileUrl]);

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] || null;

    /* Lets the same file be re-picked after a removal. */
    event.target.value = "";

    if (!picked) return;

    const error = validatePoDocumentFile(picked);

    if (error) {
      toast.error(error);
      return;
    }

    onFileChange(picked);
  };

  return (
    <div className="rdsw_poDocBlock">
      <div className="rdsw_poDocHeader">
        <span className="rdsw_poDocLabel">PO Document (optional)</span>
        <span className="rdsw_poDocLimit">
          Images max 5MB · PDF/DOC/DOCX max 10MB
        </span>
      </div>

      {!file && existingDocument?.url && (
        <div className="rdsw_poDocExisting">
          <FileText size={15} />

          <span
            className="rdsw_poDocName"
            title={existingDocument.originalName}
          >
            {existingDocument.originalName || "PO document"}
          </span>

          <div className="rdsw_poDocActions">
            <button
              type="button"
              onClick={() => setPreviewTarget("existing")}
              title="Preview"
              aria-label="Preview PO document"
              className="rdsw_poDocIconBtn rdsw_poDocIconBtn--preview"
            >
              <Eye size={14} />
            </button>

            <a
              href={resolvePoDocumentUrl(existingDocument.url)}
              download
              target="_blank"
              rel="noreferrer"
              title="Download"
              aria-label="Download PO document"
              className="rdsw_poDocIconBtn rdsw_poDocIconBtn--download"
            >
              <Download size={14} />
            </a>
          </div>

          {onRemoveExisting && (
            <button
              type="button"
              onClick={onRemoveExisting}
              disabled={disabled}
              aria-label="Remove PO document"
              className="rdsw_poDocRemove"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {file ? (
        <div className="rdsw_poDocSelected">
          <Paperclip size={15} />
          <span className="rdsw_poDocName" title={file.name}>
            {file.name}
          </span>
          <span className="rdsw_poDocSize">{formatSize(file.size)}</span>

          <div className="rdsw_poDocActions">
            <button
              type="button"
              onClick={() => setPreviewTarget("local")}
              title="Preview"
              aria-label={`Preview ${file.name}`}
              className="rdsw_poDocIconBtn rdsw_poDocIconBtn--preview"
            >
              <Eye size={14} />
            </button>

            {localFileUrl && (
              <a
                href={localFileUrl}
                download={file.name}
                title="Download"
                aria-label={`Download ${file.name}`}
                className="rdsw_poDocIconBtn rdsw_poDocIconBtn--download"
              >
                <Download size={14} />
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={() => onFileChange(null)}
            disabled={disabled}
            aria-label={`Remove ${file.name}`}
            className="rdsw_poDocRemove"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="rdsw_poDocDropzone"
        >
          <Paperclip size={15} />
          <span>
            {existingDocument?.url
              ? "Click to replace the PO document"
              : "Click to attach a PO document"}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
        onChange={handlePick}
        className="hidden"
        disabled={disabled}
      />

      {previewTarget === "existing" && existingDocument?.url && (
        <FilePreviewModal
          url={resolvePoDocumentUrl(existingDocument.url)}
          label={existingDocument.originalName || "PO document"}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      {previewTarget === "local" && file && localFileUrl && (
        <FilePreviewModal
          url={localFileUrl}
          label={file.name}
          onClose={() => setPreviewTarget(null)}
        />
      )}
    </div>
  );
}
