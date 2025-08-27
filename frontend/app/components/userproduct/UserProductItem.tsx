// app/[role]/products/_components/UserProductItem.tsx
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
  messages: UserProductMessages; // 👈 به‌جای ReturnType<...>
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleVisible: (id: number) => void;
};

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

  return (
    <div className="rounded-2xl border p-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center overflow-hidden">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs opacity-60">img</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="font-medium text-[13px] leading-5 line-clamp-1">{title}</div>
            {item.isVisible === false ? (
              <span className="text-[11px] text-rose-500">{messages.item.hidden}</span>
            ) : null}
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="text-[12px] text-neutral-500">
              {item.finalPrice ? Number(item.finalPrice).toLocaleString() : "—"}
            </div>

            <div className="flex items-center gap-4 text-[12px]">
              <button onClick={() => onEdit(item.id)} className="text-purple-600">
                {messages.item.edit}
              </button>
              <button onClick={() => onDelete(item.id)} className="text-rose-600">
                {messages.item.delete}
              </button>
              <button onClick={() => onToggleVisible(item.id)} className="text-fuchsia-600">
                {item.isVisible === false ? messages.item.show : messages.item.hide}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
