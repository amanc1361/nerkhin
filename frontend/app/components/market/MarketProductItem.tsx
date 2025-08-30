"use client";
import type { MarketItemVM } from "@/app/types/userproduct/market";
import type { MarketMessages } from "@/lib/server/texts/marketMessages";

export default function MarketProductItem({ item, t }: { item: MarketItemVM; t: MarketMessages }) {
  const shortDate = (iso?: string) => (iso ? `${iso.slice(5,7)}/${iso.slice(8,10)}` : "");
  return (
    <li className="py-3">
      <div className="flex items-center gap-3">
        <div className="w-12 text-xs text-gray-500">{shortDate(item.updatedAt)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900">
                {Number.isFinite(Number(item.finalPrice)) ? Number(item.finalPrice).toLocaleString("fa-IR") : item.finalPrice}
                {item.isDollar ? ` ${t.money.usdShort}` : ""}
              </div>
              <div className="text-gray-700 truncate">
                {item.brandTitle} {t.common.of} {item.modelName}
              </div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</div>
              <div className="flex items-center gap-4 text-sm text-blue-700 mt-2">
                <button className="hover:opacity-80">{t.action.compare}</button>
                <button className="hover:opacity-80">{t.action.like}</button>
                <button className="hover:opacity-80" aria-label={t.action.bookmark}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 inline-block align-[-2px]">
                    <path d="M6 3h12v18l-6-4-6 4z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.modelName} className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-400">
                  <path d="M3 5h18v14H3zM7 13l3 3 4-5 3 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">{item.shopName} • {item.cityName}</div>
        </div>
      </div>
    </li>
  );
}
