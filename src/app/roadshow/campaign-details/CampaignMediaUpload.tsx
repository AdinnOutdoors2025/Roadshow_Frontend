/* eslint-disable */
// @ts-nocheck
"use client";

/* -------------------------------------------------------------------------- */
/*                          CAMPAIGN MEDIA UPLOADER                           */
/* -------------------------------------------------------------------------- */
/*  One picker, used for both images and videos on a vehicle's campaign card.  */
/*                                                                            */
/*  Size limits and the rejection wording are copied verbatim from admin's     */
/*  VehicleFormModal (IMAGE_MAX_MB = 5, VIDEO_MAX_MB = 50) so a customer is    */
/*  never told a file is fine here and then rejected once staff open it.       */
/*                                                                            */
/*  Every attachment opens full size in a lightbox — images as images, videos  */
/*  with native controls — because a 34px thumbnail and a filename are not     */
/*  enough to tell whether you attached the right thing.                       */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Maximize2,
  Play,
  Video,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { useScrollLock } from "@/hooks/useScrollLock";
import {
  getPreviewUrl,
  revokePreviewUrl,
} from "@/lib/roadshowCampaignDraft";

/* Same constants admin's VehicleFormModal enforces */
export const IMAGE_MAX_MB = 5;
export const VIDEO_MAX_MB = 50;

type MediaKind = "image" | "video";

type CampaignMediaUploadProps = {
  kind: MediaKind;
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
};

/** Admin's validateFileSize, unchanged in behaviour and message. */
const validateFileSize = (file: File): string | null => {
  const isVideo = file.type.startsWith("video/");
  const fileMB = file.size / (1024 * 1024);

  if (isVideo && fileMB > VIDEO_MAX_MB) {
    return `Video upload only ${VIDEO_MAX_MB} MB allowed. "${file.name}" is ${fileMB.toFixed(
      2
    )} MB`;
  }

  if (!isVideo && fileMB > IMAGE_MAX_MB) {
    return `Image upload only ${IMAGE_MAX_MB} MB allowed. "${file.name}" is ${fileMB.toFixed(
      2
    )} MB`;
  }

  return null;
};

const formatSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);

  if (mb >= 1) return `${mb.toFixed(1)} MB`;

  return `${Math.max(Math.round(bytes / 1024), 1)} KB`;
};

/* -------------------------------------------------------------------------- */
/*                                  LIGHTBOX                                  */
/* -------------------------------------------------------------------------- */
/*  Portalled to document.body so the card's own stacking and overflow cannot  */
/*  clip it, and carrying `data-lenis-prevent` for the same reason the review  */
/*  popup does — Lenis preventDefault()s every wheel event while it is         */
/*  stopped, which is what useScrollLock does the moment this opens.           */

function MediaLightbox({ kind, files, index, onClose, onNavigate }) {
  useScrollLock(index !== null);

  useEffect(() => {
    if (index === null) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNavigate(1);
      if (event.key === "ArrowLeft") onNavigate(-1);
    };

    document.addEventListener("keydown", handleKey);

    return () => document.removeEventListener("keydown", handleKey);
  }, [index, onClose, onNavigate]);

  if (index === null || typeof document === "undefined") return null;

  const file = files[index];

  if (!file) return null;

  return createPortal(
    <div
      className="rdsw_cdLightbox"
      role="dialog"
      aria-modal="true"
      aria-label={file.name}
      data-lenis-prevent
    >
      <div className="rdsw_cdLightboxBackdrop" onClick={onClose} />

      <div className="rdsw_cdLightboxShell">
        <div className="rdsw_cdLightboxBar">
          <span className="rdsw_cdLightboxName" title={file.name}>
            {file.name}
          </span>

          <span className="rdsw_cdLightboxCount">
            {index + 1} / {files.length}
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="rdsw_cdLightboxClose"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rdsw_cdLightboxStage">
          {files.length > 1 && (
            <button
              type="button"
              onClick={() => onNavigate(-1)}
              aria-label="Previous"
              className="rdsw_cdLightboxNav rdsw_cdLightboxNavPrev"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {kind === "image" ? (
            <img
              src={getPreviewUrl(file)}
              alt={file.name}
              className="rdsw_cdLightboxMedia"
            />
          ) : (
            /* `key` forces a fresh element when navigating, otherwise the
               browser keeps playing the previous source. */
            <video
              key={`${file.name}-${file.size}`}
              src={getPreviewUrl(file)}
              controls
              autoPlay
              className="rdsw_cdLightboxMedia"
            />
          )}

          {files.length > 1 && (
            <button
              type="button"
              onClick={() => onNavigate(1)}
              aria-label="Next"
              className="rdsw_cdLightboxNav rdsw_cdLightboxNavNext"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function CampaignMediaUpload({
  kind,
  label,
  files,
  onChange,
  disabled = false,
}: CampaignMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const isImage = kind === "image";
  const maxMb = isImage ? IMAGE_MAX_MB : VIDEO_MAX_MB;

  /* Removing the last attachment while it is open would leave the lightbox
     pointing at nothing — close it rather than render an empty stage. */
  useEffect(() => {
    if (previewIndex !== null && previewIndex > files.length - 1) {
      setPreviewIndex(files.length ? files.length - 1 : null);
    }
  }, [files.length, previewIndex]);

  const handlePick = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const picked = Array.from(event.target.files || []);

    /* Clearing the input lets the same file be re-picked after a removal —
       without it the change event never fires for an identical selection. */
    event.target.value = "";

    if (!picked.length) return;

    const accepted: File[] = [];

    picked.forEach((file) => {
      const error = validateFileSize(file);

      if (error) {
        toast.error(error);
        return;
      }

      /* Same name AND size is the same file being added twice */
      const duplicate = files.some(
        (existing) =>
          existing.name === file.name && existing.size === file.size
      );

      if (duplicate) return;

      accepted.push(file);
    });

    if (!accepted.length) return;

    onChange([...files, ...accepted]);
  };

  const handleRemove = (index: number) => {
    const file = files[index];

    if (file) revokePreviewUrl(file);

    onChange(files.filter((_, position) => position !== index));
  };

  return (
    <div className="rdsw_cdMediaBlock">
      <div className="rdsw_cdMediaHeader">
        <span className="rdsw_cdMediaLabel">{label}</span>

        <span className="rdsw_cdMediaLimit">max {maxMb}MB each</span>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="rdsw_cdMediaDropzone"
      >
        {isImage ? <ImagePlus size={16} /> : <Video size={16} />}

        <span>
          {isImage ? "Click to add images" : "Click to add videos"}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={isImage ? "image/*" : "video/*"}
        onChange={handlePick}
        className="hidden"
        disabled={disabled}
      />

      {files.length > 0 && (
        <ul className="rdsw_cdMediaList">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="rdsw_cdMediaItem"
            >
              {/* The thumbnail is the preview trigger — the whole point of
                  showing one is to let you check what you attached. */}
              <button
                type="button"
                onClick={() => setPreviewIndex(index)}
                aria-label={`Preview ${file.name}`}
                className="rdsw_cdMediaThumbBtn"
              >
                {isImage ? (
                  <img
                    src={getPreviewUrl(file)}
                    alt=""
                    className="rdsw_cdMediaThumb"
                  />
                ) : (
                  <span className="rdsw_cdMediaThumb rdsw_cdMediaThumbVideo">
                    <Video size={14} />
                  </span>
                )}

                <span className="rdsw_cdMediaThumbPlay">
                  {isImage ? <Maximize2 size={11} /> : <Play size={11} />}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewIndex(index)}
                className="rdsw_cdMediaName"
                title={`Preview ${file.name}`}
              >
                {file.name}
              </button>

              <span className="rdsw_cdMediaSize">
                {formatSize(file.size)}
              </span>

              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={`Remove ${file.name}`}
                className="rdsw_cdMediaRemove"
                disabled={disabled}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <MediaLightbox
        kind={kind}
        files={files}
        index={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onNavigate={(step) =>
          setPreviewIndex((current) =>
            current === null
              ? null
              : (current + step + files.length) % files.length
          )
        }
      />
    </div>
  );
}
