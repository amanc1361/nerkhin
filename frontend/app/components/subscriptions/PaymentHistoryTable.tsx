// app/components/subscription/PaymentHistoryTable.tsx
"use client";

import { useMemo } from "react";

import moment from "moment-jalaali";
import { PaymentTransactionHistoryViewModel } from "@/app/types/subscription/subscriptionManagement";

type Messages = {
  title: string;
  createdAt: string;
  city: string;
  fullName: string;
  cost: string;
  days: string;
  refId: string;
  authority: string;
  expiration: string;
  empty: string;
};

type Props = {
  t: Messages;
  items: PaymentTransactionHistoryViewModel[] | null;
  loading?: boolean;
};

function toJalali(iso?: string) {
  if (!iso) return "—";
  try {
    moment.loadPersian({ dialect: "persian-modern", usePersianDigits: true });
    return moment(iso).format("jD jMMMM jYYYY - HH:mm");
  } catch {
    return "—";
  }
}

function moneyFormat(n: string | number | null | undefined) {
  if (n == null) return "—";
  const num = typeof n === "string" ? Number(n) : n;
  if (isNaN(num)) return "—";
  return num.toLocaleString("fa-IR");
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse space-y-3">
      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-52 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

export default function PaymentHistoryTable({ t, items, loading }: Props) {
  const rows = useMemo(() => items ?? [], [items]);

  // Empty state
  if (!loading && rows.length === 0) {
    return (
      <div className="w-full text-center py-8 text-gray-600 dark:text-gray-300" dir="rtl" lang="fa">
        {t.empty}
      </div>
    );
  }

  return (
    <div dir="rtl" lang="fa" className="space-y-4">
      {/* موبایل: کارت‌ها */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          rows.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 shadow-sm"
            >
              {/* ردیف بالایی: نام و شهر + مدت */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t.fullName}</div>
                  <div className="truncate text-base font-semibold text-gray-900 dark:text-gray-100">
                    {r.fullName || "—"}
                  </div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {t.city}: <span className="font-medium">{r.city || "—"}</span>
                  </div>
                </div>
                <span className="shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-700 dark:text-gray-200">
                  {t.days}: {r.numberOfDays === 1
                    ? "۳۰"
                    : r.numberOfDays === 2
                    ? "۶۰"
                    : r.numberOfDays === 3
                    ? "۹۰"
                    : r.numberOfDays === 4
                    ? "۱۸۰"
                    : r.numberOfDays === 5
                    ? "۳۶۵"
                    : "نامشخص"
                  }
                </span>
              </div>

              {/* مبلغ */}
              <div className="mt-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t.cost}</div>
                <div className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                  {moneyFormat(r.cost)} <span className="text-sm font-medium text-gray-500">ریال</span>
                </div>
              </div>

              {/* شناسه‌ها */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 px-3 py-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.refId}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all">
                    {r.refId || "—"}
                  </div>
                </div>
                             </div>

              {/* تاریخ‌ها */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 px-3 py-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.createdAt}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {toJalali(r.createdAt)}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 px-3 py-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.expiration}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {toJalali(r.expirationDate)}
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* دسکتاپ: جدول */}
      <div className="hidden md:block">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center text-gray-600 dark:text-gray-300">
            ...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm" dir="rtl" lang="fa">
              <thead className="bg-gray-50 dark:bg-gray-800 text-right">
                <tr className="text-gray-700 dark:text-gray-200">
                  <th className="px-3 py-3">{t.createdAt}</th>
                  <th className="px-3 py-3">{t.city}</th>
                  <th className="px-3 py-3">{t.fullName}</th>
                  <th className="px-3 py-3">{t.cost}</th>
                  <th className="px-3 py-3">{t.days}</th>
                  <th className="px-3 py-3">{t.refId}</th>
               
                  <th className="px-3 py-3">{t.expiration}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-3 whitespace-nowrap">{toJalali(r.createdAt)}</td>
                    <td className="px-3 py-3">{r.city || "—"}</td>
                    <td className="px-3 py-3">{r.fullName || "—"}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {moneyFormat(r.cost)} <span className="text-xs text-gray-500">ریال</span>
                    </td>
                    <td className="px-3 py-3"> {t.days}: {r.numberOfDays === 1
                    ? "۳۰"
                    : r.numberOfDays === 2
                    ? "۶۰"
                    : r.numberOfDays === 3
                    ? "۹۰"
                    : r.numberOfDays === 4
                    ? "۱۸۰"
                    : r.numberOfDays === 5
                    ? "۳۶۵"
                    : "نامشخص"
                  }</td>
                    <td className="px-3 py-3">{r.refId || "—"}</td>
               
                    <td className="px-3 py-3 whitespace-nowrap">{toJalali(r.expirationDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
