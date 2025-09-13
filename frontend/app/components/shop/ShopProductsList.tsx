"use client";

import Image from "next/image";
import type { UserProductView } from "@/app/types/userproduct/userProduct";
import UserProductItem from "@/app/components/userproduct/UserProductItem"; // اگر داری، از همین استفاده می‌کنیم
  import { getUserProductMessages, type UserProductMessages } from "@/lib/server/texts/userProdutMessages";
import Link from "next/link";

function absolutize(url?: string | null) {
  if (!url) return "/images/placeholders/product.jpg";
  if (/^https?:\/\//i.test(url)) return url;
  const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerrkhin.com").replace(/\/+$/, "");
  const prefix = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "");
  const clean = String(url).replace(/^\/+/, "");
  return clean.startsWith("uploads/") ? `${host}/${clean}` : `${host}${prefix}/${clean}`;
}

export default function ShopProductsList({
  role,
  products,
}: {
  role: "wholesaler" | "retailer";
  products: UserProductView[];
}) {
  // اگر کارت آمادهٔ خودت هست، همون رو 
  // yاستفاده کن:
  const t=getUserProductMessages("fa");
  console.log(products)
  if (UserProductItem) {
    return (
      <div className="grid grid-cols-1 gap-3 mt-4">
        {products.map((p: UserProductView) => (
          
          <Link  key={p.productId} href={`/${role}/product/${p.productId}`} >
          <UserProductItem showAction={false} key={p.id} item={p} messages={t}  onEdit={()=>{}} onDelete={()=>{}} onToggleVisible={()=>{}} onMoveUp={()=>{}} onMoveDown={()=>{}}/>
          </Link>
        ))}
      </div>
    );
}

  // fallback سبک (در صورت نبودن UserProductItem)
  return (
    <div className="grid grid-cols-1 gap-3 mt-4">
      {products.map((p: any) => (
        <div key={p.id} className="flex gap-3 p-3 border rounded-2xl">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
            <Image src={absolutize(p?.defaultImageUrl)} alt={p?.modelName || ""} fill className="object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">{p?.productBrand ?? p?.brandTitle ?? "—"}</span>
              <span className="text-gray-400">|</span>
              <span>{p?.modelName ?? "—"}</span>
            </div>
            {p?.finalPrice && (
              <div className="mt-1 text-sm">
                {p?.isDollar ? `${p.finalPrice} $` : `${p.finalPrice} تومان`}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
