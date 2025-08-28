"use client";

import Link from "next/link";
import { useState } from "react";
import type { Category } from "@/app/types/category/categoryManagement";
import Pagination from "@/app/components/shared/Pagination";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  items: Category[]; // فقط آیتم‌های همین صفحه
  currentPage: number;
  totalPages: number;
  fetchSubs: (parentId: number) => Promise<Category[]>;
  role: "wholesaler" | "retailer";
};

export default function CategoryPickerTable({
  items,
  currentPage,
  totalPages,
  fetchSubs,
  role,
}: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [subsMap, setSubsMap] = useState<Record<number, Category[]>>({});

  async function toggle(parent: Category) {
    if (expandedId === parent.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(parent.id);
    if (!subsMap[parent.id]) {
      const s = await fetchSubs(parent.id);
      setSubsMap((m) => ({ ...m, [parent.id]: s }));
    }
  }

  return (
    <div dir="rtl" className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-3 text-right"> </th>
            <th className="p-3 text-right"> </th>
            <th className="p-3 w-16 text-left"> </th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => {
            const isOpen = expandedId === c.id;
            const children = subsMap[c.id] || [];
            return (
              <tr key={c.id} className="border-b border-slate-100 align-top">
                <td className="p-3">{c.title}</td>
                <td className="p-3">
                  {isOpen && (
                    <div className="flex flex-wrap gap-2">
                      {children.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        children.map((s) => (
                          <Link
                            key={s.id}
                            href={`/${role}/products/create?subCategoryId=${s.id}`}
                            className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition text-[12px]"
                          >
                            {s.title}
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </td>
                <td className="p-3 text-left">
                  <button
                    onClick={() => toggle(c)}
                    className="rounded-lg p-2 hover:bg-slate-100 transition"
                    aria-label={isOpen ? "close" : "open"}
                  >
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* صفحه‌بندی دقیقاً با همان کامپوننت تو */}
      <div className="p-3">
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
