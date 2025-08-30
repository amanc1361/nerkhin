"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMarketSearch } from "@/app/hooks/useMarketSearch";
import type { MarketItemVM } from "@/app/types/userproduct/market";
import type { MarketMessages } from "@/lib/server/texts/marketMessages";


// ⚠️ همونی که از قبل داری:
import Pagination from "@/app/components/shared/Pagination";
import { useIntersection } from "@/app/hooks/useIntersection";
import MarketProductItem from "./MarketProductItem";

type Role = "wholesaler" | "retailer";

export default function SearchResultsClient({
  role,
  initialQuery,
  t,
}: {
  role: Role;
  initialQuery: string;
  t: MarketMessages;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [text, setText] = useState(initialQuery || "");

  // جستجو (CSR)
  const { data, loading, setPage, page, setQuery, query } = useMarketSearch(
    { limit: 20, sortBy: "updated", sortUpdated: "desc", onlyVisible: true, search: initialQuery || "" },
    "fa"
  );

  // — موبایل: مرج برای اسکرول بی‌نهایت —
  const [mergedItems, setMergedItems] = useState<MarketItemVM[]>([]);
  useEffect(() => {
    if ((query.offset ?? 0) === 0) setMergedItems(data.items);
  }, [data.items, query.offset]);
  useEffect(() => {
    const first = (query.offset ?? 0) === 0;
    if (!first && data.items.length) {
      setMergedItems((prev) => {
        const map = new Map(prev.map((x) => [x.id, x]));
        data.items.forEach((it) => map.set(it.id, it)); // de-dup
        return Array.from(map.values());
      });
    }
  }, [data.items, query.offset]);

  // همگام با URL
  useEffect(() => {
    const q = sp.get("q") || "";
    setText(q);
    setQuery((prev) => ({ ...prev, search: q, offset: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.replace(`/${role}/search${text ? `?q=${encodeURIComponent(text)}` : ""}`);
  };

  const limit = query.limit || 20;
  const totalPages = useMemo(() => Math.max(1, Math.ceil((data.total || 0) / limit)), [data.total, limit]);

  // — موبایل: اسکرول بی‌نهایت —
  const hasMore = page * limit < (data.total || 0);
  const loadNext = useCallback(() => {
    if (!loading && hasMore) setPage(page + 1);
  }, [loading, hasMore, page, setPage]);
  const sentinelRef = useIntersection(loadNext, !hasMore);

  return (
    <main className="max-w-screen-lg mx-auto px-3 pb-20" dir="rtl">
      {/* Header + Search */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="flex items-center gap-2 py-3">
          <button onClick={() => router.push(`/${role}`)} aria-label={t.action.back} className="p-2 rounded-xl border hover:bg-gray-50">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <form onSubmit={submit} className="flex-1">
            <div className="flex items-center gap-2 rounded-2xl border px-3 py-2 bg-white shadow-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0"><path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 0l9 9" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
              <input value={text} onChange={(e) => setText(e.target.value)} className="w-full outline-none bg-transparent text-sm" placeholder={t.search.placeholder} dir="rtl" />
              <button className="px-3 py-1 rounded-xl bg-gray-900 text-white text-sm">{t.action.search}</button>
            </div>
          </form>
        </div>
        <div className="flex items-center gap-3 py-2 text-sm text-gray-600">
          <button className="px-2 py-1 rounded-lg hover:bg-gray-100">{t.search.filters}</button>
          <button className="px-2 py-1 rounded-lg hover:bg-gray-100">{t.search.pickCity}</button>
          <button className="px-2 py-1 rounded-lg hover:bg-gray-100">{t.search.export}</button>
        </div>
      </header>

      {/* موبایل: اسکرول بی‌نهایت */}
      <section className="md:hidden pt-3">
        {mergedItems.length === 0 && !loading && <div className="text-center text-gray-500 py-8">{t.list.empty}</div>}
        <ul className="flex flex-col divide-y">
          {mergedItems.map((item) => <MarketProductItem key={item.id} item={item} t={t} />)}
        </ul>
        {loading && <div className="py-4 text-center text-gray-500">{t.common.loading}</div>}
        {hasMore && <div ref={sentinelRef} className="h-10" />}
      </section>

      {/* دسکتاپ: صفحه‌بندی با Pagination خودت */}
      <section className="hidden md:block pt-4">
        {loading && <div className="py-4 text-center text-gray-500">{t.common.loading}</div>}
        {!loading && data.items.length === 0 && <div className="text-center text-gray-500 py-8">{t.list.empty}</div>}

        <ul className="flex flex-col divide-y">
          {data.items.map((item) => <MarketProductItem key={item.id} item={item} t={t} />)}
        </ul>

        <div className="mt-4 flex justify-center">
          {/* اگر API کامپوننت شما فرق می‌کند، این ۴ پراپ را مطابق خودش تنظیم کن */}
          <Pagination
            currentPage={page}
            
            totalPages={data.total}
          
          />
          {/*
            نمونه‌های رایج:
            <Pagination currentPage={page} pageSize={limit} totalItems={data.total} onPageChange={setPage} />
            یا:
            <Pagination value={page} total={totalPages} onChange={(p)=>setPage(p)} />
          */}
        </div>
      </section>
    </main>
  );
}
