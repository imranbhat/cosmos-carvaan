"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";

interface Photo {
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
}

export default function ImageGallery({
  photos,
  alt,
  inspectionStatus,
}: {
  photos: Photo[];
  alt: string;
  inspectionStatus: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const primaryIdx = photos.findIndex((p) => p.isPrimary);
    return primaryIdx >= 0 ? primaryIdx : 0;
  });

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={photos[currentIndex].url}
          alt={alt}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
        {photos.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        {inspectionStatus === "passed" && (
          <span className="absolute top-3 left-3 bg-success text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Inspected
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, index) => (
            <div
              key={index}
              onClick={() => goTo(index)}
              className={`relative w-24 h-18 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${
                index === currentIndex
                  ? "border-primary"
                  : "border-transparent hover:border-border"
              }`}
            >
              <Image
                src={photo.thumbnailUrl}
                alt={`Photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
