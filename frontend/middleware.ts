


// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { defaultRouteForRole, isAdmin, isRetailer, isWholesaler } from "./app/types/role";

const SECRET = process.env.NEXTAUTH_SECRET!;

const LOGIN  = "/auth/login";
const SIGNUP = "/auth/sign-up";
const PANEL  = "/panel";
const HOME   = "/";

const WHOLESALER = "/wholesaler";
const RETAILER   = "/retailer";

// مسیرهای محافظت‌شده (نیاز به لاگین)
const PROTECTED = [PANEL, WHOLESALER, RETAILER, "/profile"];

/**
 * مسیرهایی که «اشتراک فعال» لازم دارند.
 * فقط این آرایه را گسترش بدهید.
 *
 * هر آیتم می‌تواند:
 *  - string (prefix)  مثل "/panel/analytics"
 *  - یا RegExp        مثل /^\/(wholesaler|retailer)\/products(\/|$)/
 */
const SUBSCRIPTION_REQUIRED: Array<string | RegExp> = [
  // نمونه‌های فعلی شما:
  /^\/(wholesaler|retailer)\/products(\/|$)/, // عمده‌فروش/خرده‌فروش: لیست محصولات
  // بعداً هرچی خواستید اضافه کنید: "/panel/analytics", /^\/market\/offers/
];

function pathMatches(pathname: string, rule: string | RegExp) {
  if (typeof rule === "string") return pathname.startsWith(rule);
  return rule.test(pathname);
}

function isSubscriptionGate(pathname: string) {
  return SUBSCRIPTION_REQUIRED.some((r) => pathMatches(pathname, r));
}

function isActiveSubscription(status?: string, expiresAt?: string | number | Date) {
  // می‌توانید وضعیت‌ها را بسته به بک‌اند خودتان کم/زیاد کنید
  if (status !== "active" && status !== "trial") return false;
  if (!expiresAt) return false;
  const t = typeof expiresAt === "number" ? expiresAt : new Date(expiresAt).getTime();
  return t > Date.now();
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  // اجازه‌ی لاگین با reauth=1 (جلوگیری از لوپ)
  const forceReauth = pathname.startsWith(LOGIN) && url.searchParams.get("reauth") === "1";
  if (forceReauth) return NextResponse.next();

  // استاتیک/NextAuth/API
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.ico"
  ) return NextResponse.next();

  // فقط GET را هندل کن
  if (req.method !== "GET") return NextResponse.next();

  // احراز
  const session = await getToken({ req, secret: SECRET });


  // استخراج نقش بدون تغییر فایل‌های دیگر
  const role =
    (session as any)?.role ??
    (session as any)?.user?.role ??
    (session as any)?.userRole ??
    (session as any)?.user?.userRole ??
    (session as any)?.claims?.role ??
    null;

  const hasKnownRole = !!role && (isAdmin(role) || isWholesaler(role) || isRetailer(role));

  // انقضا با بافر 30 ثانیه
  const exp = typeof (session as any)?.accessTokenExpires === "number"
    ? ((session as any).accessTokenExpires as number)
    : 0;
  const isExpired = exp > 0 && Date.now() >= exp - 30_000;

  const isAuth = !!session && !isExpired;

  const onAuth      = pathname.startsWith(LOGIN) || pathname.startsWith(SIGNUP);
  const onHome      = pathname === HOME;
  const onProtected = PROTECTED.some((p) => pathname.startsWith(p));

  // 1) اگر لاگین است و روی / یا /auth/* و نقش مشخص است → بفرست مسیر پیش‌فرض نقش
  if (isAuth && (onAuth || onHome) && hasKnownRole) {
    return NextResponse.redirect(new URL(defaultRouteForRole(role), req.url));
  }

  // 2) اگر لاگین نیست و روی مسیر محافظت‌شده است → بفرست لاگین (+redirect)
  if (!isAuth && onProtected) {
    const to = new URL(LOGIN, req.url);
    to.searchParams.set("redirect", pathname + url.search);
    return NextResponse.redirect(to);
  }

  // 2.5) اگر لاگین است ولی «اشتراک لازم» برای مسیر وجود دارد و فعال نیست → بفرست صفحه‌ی اشتراک
  if (isAuth && isSubscriptionGate(pathname)) {
    const subStatus = (session as any)?.subscriptionStatus as string | undefined;
    const subExp    = (session as any)?.subscriptionExpiresAt as string | number | Date | undefined;
  
    if (!isActiveSubscription(subStatus, subExp)) {
      const roleSlug = roleSlugFrom(role); // ← نقش فعلی از همون قبل استخراج شده
      const to = new URL(`/${roleSlug}/subscribe`, req.url);
  
      // پیام و لینک و next
      to.searchParams.set("msg", "برای دسترسی به این بخش نیاز به اشتراک فعال دارید.");
      to.searchParams.set("buy", "https://nerrkhin.com/subscribe/buy");
      to.searchParams.set("next", pathname + url.search);
      // مهم: خود role را هم بفرست
      if (roleSlug) to.searchParams.set("role", roleSlug);
  
      return NextResponse.redirect(to);
    }
  }

  // 3) اگر لاگین است و وارد /panel شده ولی ادمین نیست → ریدایرکت به مسیر نقش
  if (isAuth && pathname.startsWith(PANEL) && hasKnownRole && !isAdmin(role)) {
    return NextResponse.redirect(new URL(defaultRouteForRole(role), req.url));
  }

  // 4) گارد تطابق مسیر با نقش
  if (isAuth && pathname.startsWith(WHOLESALER) && hasKnownRole) {
    if (isAdmin(role))        return NextResponse.redirect(new URL(PANEL, req.url));
    if (isRetailer(role))     return NextResponse.redirect(new URL(RETAILER, req.url));
    // عمده‌فروش؟ دست نزن
  }
  if (isAuth && pathname.startsWith(RETAILER) && hasKnownRole) {
    if (isAdmin(role))        return NextResponse.redirect(new URL(PANEL, req.url));
    if (isWholesaler(role))   return NextResponse.redirect(new URL(WHOLESALER, req.url));
    // خرده‌فروش؟ دست نزن
  }

  return NextResponse.next();
}
function roleSlugFrom(role: any) {
  if (isWholesaler(role)) return "wholesaler";
  if (isRetailer(role))   return "retailer";
  if (isAdmin(role))      return "panel"; // اگر لازم شد
  return ""; // fallback
}
export const config = {
  matcher: [
    "/",
    "/panel/:path*",
    "/wholesaler/:path*",
    "/retailer/:path*",
    "/profile/:path*",
    "/auth/login",
    "/auth/sign-up",
  ],
};
