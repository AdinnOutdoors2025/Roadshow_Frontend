/* -------------------------------------------------------------------------- */
/*                    AGENCY PO DOCUMENT UPLOAD (optional)                    */
/* -------------------------------------------------------------------------- */
/*  Uploaded as its own request AFTER a client request already exists — the    */
/*  backend keeps this off the shared campaign-media multer pipeline (see      */
/*  Utils/agencyPoDocumentUpload.js), so this stays a separate call rather      */
/*  than riding along inside submitClientRequest's FormData.                   */

import { baseUrl } from "@/BaseUrl";
import { clientAuthHeaders } from "@/lib/roadshowAuthToken";

export const PO_DOCUMENT_IMAGE_MAX_MB = 5;
export const PO_DOCUMENT_FILE_MAX_MB = 10;

/** Extensions accepted for the PO document, mirrored on the backend. */
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
const DOCUMENT_EXTENSIONS = /\.(pdf|docx?)$/i;

export type AgencyPoDocument = {
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  storageType: "local" | "space";
  uploadedAt?: string | null;
};

/** null = valid. Otherwise a display-ready rejection message. */
export const validatePoDocumentFile = (file: File): string | null => {
  const isImage = IMAGE_EXTENSIONS.test(file.name);
  const isDocument = DOCUMENT_EXTENSIONS.test(file.name);

  if (!isImage && !isDocument) {
    return `"${file.name}" is not a supported file type. Allowed: JPG, PNG, WEBP, PDF, DOC, DOCX.`;
  }

  const fileMB = file.size / (1024 * 1024);
  const maxMB = isImage ? PO_DOCUMENT_IMAGE_MAX_MB : PO_DOCUMENT_FILE_MAX_MB;

  if (fileMB > maxMB) {
    return `"${file.name}" is ${fileMB.toFixed(2)}MB — max allowed is ${maxMB}MB.`;
  }

  return null;
};

/** Absolute URL for a stored PO document, whether local-relative or a full Spaces URL. */
export const resolvePoDocumentUrl = (url: string): string => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  return `${baseUrl.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
};

/**
 * Uploads (or replaces) the PO document for an already-created client
 * request. Throws a display-ready Error on failure.
 */
export const uploadAgencyPoDocument = async (
  clientRequestId: string,
  file: File
): Promise<AgencyPoDocument> => {
  const formData = new FormData();
  formData.append("poDocument", file);

  const response = await fetch(
    `${baseUrl}/client-requests/${clientRequestId}/po-document`,
    {
      method: "POST",
      headers: clientAuthHeaders(),
      body: formData,
    }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Unable to upload the PO document.");
  }

  return result.data as AgencyPoDocument;
};

/** Clears a previously uploaded PO document. Throws a display-ready Error on failure. */
export const removeAgencyPoDocument = async (
  clientRequestId: string
): Promise<void> => {
  const response = await fetch(
    `${baseUrl}/client-requests/${clientRequestId}/po-document`,
    {
      method: "DELETE",
      headers: clientAuthHeaders(),
    }
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Unable to remove the PO document.");
  }
};
