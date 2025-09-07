"use client";
import type { MarketItemVM } from "@/app/types/userproduct/market";
import PersianDate from "@/app/utils/persiadate";
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
  role: Role;
}) {
  return (
    <li className="py-3">
      <Link
        href={`/${role}/product/${item.productId}`}
        className="block w-full hover:bg-gray-50 rounded-lg p-2 transition"
      >
        <div className="flex  w-full items-start gap-3 overflow-hidden">
          {/* تصویر */}
          <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
            <Image
              src={`https://nerkhin.com/uploads/${item.productId}/1.webp`}
              alt={String(item.productId)}
              width={56}
              height={56}
              className="object-cover w-14 h-14"
              sizes="56px"
            />
          </div> 

          {/* متن‌ها */}
          <div className="flex flex-col   w-full">
            <div className="text-gray-700 truncate leading-6 break-words">
              {item.categoryTitle} {item.brandTitle}
              <span className="[direction:ltr] text-sm [unicode-bidi:isolate] break-all px-1 align-baseline">
                {item.modelName}
              </span>
            </div>

            <div className="font-semibold text-gray-900 truncate">
              {Number.isFinite(Number(item.finalPrice))
                ? Number(item.finalPrice).toLocaleString("fa-IR")
                : item.finalPrice}
              <span> تومان</span>
            </div>
           <div className="flex w-full justify-between  items-center gap-2">

            <div className="text-xs text-gray-500 mt-2 truncate">
              {item.shopName} • {item.cityName}
            </div>
               {/* تاریخ */}
          <div className="shrink-0 w-16 text-xs text-gray-500 text-left">
            <PersianDate value={item.updatedAt} />
          </div> 
           </div>
          </div>

          
        </div>
      </Link>
    </li>
  );
}
