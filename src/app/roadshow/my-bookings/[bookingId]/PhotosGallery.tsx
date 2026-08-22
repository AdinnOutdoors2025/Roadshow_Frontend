"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type { TrackingPhoto } from "../useCampaignTracking";

export default function PhotosGallery({ photos }: { photos: TrackingPhoto[] }) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (!photos.length) return null;

  return (
    <>
      <div className="RS_PhotosGrid">
        {photos.map((photo) => (
          <button
            key={photo.url}
            type="button"
            className="RS_PhotoThumb"
            onClick={() => setLightboxUrl(photo.url)}
          >
            <img src={photo.url} alt={`Campaign photo — ${photo.day}`} />
          </button>
        ))}
      </div>

      {lightboxUrl && (
        <div className="RS_PhotoLightbox" onMouseDown={() => setLightboxUrl(null)}>
          <button
            type="button"
            className="RS_PhotoLightboxClose"
            aria-label="Close photo"
            onClick={() => setLightboxUrl(null)}
          >
            <X size={22} strokeWidth={1.8} />
          </button>

          <img src={lightboxUrl} alt="Campaign photo" onMouseDown={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
