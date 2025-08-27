"use client";

import { UserProductVM } from "@/app/types/userproduct/userProduct";
import { UserProductMessages } from "@/lib/server/texts/userProdutMessages";

function absolutizeUploads(imageUrl?: string | null) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerkhin.com").replace(/\/+$/, "");
  const prefix = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "");
  const clean = imageUrl.replace(/^\/+/, "");
  return clean.startsWith("uploads/") ? `${host}/${clean}` : `${host}${prefix}/${clean}`;
}

type Props = {
  item: UserProductVM;
  messages: UserProductMessages;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleVisible: (id: number) => void;
};

function formatPrice(v: any) {
  if (v == null) return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  try {
    return n.toLocaleString("fa-IR");
  } catch {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "،");
  }
}

export default function UserProductItem({
  item,
  messages,
  onEdit,
  onDelete,
  onToggleVisible,
}: Props) {
  const title = `${item?.product?.brandTitle ?? ""}${
    item?.product?.brandTitle && item?.product?.modelName ? " - " : ""
  }${item?.product?.modelName ?? ""}`;

  const img = absolutizeUploads(item?.product?.imageUrl || null);
  const isHidden = item.isVisible === false;

  // اختیاری: اگر VM شما تاریخ کوتاه دارد (مثلاً dateFa: "05/03")
  const dateFa: string = (item as any)?.dateFa ?? "";

  return (
    <div className="border-b pb-3">
      <div className="flex items-start gap-2">
        {/* ستون “ارز” (نماد) — اگر isDollar داشتید */}
        <div className="w-10 text-center text-xs text-neutral-500 mt-1">
          {(item as any)?.isDollar ? "$" : "﷼"}
        </div>

        {/* ستون ترتیب (آیکن) */}
        <div className="w-12 flex items-center justify-center mt-1">
          <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" fill="none" strokeWidth="1.6">
            <path d="M8 7l4-4 4 4M16 17l-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* محتوای اصلی */}
        <div className="flex-1">
          <div className="flex items-start gap-2">
            {/* قیمت */}
            <div className="w-24 text-[13px] font-semibold text-neutral-900">
              {formatPrice(item.finalPrice)}
            </div>

            {/* تصویر */}
            <div className="w-12 h-12 rounded-md bg-neutral-200 flex items-center justify-center text-neutral-500 overflow-hidden">
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt="" className="w-12 h-12 object-cover rounded-md" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-6 h-6" stroke="currentColor" fill="none" strokeWidth="1.4">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M6 15l3-3 3 3 3-3 3 3" />
                  <circle cx="8" cy="9" r="1.2" />
                </svg>
              )}
            </div>

            {/* عنوان محصول */}
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-neutral-800 leading-5 line-clamp-2">
                {title}
              </div>
              {/* تاریخ کوچک (اختیاری) */}
              {dateFa ? (
                <div className="text-[11px] text-neutral-400 mt-0.5">{dateFa}</div>
              ) : null}
            </div>
          </div>

          {/* اکشن‌ها */}
          <div className="mt-2 flex items-center gap-3 text-[12px]">
            <button onClick={() => onEdit(item.id)} className="text-purple-700 hover:underline">
              {messages.item.edit}
            </button>
            <button onClick={() => onDelete(item.id)} className="text-rose-700 hover:underline">
              {messages.item.delete}
            </button>
            <button onClick={() => onToggleVisible(item.id)} className="text-fuchsia-600 hover:underline">
              {isHidden ? messages.item.show : messages.item.hide}
            </button>

            <div className="ml-auto text-neutral-500">
              <svg viewBox="0 0 24 24" className="w-5 h-5" stroke="currentColor" fill="none" strokeWidth="1.8">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* برچسب “عدم نمایش” اگر مخفی است */}
          {isHidden && (
            <div className="mt-1 text-[11px] text-rose-500">
              {messages.item.hidden}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
