// app/payment/callback/page.tsx
import Image from "next/image";
import Link from "next/link";
import Done from "@/public/done.png";
import Failed from "@/public/failed.png";
import { createUserSubscriptionSSR } from "@/lib/server/sunScriptionAction";


export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = { [key: string]: string | string[] | undefined };

function read(sp: SearchParams, key: string) {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v || "";
}

export default async function PaymentCallback({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const status = (read(searchParams, "Status") || read(searchParams, "status")).toUpperCase();
  const authority = read(searchParams, "Authority") || read(searchParams, "authority");

  let ok = false;
  let message = "";

  if (status === "OK" && authority) {
    try {
      await createUserSubscriptionSSR(authority);
      ok = true;
    } catch (e: any) {
      ok = false;
      message = e?.message || "خطا در ثبت اشتراک پس از پرداخت";
    }
  } else {
    ok = false;
    message = "پرداخت توسط درگاه تأیید نشد (Status != OK)";
  }

  return (
    <div dir="rtl" className="flex w-full items-center justify-center pt-10">
      {ok ? (
        <div className="flex flex-col items-center gap-6 text-center">
          <Image height={160} src={Done} alt="result" />
          <p className="text-lg text-green-700 VazirFontMedium">پرداخت شما با موفقیت انجام شد.</p>
          <p>از این لحظه می‌توانید از امکانات اشتراکی نرخین استفاده کنید.</p>
          <Link href="/wholesaler/shop" className="bg-blue-600 text-white px-5 py-3 rounded-lg">
            رفتن به فروشگاه من
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 text-center">
          <Image height={160} src={Failed} alt="result" />
          <p className="text-lg text-red-700 VazirFontMedium">پرداخت شما ناموفق بود.</p>
          <p className="text-sm text-gray-600">{message || "لطفاً دوباره تلاش کنید."}</p>
          <Link href="/wholesaler/account/subscriptions" className="bg-red-600 text-white px-5 py-3 rounded-lg">
            رفتن به تمدید حساب
          </Link>
        </div>
      )}
    </div>
  );
}
