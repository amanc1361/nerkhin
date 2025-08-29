// app/components/userproduct/UserProductItem.tsx
"use client";

import Image from "next/image";
import { UserProductVM } from "@/app/types/userproduct/userProduct";
import { UserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { formatMoneyInput } from "../shared/MonyInput";

/* آدرس تصویر را مطلق کن */
function absolutizeUploads(imageUrl?: string | null) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerkhin.com").replace(/\/+$/, "");
  const prefix = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "");
  const clean = imageUrl.replace(/^\/+/, "");
  return clean.startsWith("uploads/") ? `${host}/${clean}` : `${host}${prefix}/${clean}`;
}

/* تاریخ کوتاه (fallback به createdAt در قالب MM/DD) */
function shortDate(item: any) {
  if (item?.dateFa) return String(item.dateFa);
  const iso = item?.createdAt;
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${m}/${day}`;
  } catch { return ""; }
}

/* استخراج امن فیلدها (سازگار با ساختار قدیم/جدید) */
function pick(item: any) {
  const p = item?.product ?? {};
  const category = item?.productCategory ?? p?.categoryTitle ?? "";
  const brand    = item?.productBrand    ?? p?.brandTitle    ?? "";
  const model    = item?.modelName ?? item?.productModel ?? p?.modelName ?? p?.title ?? "";
  const title    = [category, brand && ` ${brand}`, model && ` - ${model}`].filter(Boolean).join("");
  const img      = absolutizeUploads(p?.imageUrl ?? item?.defaultImageUrl ?? "");
  const final    = item?.finalPrice ?? "";
  const hidden   = item?.isVisible === false || item?.isHidden === true;
  return { title, img, final, hidden };
}

type Props = {
  item: UserProductVM;
  messages: UserProductMessages;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleVisible: (id: number) => void;
};

export default function UserProductItem({
  item, messages, onEdit, onDelete, onToggleVisible,
}: Props) {
  const { title, img, final, hidden } = pick(item as any);
  const dateFa = shortDate(item as any);
  const price  = final ? formatMoneyInput(String(final), false) : "—";

  return (
    <div className="border-b pb-3" dir="rtl">
      {/* ===== بالا: [گروه راست = تصویر + (قیمت بالا / عنوان پایین)] | [گروه چپ = تاریخ] ===== */}
      <div className="flex items-center justify-between gap-2">
        {/* گروه راست: تصویر «لبه راست» + ستون متن‌ها؛ عموداً وسط‌چین */}
        <div className="flex  items-center gap-3">
          {/* تصویر — لبه راست */}
         
          <div className="w-12 h-12 rounded-md bg-neutral-200 overflow-hidden">
       
              <Image
              
                src={"https://nerkhin.com/uploads/"+item.product?.id+"/"+"1.webp"}
                alt={title || "product"}
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-md"
                /* اگر دامنه فایل در next.config نیست، موقتاً این را اضافه کن: unoptimized */
                // unoptimized
              />
         
          </div>

          {/* قیمت (بالا) و عنوان (پایین) — هر دو راست‌چین */}
          <div className="text-right">
            <div className="text-[13px] font-semibold text-neutral-900">{price}</div>
            <div className="text-[13px] text-neutral-800 leading-5 line-clamp-2">{title}</div>
       
          </div>
        </div>

        {/* گروه چپ: تاریخ ریز */}
        <div className="text-[11px] text-neutral-400">{dateFa}</div>
      </div>

      {/* ===== پایین: راست = اکشن‌ها | چپ = فلش‌های ترتیب ===== */}
      <div className="mt-2 flex items-center">
        {/* چپ: فلش‌ها */}
        <div className="flex items-center gap-4">
          {/* ↓ صورتی */}
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-pink-600" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* ↑ بنفش */}
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-fuchsia-600" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* فاصله‌دهنده برای چسباندن اکشن‌ها به راست */}
        <div className="ms-auto" />

        {/* راست: ویرایش | حذف | عدم نمایش */}
        <div className="flex items-center gap-4 text-[12px]">
          <button onClick={() => onEdit(item.id)} className="text-fuchsia-600 hover:underline inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" fill="none" strokeWidth="1.8">
              <path d="M4 17.25V20h2.75L17 9.75l-2.75-2.75L4 17.25z" />
            </svg>
            {messages.item.edit}
          </button>

          <button onClick={() => onDelete(item.id)} className="text-rose-700 hover:underline inline-flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" fill="none" strokeWidth="1.8">
              <path d="M3 6h18M8 6l1-2h6l1 2M6 6v14a2 2 0 002 2h8a2 2 0 002-2V6" />
            </svg>
            {messages.item.delete}
          </button>

          <button onClick={() => onToggleVisible(item.id)} className="text-rose-600 font-semibold hover:underline">
            {hidden ? messages.item.show : messages.item.hide}
          </button>
        </div>
      </div>
    </div>
  );
}
