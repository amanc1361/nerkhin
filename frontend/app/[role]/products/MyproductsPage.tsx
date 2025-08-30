"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import type { UserProductMessages } from "@/lib/server/texts/userProdutMessages";
import { getUserProductMessages } from "@/lib/server/texts/userProdutMessages";

import ProductsToolbar from "@/app/components/userproduct/ProductsToolbar";
import ProductsHeader from "@/app/components/userproduct/ProductsHeader";
import ProductsList from "@/app/components/userproduct/ProductsList";
import DollarPriceModal from "@/app/components/userproduct/DollarPriceModal";
import { useDollarPriceAction } from "@/app/hooks/useDollarPriceAction";
import { useAuthenticatedApi } from "@/app/hooks/useAuthenticatedApi";
import { formatMoneyInput, toEnDigits } from "@/app/components/shared/MonyInput";



type Role = "wholesaler" | "retailer";

type Props = {
  role: Role;
  initialItems: any[];           // UserProductVM[]
  usdPrice: string | number;
  locale: string;
};

export default function MyproductsPage({
  role,
  initialItems,
  usdPrice,
  locale,
}: Props) {
  const messages: UserProductMessages = useMemo(
    () =>
      (typeof getUserProductMessages === "function"
        ? getUserProductMessages("fa")
        : ({} as any)),
    [locale]
  );

  // مقدار خام (digits) که برای ذخیره می‌فرستیم
  const [localUsd, setLocalUsd] = useState<string>(String(usdPrice ?? ""));
  useEffect(() => { setLocalUsd(String(usdPrice ?? "")); }, [usdPrice]);

  // نمایش سه‌رقم‌سه‌رقم (فقط بخش صحیح)
  const displayUsd = useMemo(
    () => formatMoneyInput(String(localUsd ?? ""), false),
    [localUsd]
  );

  const addHref = `/${role}/products/create`;

  // مودال قیمت دلار + ذخیره
  const [openUsdModal, setOpenUsdModal] = useState(false);
  const { update, isSubmitting } = useDollarPriceAction((digits) => {
    setLocalUsd(digits);             // UI فوری آپدیت
    setOpenUsdModal(false);
  });
  const handleUsdSubmit = (digits: string) => update(digits);

  // ← لاگ و گرفتن قیمت از بک‌اند (اعشار را حذف می‌کنیم)
  const { data: session, status } = useSession();
  const { api } = useAuthenticatedApi();

  useEffect(() => {
    if (status !== "authenticated") return;
    const uid = (session?.user as any)?.id;
    if (!uid) return;

    (async () => {
      try {
        const res: any = await api.get({ url: `/user/dollar-price/${uid}` });
         const payload = res && typeof res === "object" && "data" in res ? res.data : res;


        // ---- فقط بخش صحیح را نگه می‌داریم (اعشار حذف) ----
        const toIntegerDigits = (v: any): string => {
          if (v == null) return "";
          if (typeof v === "number") {
            // عدد اعشاری → فقط قسمت صحیح
            return String(Math.trunc(v));
          }
          if (typeof v === "string") {
            // تبدیل ارقام فارسی/عربی به انگلیسی و حذف جداکننده‌ها
            const s = toEnDigits(v)
              .replace(/,/g, "")
              .replace(/\s+/g, "")
              .replace(/٫/g, "."); // نقطه فارسی
            // فقط بخش قبل از .
            const intPart = s.split(".")[0];
            // حذف هر کاراکتر غیر عددی باقی‌مانده
            return intPart.replace(/[^0-9]/g, "");
          }
          if (typeof v === "object" && "value" in (v as any)) {
            return toIntegerDigits((v as any).value);
          }
          return toIntegerDigits(String(v));
        };

        const digits = toIntegerDigits(payload);
        console.log("[DollarPrice][INTEGER_DIGITS] =>", digits);

        if (digits !== "") setLocalUsd(digits);
      } catch (e) {
        console.log("[DollarPrice][ERROR] =>", e);
      }
    })();
  }, [status, session?.user, api]);

  // اکشن‌های دیگر
  const onShareJpg = () => {};
  const onSharePdf = () => {};
  const onShare    = () => {};
  const onEdit = (_id: number) => {};
  const onDelete = (_id: number) => {};
  const onToggleVisible = (_id: number) => {};

  return (
    <div dir="rtl" className="container mx-auto px-3 py-4 lg:py-6 text-right">
      <div className="lg:flex lg:gap-6">
        {/* سایدبار راست */}
        <aside className="hidden lg:block lg:w-80 lg:shrink-0 lg:sticky lg:top-20">
          <div className="rounded-2xl border bg-white p-3 space-y-4 shadow-sm text-right">
            <ProductsToolbar
              usdPrice={displayUsd}                // ← نمایش سه‌رقم‌سه‌رقم
              addHref={addHref}
              onShareJpg={onShareJpg}
              onSharePdf={onSharePdf}
              onShare={onShare}
              messages={messages}
              onOpenUsdModal={() => setOpenUsdModal(true)}
            />
          </div>
        </aside>

        {/* ستون چپ: هدر و لیست محصولات */}
        <main className="flex-1">
          {/* موبایل: تولبار بالا */}
          <div className="lg:hidden mb-4">
            <ProductsToolbar
              usdPrice={displayUsd}                // ← موبایل هم فرمت‌شده
              addHref={addHref}
              onShareJpg={onShareJpg}
              onSharePdf={onSharePdf}
              onShare={onShare}
              messages={messages}
              onOpenUsdModal={() => setOpenUsdModal(true)}
            />
          </div>

          <ProductsHeader
            count={initialItems?.length ?? 0}
            messages={messages}
          />
     

          <ProductsList
            items={initialItems ?? []}
            messages={messages}
        
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleVisible={onToggleVisible}
          />
        </main>
      </div>

      {/* مودال قیمت دلار */}
      <DollarPriceModal
        open={openUsdModal}
        initialValue={localUsd}       // ← مودال مقدار خام (فقط بخش صحیح) را ویرایش می‌کند
        onClose={() => setOpenUsdModal(false)}
        onSubmit={handleUsdSubmit}
        loading={isSubmitting}
      />
    </div>
  );
}
