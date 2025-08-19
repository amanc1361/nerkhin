"use client";

import { Category } from "@/app/types/category/categoryManagement";
import { MarketMessages } from "@/lib/server/texts/marketMessages";
import SearchBar from "../../shared/SearchBar";
import CategoryGrid from "../../shared/CategoryGrid";
import { useCategories } from "@/app/hooks/useCategories";


export default function SearchClient({
  t,
  role,
  initialCategories,
  initialQuery = "",
}: {
  t: MarketMessages;
  role: "wholesaler" | "retailer";
  initialCategories: Category[];
  initialQuery?: string;
}) {
  const { categories, loading, error } = useCategories();

  return (
    <div className="pb-24">
      <SearchBar t={t} role={role} initialQuery={initialQuery} />

      {error ? (
        <div className="text-center text-red-500 mt-6">{t.errorState}</div>
      ) : loading ? (
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6 my-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center text-gray-400 mt-6">{t.emptyState}</div>
      ) : (
        <CategoryGrid categories={categories} role={role} />
      )}

      {/* اختیاری: دکمه رفرش */}
      {/* <div className="text-center mt-4">
        <button onClick={refresh} className="text-sm px-3 py-1.5 rounded-lg border">
          رفرش
        </button>
      </div> */}
    </div>
  );
}
