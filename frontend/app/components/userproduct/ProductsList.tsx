"use client";

import { UserProductVM } from "@/app/types/userproduct/userProduct";
import UserProductItem from "./UserProductItem";
import { UserProductMessages } from "@/lib/server/texts/userProdutMessages";

type Props = {
  items: UserProductVM[];
  messages: UserProductMessages;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleVisible: (id: number) => void;
};

export default function ProductsList({
  items, messages, onEdit, onDelete, onToggleVisible,
}: Props) {
  if (!items?.length) return null;

  return (
    <div dir="rtl" className="space-y-3 mt-2">
      {/* هدر: فقط «کالا | ترتیب» (بدون ارز) */}
      <div className="flex items-center px-2 text-[12px] text-neutral-500">
        <div className="flex-1">کالا</div>
        <div className="w-10 text-center">ترتیب</div>
      </div>

      {items.map((it) => (
        <UserProductItem
          key={it.id}
          item={it}
          messages={messages}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleVisible={onToggleVisible}
        />
      ))}
    </div>
  );
}
