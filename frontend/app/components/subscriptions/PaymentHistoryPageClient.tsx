"use client";


import { usePaymentHistory } from "@/app/hooks/usePaymentHistory";
import PaymentHistoryTable from "./PaymentHistoryTable";

export type PaymentHistoryMessages = {
  pageTitle: string;
  table: {
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
};

export default function PaymentHistoryPageClient({ t }: { t: PaymentHistoryMessages }) {
  const { items, loading } = usePaymentHistory();

  return (
    <div className="space-y-4" dir="rtl" lang="fa">
      <h1 className="text-xl font-bold">{t.pageTitle}</h1>
      <PaymentHistoryTable t={t.table} items={items} loading={loading} />
    </div>
  );
}
