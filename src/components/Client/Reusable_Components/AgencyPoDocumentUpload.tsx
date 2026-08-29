"use client";

/* -------------------------------------------------------------------------- */
/*                    AGENCY PO DOCUMENT UPLOAD (optional)                     */
/* -------------------------------------------------------------------------- */
/*  Shown only for Agency accounts (accountType === "agency") — gate this at    */
/*  the call site with isAgency, this component itself renders unconditionally  */
/*  whenever it's mounted. A booking has at most one PO document, so this is    */
/*  a single-file picker, not a list like CampaignMediaUpload.                  */

import { useRef } from "react";
import { FileText, Paperclip, X } from "lucide-react";
import toast from "react-hot-toast";

import {
  type AgencyPoDocument,
  resolvePoDocumentUrl,
  validatePoDocumentFile,
} from "@/lib/roadshowAgencyPoDocument";

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

          <a
            href={resolvePoDocumentUrl(existingDocument.url)}
            target="_blank"
            rel="noreferrer"
            title={existingDocument.originalName}
          >
            {existingDocument.originalName || "PO document"}
          </a>

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
    </div>
  );
}
