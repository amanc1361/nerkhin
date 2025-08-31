"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMarketSearch } from "@/app/hooks/useMarketSearch";
import type { MarketItemVM } from "@/app/types/userproduct/market";
import type { MarketMessages } from "@/lib/server/texts/marketMessages";

import Pagination from "@/app/components/shared/Pagination";
import { useIntersection } from "@/app/hooks/useIntersection";
import MarketProductItem from "./MarketProductItem";
import { Search } from "lucide-react";
import Link from "next/link";

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

  // مقدار قابل ویرایشِ ورودی کاربر
  const [text, setText] = useState(initialQuery || "");

  // ← فقط categoryId را مستقیماً از URL بخوان
  const catId = useMemo(() => {
    const raw = sp.get("categoryId") ?? sp.get("CategoryID");
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [sp]);

  // جستجو (CSR) — بدون تغییر در شکل پارامترهای قبلی
  const { data, loading, setPage, page, setQuery, query } = useMarketSearch(
    {
      limit: 20,
      sortBy: "updated",
      sortUpdated: "desc",
      onlyVisible: true,
      search: initialQuery || "",
      categoryId: catId, // ⬅️ فقط این را اضافه کردیم
    },
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

  // همگام با URL (هر بار q یا categoryId عوض شد)
  useEffect(() => {
    const q = sp.get("q") || "";
    const raw = sp.get("categoryId") ?? sp.get("CategoryID");
    const n = raw ? Number(raw) : undefined;
    setText(q);
    setQuery((prev) => ({
      ...prev,
      search: q,
      categoryId: n && n > 0 ? n : undefined, // ⬅️ فقط همین
      offset: 0,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // هنگام جستجوی جدید، categoryId فعلی URL حفظ شود
    const params = new URLSearchParams();
    if (text) params.set("q", text);
    if (catId) params.set("categoryId", String(catId));
    router.replace(`/${role}/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const limit = query.limit || 20;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((data.total || 0) / limit)),
    [data.total, limit]
  );

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
        <div className="flex  items-center gap-2 py-3">
        
          <form onSubmit={submit} className="flex w-full">
            <div className="flex w-full items-center gap-2 rounded-2xl border px-3 py-2 bg-white shadow-sm">
               
              <input value={text} onChange={(e) => setText(e.target.value)} className="w-full outline-none bg-transparent text-sm" placeholder={t.search.placeholder} dir="rtl" />
              <Search></Search>
            </div>
            <Link href="#" className="text-blue-500 w-40 px-4 py-2">فیلتر نتایج</Link>
          </form>
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

      {/* دسکتاپ: صفحه‌بندی با Pagination */}
      <section className="hidden md:block pt-4">
        {loading && <div className="py-4 text-center text-gray-500">{t.common.loading}</div>}
        {!loading && data.items.length === 0 && <div className="text-center text-gray-500 py-8">{t.list.empty}</div>}

        <ul className="flex flex-col divide-y">
          {data.items.map((item) => <MarketProductItem key={item.id} item={item} t={t} />)}
        </ul>

        <div className="mt-4 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </section>
    </main>
  );
}
