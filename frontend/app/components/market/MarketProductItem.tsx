"use client";
import type { MarketItemVM } from "@/app/types/userproduct/market";
import type { MarketMessages } from "@/lib/server/texts/marketMessages";
import Image from "next/image";


export default function MarketProductItem({ item, t }: { item: MarketItemVM; t: MarketMessages }) {
  const shortDate = (iso?: string) => (iso ? `${iso.slice(5,7)}/${iso.slice(8,10)}` : "");
  return (
    <li className="py-3">
      <div className="flex items-center gap-3">
        <div className="flex flex-row justify-between w-full">
          <div className="flex  gap-3">
            <div className="flex flex-row gap-2">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
              <Image
               src={"https://nerkhin.com/uploads/"+ item.productId+"/1.webp"}
               alt={item.id.toString()}
               width={64}
               height={64}
              ></Image> 
             
            </div>
            <div className="flex flex-col">

             
              <div  className="text-gray-700 truncate">
                {item.categoryTitle} {" "}{item.brandTitle} 
                    <span className="[direction:ltr] [unicode-bidi:isolate] px-1 inline-block">

                  {item.modelName}
                 </span>
                  
                  
              </div>
              <div className="font-bold text-gray-900">
                {Number.isFinite(Number(item.finalPrice)) ? Number(item.finalPrice).toLocaleString("fa-IR") : item.finalPrice}
                <span> تومان  </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">{item.shopName} • {item.cityName}</div>
            </div>
           
            </div>
          
          </div>
              <div className="w-12 text-xs text-gray-500">{shortDate(item.updatedAt)}</div>
        
        </div>
      </div>
    </li>
  );
}
