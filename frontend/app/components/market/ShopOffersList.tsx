"use client";

import { useMemo, useState } from "react";
import type { ProductShop } from "@/app/types/userproduct/ProductInfoViewModel";
import ShopOfferItem from "./ShopOfferItem";
import Link from "next/link";
type Role = "wholesaler" | "retailer";

type Messages = {
  sellerCountTemplate: string; // مثل: "تعداد فروشنده: {n}"
  call: string;                // "تماس"
  city: string;     
       // "شهر"
};

type Props = {
  t: Messages;
  items: ProductShop[];
  role:Role; 
};


function replaceFaDigits(s: string) {
  // تبدیل ارقام فارسی/عربی به انگلیسی
  const fa = "۰۱۲۳۴۵۶۷۸۹";
  const ar = "٠١٢٣٤٥٦٧٨٩";
  return s.replace(/[۰-۹٠-٩]/g, (d) => {
    const iFa = fa.indexOf(d);
    if (iFa > -1) return String(iFa);
    const iAr = ar.indexOf(d);
    return iAr > -1 ? String(iAr) : d;
  });
}

function priceToNumber(p: string | number): number {
  if (typeof p === "number") return p;
  const clean = replaceFaDigits(p).replace(/[^\d.]/g, "");
  const n = parseFloat(clean);
  return Number.isFinite(n) ? n : 0;
}

export default function ShopOffersList({ t, items,role }: Props) {
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    const copy = [...(items || [])];
    copy.sort((a, b) => {
      const pa = priceToNumber(a.finalPrice);
      const pb = priceToNumber(b.finalPrice);
      return sortDir === "asc" ? pa - pb : pb - pa;
    });
    return copy;
  }, [items, sortDir]);

  const sellerCountTxt = t.sellerCountTemplate.replace(
    /\{n\}/g,
    String(items?.length ?? 0)
  );

  return (
    <section className="mt-4">
      {/* هدر: تعداد فروشنده + کنترل مرتب‌سازی */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-500">{sellerCountTxt}: {items.length}</div>

        <div className="flex items-center gap-2">
         
          <div className="inline-flex rounded-full border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setSortDir("asc")}
              className={`px-3 py-1 text-xs ${
                sortDir === "asc" ? "bg-gray-100 font-medium" : ""
              }`}
            >
              صعودی
            </button>
            <button
              type="button"
              onClick={() => setSortDir("desc")}
              className={`px-3 py-1 text-xs ${
                sortDir === "desc" ? "bg-gray-100 font-medium" : ""
              }`}
            >
              نزولی
            </button>
          </div>
        </div>
      </div>

      {/* لیست آیتم‌ها */}
      <div className="divide-y divide-gray-100">
        {sorted.map((it) => (
          <Link href={`/${role}/shop/${it.userId}`} key={it.id} >
             <ShopOfferItem key={it.id} t={t} item={it}  />
          </Link>
        ))}
      </div>
    </section>
  );
}
