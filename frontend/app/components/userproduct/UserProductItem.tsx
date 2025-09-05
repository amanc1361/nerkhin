// app/components/userproduct/UserProductItem.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { UserProductView } from "@/app/types/userproduct/userProduct";
import { UserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { formatMoneyInput } from "../shared/MonyInput";
import Up from "../icon-components/Up";
import Down from "../icon-components/Down";
import PersianDate from "@/app/utils/persiadate";

/* آدرس تصویر را مطلق کن (host + prefix) */
function absolutizeUploads(imageUrl?: string | null) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerkhin.com").replace(/\/+$/, "");
  const prefix = "/" + (process.env.NEXT_PUBLIC_FILE_PREFIX || "uploads").replace(/^\/+/, "");
  const clean = imageUrl.replace(/^\/+/, "");
  return clean.startsWith("uploads/") ? `${host}/${clean}` : `${host}${prefix}/${clean}`;
}




function pick(item: any) {
  const p = item?.product ?? {};
  const category = item?.productCategory ?? p?.categoryTitle ?? "";
  const brand    = item?.productBrand    ?? p?.brandTitle    ?? "";
  const model    = item?.modelName ?? item?.productModel ?? p?.modelName ?? p?.title ?? "";
  const title    = [category, brand && ` ${brand}`, model && `  ${model}`].filter(Boolean).join("");
  const imgRel   = p?.imageUrl ?? item?.defaultImageUrl ?? "";
  const final    = item?.finalPrice ?? "";
  const hidden   = item?.isVisible === false || item?.isHidden === true;
  const productId = p?.id ?? item?.productId ?? item?.id ?? null;
  return { title, imgRel, final, hidden, productId };
}

/* لیست کاندیدهای تصویر با fallbackهای منطقی */
function buildImageCandidates(imgRel?: string | null, productId?: number | null) {
  const list: string[] = [];
  const abs = absolutizeUploads(imgRel || "");
  if (abs) list.push(abs);
  if (productId) {
    const host = (process.env.NEXT_PUBLIC_FILE_HOST || "https://nerkhin.com").replace(/\/+$/, "");
    const base = `${host}/uploads/${productId}`;
    ["1.webp"].forEach((name) => list.push(`${base}/${name}`));
  }
  return Array.from(new Set(list));
}

type Props = {
  item: UserProductView;
  messages: UserProductMessages;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleVisible: (id: number) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  disabled?: boolean;
  showAction?:boolean;
};

export default function UserProductItem({
  item, messages, onEdit, onDelete, onToggleVisible, onMoveUp, onMoveDown, disabled = false,showAction=true
}: Props) {
  const { title, imgRel, final, hidden, productId } = pick(item as any);
  const dateFa = item.createdAt;
  const price  = final ? formatMoneyInput(String(final), false) : "—";

  const candidates = useMemo(() => buildImageCandidates(imgRel, productId), [imgRel, productId]);
  const [imgIdx, setImgIdx] = useState(0);
  const src = candidates[imgIdx] || null;
  const UNOPTIMIZED = process.env.NEXT_PUBLIC_IMAGE_UNOPTIMIZED === "1";

  return (
    <div className={`border-b pb-3 ${hidden ? "opacity-60" : ""}`} dir="rtl" aria-hidden={hidden}>
      {/* ===== بالا ===== */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-md bg-neutral-200 overflow-hidden shrink-0 relative">
            {src ? (
              <Image
                src={src}
                alt={title || "product"}
                width={64}
                height={64}
                className="w-16 h-16 object-cover rounded-md"
                loading="lazy"
                unoptimized={UNOPTIMIZED}
                onError={() => {
                  setImgIdx((i) => (i + 1 < candidates.length ? i + 1 : i));
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-md bg-neutral-300" />
            )}
            {hidden && (
              <span className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-white">
                {messages?.item?.hiddenBadge}
              </span>
            )}
          </div>

          <div className="text-right">
            <div className="text-[13px] font-semibold text-neutral-900">{price + " تومان "}</div>
            <div className="text-[13px] text-neutral-800 leading-5 line-clamp-2">{title}</div>
          </div>
        </div>
        <div className="text-[11px] text-neutral-400">
          <PersianDate value={dateFa??""}></PersianDate>
        </div>
      </div>

      {/* ===== پایین ===== */}
      
      {showAction && <div className="mt-2 flex items-center">
        {/* چپ: Up/Down (فقط ترایگر؛ جابه‌جایی در والد) */}
        <div className="flex items-center gap-4">
     
          <button
            onClick={() => onMoveUp(item.id)}
            className="disabled:opacity-50"
            disabled={disabled}
            aria-label={messages?.item?.moveUp}
            title={messages?.item?.moveUp}
          >
            <Up />
          </button>
          <button
            onClick={() => onMoveDown(item.id)}
            className="disabled:opacity-50"
            disabled={disabled}
            aria-label={messages?.item?.moveDown}
            title={messages?.item?.moveDown}
          >
            <Down />
          </button>
        </div>

        <div className="ms-auto" />

        {/* راست: ویرایش | حذف | عدم نمایش */}
        <div className="flex items-center gap-4 text-[12px]">
          <button
            onClick={() => onEdit(item.id)}
            className="text-fuchsia-600 hover:underline inline-flex items-center gap-1 disabled:opacity-50"
            disabled={disabled}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" fill="none" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 17.25V20h2.75L17 9.75l-2.75-2.75L4 17.25z" />
            </svg>
            {messages?.item?.edit}
          </button>

          <button
            onClick={() => onDelete(item.id)}
            className="text-rose-700 hover:underline inline-flex items-center gap-1 disabled:opacity-50"
            disabled={disabled}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" stroke="currentColor" fill="none" strokeWidth="1.8" aria-hidden="true">
              <path d="M3 6h18M8 6l1-2h6l1 2M6 6v14a2 2 0 002 2h8a2 2 0 002-2V6" />
            </svg>
            {messages?.item?.delete}
          </button>

          <button
            onClick={() => onToggleVisible(item.id)}
            className="text-rose-600 font-semibold hover:underline disabled:opacity-50"
            disabled={disabled}
          >
            {hidden ? messages?.item?.show : messages?.item?.hide}
          </button>
        </div>
      </div>
}
    </div>
      
  );
}
