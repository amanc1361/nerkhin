// app/components/userproduct/UserProductList.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { UserProductView, UpdateUserProductPayload, ChangeOrderPayload } from "@/app/types/userproduct/userProduct";
import { getUserProductMessages, type UserProductMessages } from "@/lib/server/texts/userProdutMessages";

import UserProductItem from "./UserProductItem";
import UserProductDeleteModal from "./UserProductDeleteModal";
import UserProductEditModal from "./UserProductEditModal";
import { useUserProductActions } from "@/app/hooks/useuserProductAction";

type Props = {
  items: UserProductView[];
  subCategoryId?: number;
  locale?: "fa" | "en";

  /** ←← اضافه شد: اگر از صفحه بالا هندل می‌کنی، این‌ها اختیاری‌اند */
  messages?: UserProductMessages;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onToggleVisible?: (id: number) => void;

  onRefresh?: () => void;
};

export default function UserProductList({
  items,
  subCategoryId,
  locale = "fa",
  messages,
  onEdit,
  onDelete,
  onToggleVisible,
  onRefresh,
}: Props) {
  // اگر messages از بالا اومد، همونو استفاده کن؛ وگرنه از دیکشنری بساز
  const t = messages ?? getUserProductMessages(locale);

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

  // نمایش/عدم‌نمایش (اگر از بالا هندل دادی، همونو صدا بزن)
  const handleToggleVisible = useCallback(async (id: number) => {
    if (onToggleVisible) return onToggleVisible(id);

    setBusy(true);
    setList(prev => prev.map(it => {
      if ((it as any).id !== id) return it;
      const isVisible = (it as any).isVisible ?? !(it as any).isHidden;
      return { ...it as any, isVisible: !isVisible, isHidden: isVisible } as any;
    }));
    try { await changeStatus(id); } finally { setBusy(false); }
  }, [onToggleVisible, changeStatus]);

  // حذف (اگر از بالا هندل دادی، همونو صدا بزن)
  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    if (onDelete) { onDelete(deleteId); setDeleteId(null); return; }

    const id = deleteId;
    setBusy(true);
    setList(prev => prev.filter(x => (x as any).id !== id));
    try { await remove(id); } catch { onRefresh?.(); }
    finally { setBusy(false); setDeleteId(null); }
  }, [deleteId, onDelete, remove, onRefresh]);

  // ویرایش فقط قیمت‌ها
  const handleEditSubmit = useCallback(async (payload: UpdateUserProductPayload) => {
    // اگر از بالا هندل می‌کنی، فقط کال‌بک بیرونی رو صدا بزن و برگرد
    if (onEdit) { await onEdit(payload.id); setEditItem(null); return; }

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
  }, [onEdit, update]);


const handleMove = useCallback(
  async (id: number, direction: "up" | "down") => {
    setBusy(true);

    // 1) از state فعلی محاسبه کن (نه داخل setList)
    const idx = list.findIndex((x: any) => x.id === id);
    const neighborIdx = direction === "up" ? idx - 1 : idx + 1;

    // اگر مرزی بود، کاری نکن
    if (idx < 0 || neighborIdx < 0 || neighborIdx >= list.length) {
      setBusy(false);
      return;
    }

    const neighborId = (list[neighborIdx] as any).id;

    // 2) payload سازگار با بک‌اند: top/bottom
    const payload =
      direction === "up"
        ? { topProductId: id,         bottomProductId: neighborId }
        : { topProductId: neighborId, bottomProductId: id };

    // 3) سواپ خوش‌بینانهٔ UI
    setList((prev) => {
      // برای اطمینان، با ایندکس‌های از قبل محاسبه‌شده کار کن
      const copy = [...prev];
      [copy[idx], copy[neighborIdx]] = [copy[neighborIdx], copy[idx]];
      return copy;
    });

    // 4) درخواست به سرور
    try {
      await changeOrder(payload);
    } finally {
      setBusy(false);
    }
  },
  [list, changeOrder]
);


  return (
    <div className="grid gap-2" dir="rtl">
      {list.map((it) => (
        <UserProductItem
          key={(it as any).id}
          item={it}
          messages={t}
          onEdit={(id) => onEdit ? onEdit(id) : setEditItem(byId.get(id) || null)}
          onDelete={(id) => onDelete ? onDelete(id) : setDeleteId(id)}
          onToggleVisible={(id) => handleToggleVisible(id)}
          onMoveUp={(id) => handleMove(id, "up")}
          onMoveDown={(id) => handleMove(id, "down")}
          disabled={busy || isSubmitting}
        />
      ))}

      {/* مودال حذف فقط وقتی کال‌بک بیرونی نداده‌ای */}
      {!onDelete && (
        <UserProductDeleteModal
          open={deleteId != null}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          messages={t}
        />
      )}

      {/* مودال ویرایش فقط وقتی کال‌بک بیرونی نداده‌ای */}
      {!onEdit && editItem && (
        <UserProductEditModal
          open={true}
          onClose={() => setEditItem(null)}
          item={editItem}
          subCategoryId={subCategoryId}
          onSubmit={handleEditSubmit}
          messages={t}
        />
      )}
    </div>
  );
}
