"use client";
import { useState } from "react";
import { FileText } from "lucide-react";

// Resource thumbnail with a friendly fallback when there is no image
// or the image fails to load.
export default function Thumb({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`grid place-items-center bg-gradient-to-br from-brand/80 via-pop/70 to-sun/80 text-on-accent ${className}`}
        role="img"
        aria-label={alt}
      >
        <FileText size={44} strokeWidth={1.75} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
