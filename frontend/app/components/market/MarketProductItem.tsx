"use client";
import type { MarketItemVM } from "@/app/types/userproduct/market";
import type { MarketMessages } from "@/lib/server/texts/marketMessages";
import Image from "next/image";
import Link from "next/link";

type Role = "wholesaler" | "retailer";

export default function MarketProductItem({
  item,
  t,
  role,
}: {
  item: MarketItemVM;
  t: MarketMessages;
  role: Role;                 // ← رول از پراپ
}) {
  const shortDate = (iso?: string) => (iso ? `${iso.slice(5, 7)}/${iso.slice(8, 10)}` : "");

  return (
    <li className="py-3">
      <Link
      
        href={`/${role}/product/${item.productId}`} // ← استفاده از prop
        className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition"
      >
        <div className="flex w-full justify-between">
          <div className="flex gap-3">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
              <Image
                src={`https://nerkhin.com/uploads/${item.productId}/1.webp`}
                alt={String(item.productId)}
                width={64}
                height={64}
                className="object-cover"
              />
            </div>

            <div className="flex flex-col">
              <div className="text-gray-700 truncate">
                {item.categoryTitle} {item.brandTitle}
                <span className="[direction:ltr] [unicode-bidi:isolate] px-1 inline-block">
                  {item.modelName}
                </span>
              </div>

              <div className="font-bold text-gray-900">
                {Number.isFinite(Number(item.finalPrice))
                  ? Number(item.finalPrice).toLocaleString("fa-IR")
                  : item.finalPrice}
                <span> تومان</span>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                {item.shopName} • {item.cityName}
              </div>
            </div>
          </div>

          <div className="w-12 text-xs text-gray-500">{shortDate(item.updatedAt)}</div>
        </div>
      </Link>
    </li>
  );
}
