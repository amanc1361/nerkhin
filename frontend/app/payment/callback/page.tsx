// app/payment/callback/page.tsx
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { fetchUserInfo } from "@/lib/server/server-api";
import { normalizeRole, UserRole } from "@/app/types/role";
import { createUserSubscriptionSSR } from "@/lib/server/sunScriptionAction";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Next.js 15: searchParams به صورت Promise می‌آید
type SearchParams = Record<string, string | string[] | undefined>;

function read(sp: SearchParams, key: string) {
  const direct = sp[key];
  const lower = sp[key.toLowerCase()];
  const upper = sp[key.toUpperCase()];
  const v = direct ?? lower ?? upper ?? "";
  return Array.isArray(v) ? (v[0] ?? "") : (v as string);
}

function roleSegmentFrom(user: any): "wholesaler" | "retailer" {
  const n = normalizeRole(user?.role);
  return n === UserRole.Wholesaler ? "wholesaler" : "retailer";
}

export default async function PaymentCallback({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  noStore();

  const sp = await searchParams;
  const status = String(read(sp, "Status")).toUpperCase();
  const authority = String(read(sp, "Authority") || "");

  // نقش برای مسیر مقصد (اگر سشن نبود، retailer)
  let roleSegment: "wholesaler" | "retailer" = "retailer";
  try {
    const user = await fetchUserInfo();
    roleSegment = roleSegmentFrom(user);
  } catch {}

  const failure = `/${roleSegment}/account/subscriptions?error=payment_failed`;

  // اگر درگاه OK نگفت یا authority نیست → شکست واقعی
  if (status !== "OK" || !authority) {
    return redirect(failure);
  }

  // 🔴 نکته‌ی کلیدی: مسیر کاربر را به هیچ نتیجه‌ی همزمانی وابسته نکن!
  // همین الآن برو صفحه‌ی موفقیت؛ Verify را «best effort» و بدون بلاک انجام بده.
  // در صفحه‌ی موفقیت، updateSession() → jwt(trigger:"update") → فورس‌رفرش توکن.
  // (اگر لازمه لاگ بگیری:)
  // console.log("[PaymentCallback] OK authority:", authority);

  // Best-effort verify (non-blocking)
  // توجه: redirect اجرای بعدی را قطع می‌کند؛ این call عملاً فقط برای لاگ/فایربرد است.
  // اگر نمی‌خوای حتی این را صدا بزنی، می‌تونی پاکش کنی.
  try {
    // اهمیتی ندارد اگر throw کند؛ مسیر کاربر را بلاک نمی‌کنیم.
    await createUserSubscriptionSSR(authority);
  } catch {
    // ignore — بک‌اندت همین حالا هم با وبهوک/Verify داخلی فعال کرده
  }

  return redirect(`/payment/success?role=${roleSegment}`);
}
