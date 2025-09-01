"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProductGallery({ images, alt = "" }: { images: string[]; alt?: string }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  if (!images?.length) return null;

  // اسلاید خودکار هر 2 ثانیه
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // شروع محو شدن
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % images.length);
        setFade(true); // ظاهر شدن تصویر جدید
      }, 400); // مدت محو شدن
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="w-full">
      <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
        <Image
          key={idx} // باعث رندر مجدد می‌شود
          src={images[idx]}
          alt={alt}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 640px"
          className={`object-cover transition-opacity duration-500 ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <div className="flex items-center justify-center gap-2 mt-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === idx ? "bg-gray-800" : "bg-gray-300"
            }`}
            aria-label={`image-${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
