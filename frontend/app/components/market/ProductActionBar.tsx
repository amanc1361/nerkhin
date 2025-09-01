"use client";

export default function ProductActionBar({
  t,
  onSpecs,
  onCompare,
  onLike,
}: {
  t: { specs: string; compare: string; favorite: string };
  onSpecs?: () => void;
  onCompare?: () => void;
  onLike?: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 my-4">
      <button onClick={onSpecs} className="border rounded-xl py-2 text-sm">
        {t.specs}
      </button>
      <button onClick={onCompare} className="border rounded-xl py-2 text-sm">
        {t.compare}
      </button>
      <button onClick={onLike} className="border rounded-xl py-2 text-sm">
        {t.favorite}
      </button>
    </div>
  );
}
