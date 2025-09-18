// // app/payment/callback/page.tsx
// import { redirect } from "next/navigation";
// import {  fetchUserInfo } from "@/lib/server/server-api";
// import { normalizeRole, UserRole } from "@/app/types/role";
// import { createUserSubscriptionSSR } from "@/lib/server/sunScriptionAction";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// // در پروژه‌ی شما (Next.js 15) searchParams به‌صورت Promise می‌آید
// type SearchParams = Record<string, string | string[] | undefined>;

// // کمک‌تابع برای خواندن پارامترها با حروف بزرگ/کوچک مختلف
// function read(sp: SearchParams, key: string) {
//   const direct = sp[key];
//   const lower = sp[key.toLowerCase()];
//   const upper = sp[key.toUpperCase()];
//   const v = direct ?? lower ?? upper ?? "";
//   return Array.isArray(v) ? (v[0] ?? "") : (v as string);
// }

// function roleSegmentFrom(user: any): "wholesaler" | "retailer" {
//   const n = normalizeRole(user?.role);
//   return n === UserRole.Wholesaler ? "wholesaler" : "retailer";
// }

// export default async function PaymentCallback({
//   searchParams,
// }: {
//   // ✅ امضای درست طبق تایپ پروژه‌ی شما
//   searchParams: Promise<SearchParams>;
// }) {
//   // ابتدا await کنیم چون Promise است
//   const sp = await searchParams;

//   const status = String(read(sp, "Status")).toUpperCase();
//   const authority = String(read(sp, "Authority") || "");

//   // نقش کاربر برای مسیر مقصد
//   let roleSegment: "wholesaler" | "retailer" = "retailer";
//   try {
//     const user = await fetchUserInfo();
//     roleSegment = roleSegmentFrom(user);
//   } catch {
//     // اگر سشن/توکن نداشتیم، پیش‌فرض retailer
//   }

//   // اگر درگاه OK نگفت یا authority نداریم → برگرد به صفحه‌ی تمدید نقش خودش
//   if (status !== "OK" || !authority) {
//     return redirect(`/${roleSegment}/account/subscriptions?error=payment_failed`);
//   }

//   // ثبت اشتراک در بک‌اند (Verify سمت سرور شما انجام می‌شود)
//   try {
//     await createUserSubscriptionSSR(authority);
//     // موفق: هدایت به صفحه‌ی مخصوص نقش
//     return redirect(`/${roleSegment}/shop`);
//   } catch {
//     // ناموفق: برگرد به صفحه‌ی تمدید
//     return redirect(`/${roleSegment}/account/subscriptions?error=payment_failed`);
//   }
// }


import { redirect } from "next/navigation";
import {  fetchUserInfo } from "@/lib/server/server-api";
import { normalizeRole, UserRole } from "@/app/types/role";
import { createUserSubscriptionSSR } from "@/lib/server/sunScriptionAction";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// در پروژه‌ی شما (Next.js 15) searchParams به‌صورت Promise می‌آید
type SearchParams = Record<string, string | string[] | undefined>;

// کمک‌تابع برای خواندن پارامترها با حروف بزرگ/کوچک مختلف
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
  // ✅ امضای درست طبق تایپ پروژه‌ی شما
  searchParams: Promise<SearchParams>;
}) {
  // ابتدا await کنیم چون Promise است
  const sp = await searchParams;

  const status = String(read(sp, "Status")).toUpperCase();
  const authority = String(read(sp, "Authority") || "");

  // نقش کاربر برای مسیر مقصد
  let roleSegment: "wholesaler" | "retailer" = "retailer";
  try {
    const user = await fetchUserInfo();
    roleSegment = roleSegmentFrom(user);
  } catch {
    // اگر سشن/توکن نداشتیم، پیش‌فرض retailer
  }

  const failureRedirectPath = `/${roleSegment}/account/subscriptions?error=payment_failed`;

  // اگر درگاه OK نگفت یا authority نداریم → برگرد به صفحه‌ی تمدید نقش خودش
  if (status !== "OK" || !authority) {
    return redirect(failureRedirectPath);
  }

  // ثبت اشتراک در بک‌اند (Verify سمت سرور شما انجام می‌شود)
  try {
    await createUserSubscriptionSSR(authority);
    
    // ✅ تغییر اصلی: موفقیت → هدایت به صفحه میانی برای رفرش توکن
    // نقش کاربر را با Query Param به صفحه بعد می‌فرستیم تا بدانیم در نهایت به کدام فروشگاه برود
    return redirect(`/payment/success?role=${roleSegment}`);
    
  } catch {
    // ناموفق: برگرد به صفحه‌ی تمدید
    return redirect(failureRedirectPath);
  }
}
