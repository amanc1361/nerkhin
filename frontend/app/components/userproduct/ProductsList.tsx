// app/[role]/products/_components/ProductsList.tsx
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
  items,
  messages,
  onEdit,
  onDelete,
  onToggleVisible,
}: Props) {
  if (!items?.length) return null;

  return (
    <div className="space-y-2">
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
