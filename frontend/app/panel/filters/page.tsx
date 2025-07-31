"use client";

import { FilterList } from "@/app/components/panel/filters/FilterList";
import { useSearchParams } from "next/navigation";


export default function FiltersPage() {
  const params  = useSearchParams();
  const categoryId = Number(params.get("categoryId") || 0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">مدیریت فیلترها</h1>
      <FilterList categoryId={categoryId} />
    </div>
  );
}
