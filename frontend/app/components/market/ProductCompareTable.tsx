"use client";
import { ProductViewModel } from "@/app/types/product/product";
import { useMemo } from "react";


function group(p: any) {
  const m = new Map<string, string[]>();

  if (Array.isArray(p?.filterRelations)) {
    for (const r of p.filterRelations) {
      const key = r?.filterTitle || r?.filter?.title || "—";
      const val = r?.optionTitle || r?.option?.title || r?.value || "";
      if (!val) continue;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(val);
    }
  }
  if (Array.isArray(p?.filters)) {
    for (const f of p.filters) {
      const key = f?.title || "—";
      const opts = (Array.isArray(f?.options) ? f.options : [])
        .filter((o: any) => o?.selected ?? true)
        .map((o: any) => o?.title)
        .filter(Boolean);
      if (opts.length) {
        if (!m.has(key)) m.set(key, []);
        m.set(key, [...(m.get(key) || []), ...opts]);
      }
    }
  }
  const obj: Record<string, string> = {};
  for (const [k, arr] of m.entries()) obj[k] = Array.from(new Set(arr)).join("، ");
  return obj;
}

export default function ProductCompareTable({
  left,
  right,
}: {
  left: ProductViewModel;
  right: ProductViewModel;
}) {
  const L = useMemo(() => group(left), [left]);
  const R = useMemo(() => group(right), [right]);

  const allKeys = useMemo(() => {
    const set = new Set<string>([...Object.keys(L), ...Object.keys(R)]);
    return Array.from(set);
  }, [L, R]);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-2 gap-px bg-gray-200 text-sm font-medium">
        <div className="bg-white p-3">
          {left.brandTitle} — {left.modelName}
          {left.description ? (
            <div className="mt-2 text-xs text-gray-600 whitespace-pre-line break-words">
              {left.description}
            </div>
          ) : null}
        </div>
        <div className="bg-white p-3">
          {right.brandTitle} — {right.modelName}
          {right.description ? (
            <div className="mt-2 text-xs text-gray-600 whitespace-pre-line break-words">
              {right.description}
            </div>
          ) : null}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {allKeys.map((k) => {
          const lv = L[k] ?? "—";
          const rv = R[k] ?? "—";
          const diff = lv !== rv;
          return (
            <div key={k} className="grid grid-cols-3 items-start">
              <div className="p-3 text-xs text-gray-500 bg-gray-50">{k}</div>
              <div className={`p-3 text-sm ${diff ? "bg-yellow-50" : ""}`}>{lv}</div>
              <div className={`p-3 text-sm ${diff ? "bg-yellow-50" : ""}`}>{rv}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
