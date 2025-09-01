"use client";

export default function ProductActionBar({
  t,
  onSpecs,
  onCompare,
  onLike,
  isFavorite = false,
  loading = false,
}: {
  t: { specs: string; compare: string; favorite: string };
  onSpecs?: () => void;
  onCompare?: () => void;
  onLike?: () => void;
  isFavorite?: boolean;   // ← اضافه شد
  loading?: boolean;      // ← اضافه شد
}) {
  return (
    <div className="grid grid-cols-3 gap-3 my-4">
      <button
        type="button"
        onClick={onSpecs}
        className="border rounded-xl py-2 text-sm"
      >
        {t.specs}
      </button>

      <button
        type="button"
        onClick={onCompare}
        className="border rounded-xl py-2 text-sm"
      >
        {t.compare}
      </button>

      <button
        type="button"
        onClick={onLike}
        disabled={loading}
        aria-pressed={isFavorite}
        className="border rounded-xl py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4"
          role="img"
          aria-hidden="true"
        >
          <path
            d="M12 21s-6.7-4.35-9.33-7.2C.9 11.82 1.06 8.5 3.4 6.7 5.2 5.28 7.8 5.6 9.3 7.2L12 10l2.7-2.8c1.5-1.6 4.1-1.92 5.9-.5 2.34 1.8 2.5 5.12.73 7.1C18.7 16.65 12 21 12 21z"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <span>{t.favorite}</span>
      </button>
    </div>
  );
}
