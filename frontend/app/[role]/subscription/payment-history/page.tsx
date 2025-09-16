import PaymentHistoryPageClient, { PaymentHistoryMessages } from "@/app/components/subscriptions/PaymentHistoryPageClient";


// پیام‌ها از دیکشنری/ترجمه پروژه تزریق می‌شوند
const t: PaymentHistoryMessages = {
  pageTitle: "واریزهای اشتراک",
  table: {
    title: "لیست واریزها",
    createdAt: "تاریخ پرداخت",
    city: "شهر",
    fullName: "نام کاربر",
    cost: "مبلغ (تومان)",
    days: "مدت (روز)",
    refId: "کد پیگیری",
    authority: "Authority",
    expiration: "تاریخ انقضا",
    empty: "رکوردی یافت نشد",
  },
};

export default async function Page() {
  return <PaymentHistoryPageClient t={t} />;
}
