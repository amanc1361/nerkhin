// app/components/userproduct/UserProductList.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { UserProductView, UpdateUserProductPayload, ChangeOrderPayload } from "@/app/types/userproduct/userProduct";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";

import UserProductItem from "./UserProductItem";
import UserProductDeleteModal from "./UserProductDeleteModal";
import UserProductEditModal from "./UserProductEditModal";
import { useUserProductActions } from "@/app/hooks/useuserProductAction";

type Props = {
  items: UserProductView[];
  subCategoryId: number;
  locale?: "fa" | "en";
  onRefresh?: () => void;
};

export default function UserProductList({ items, subCategoryId, locale = "fa", onRefresh }: Props) {
  const t = getUserProductMessages(locale);
  const [list, setList] = useState<UserProductView[]>(() => {
    const copied = [...items];
    copied.sort((a: any, b: any) => {
      const oa = (a as any).order_c ?? (a as any).orderC ?? 0;
      const ob = (b as any).order_c ?? (b as any).orderC ?? 0;
      return oa - ob;
    });
    return copied;
  });

  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<UserProductView | null>(null);

  const { isSubmitting, changeOrder, changeStatus, update, remove } = useUserProductActions(
    () => { onRefresh?.(); },
    locale
  );

  const byId = useMemo(() => new Map(list.map(x => [ (x as any).id, x ])), [list]);

  // نمایش/عدم‌نمایش
  const handleToggleVisible = useCallback(async (id: number) => {
    setBusy(true);
    setList(prev => prev.map(it => {
      if ((it as any).id !== id) return it;
      const isVisible = (it as any).isVisible ?? !(it as any).isHidden;
      return { ...it as any, isVisible: !isVisible, isHidden: isVisible } as any;
    }));
    try {
      await changeStatus(id);
    } finally {
      setBusy(false);
    }
  }, [changeStatus]);

  // حذف
  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    const id = deleteId;
    setBusy(true);
    setList(prev => prev.filter(x => (x as any).id !== id));
    try {
      await remove(id);
    } catch {
      onRefresh?.();
    } finally {
      setBusy(false);
      setDeleteId(null);
    }
  }, [deleteId, remove, onRefresh]);

  // ویرایش (فقط قیمت‌ها)
  const handleEditSubmit = useCallback(async (payload: UpdateUserProductPayload) => {
    setBusy(true);
    try {
      await update(payload);
      setList(prev => prev.map(it => {
        if ((it as any).id !== payload.id) return it;
        return {
          ...it as any,
          isDollar: typeof payload.isDollar === "boolean" ? payload.isDollar : (it as any).isDollar,
          dollarPrice: payload.dollarPrice != null ? Number(payload.dollarPrice) : (it as any).dollarPrice,
          otherCosts:  payload.otherCosts  != null ? Number(payload.otherCosts)  : (it as any).otherCosts,
          finalPrice:  payload.finalPrice  != null ? Number(payload.finalPrice)  : (it as any).finalPrice,
        } as any;
      }));
    } finally {
      setBusy(false);
      setEditItem(null);
    }
  }, [update]);

  // جابه‌جایی
  const swap = (arr: any[], i: number, j: number) => {
    const res = [...arr];
    const tmp = res[i]; res[i] = res[j]; res[j] = tmp;
    return res;
  };

  const handleMove = useCallback(async (id: number, direction: "up" | "down") => {
    setBusy(true);
    setList(prev => {
      const idx = prev.findIndex(x => (x as any).id === id);
      if (idx < 0) return prev;
      const j = direction === "up" ? idx - 1 : idx + 1;
      if (j < 0 || j >= prev.length) return prev;
      return swap(prev, idx, j);
    });
    try {
      const payload: ChangeOrderPayload = { userProductId: id, direction } as any;
      await changeOrder(payload);
    } finally {
      setBusy(false);
    }
  }, [changeOrder]);

  return (
    <div className="grid gap-2" dir="rtl">
      {list.map((it) => (
        <UserProductItem
          key={(it as any).id}
          item={it}
          messages={t}
          onEdit={(id) => setEditItem(byId.get(id) || null)}
          onDelete={(id) => setDeleteId(id)}
          onToggleVisible={handleToggleVisible}
          onMoveUp={(id) => handleMove(id, "up")}
          onMoveDown={(id) => handleMove(id, "down")}
          disabled={busy || isSubmitting}
        />
      ))}

      <UserProductDeleteModal
        open={deleteId != null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        messages={t}
      />

      {editItem && (
        <UserProductEditModal
          open={true}
          onClose={() => setEditItem(null)}
          item={editItem}
          subCategoryId={subCategoryId} // فعلاً بی‌استفاده
          onSubmit={handleEditSubmit}
          messages={t}
        />
      )}
    </div>
  );
}
