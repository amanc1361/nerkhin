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
 */
const SUBSCRIPTION_REQUIRED: Array<string | RegExp> = [
  /^\/(wholesaler|retailer)\/products(\/|$)/,
  /^\/(wholesaler|retailer)\/search(\/|$)/,
];

// --- Helper های تاریخ: همه‌ی فرمت‌ها را به میلی‌ثانیه تبدیل کن ---
function toMs(v: unknown): number {
  if (v == null) return 0;

  // اگر عدد است
  if (typeof v === "number") {
    // اعداد کمتر از 1e12 یعنی «ثانیه»
    return v < 1e12 ? v * 1000 : v;
  }

  // اگر رشته است و عددی به نظر می‌رسد
  if (typeof v === "string") {
    const asNum = Number(v);
    if (Number.isFinite(asNum)) {
      return asNum < 1e12 ? asNum * 1000 : asNum;
    }
    // در غیر اینصورت تلاش برای parse ISO/Date
    const parsed = Date.parse(v);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  // هر چیز دیگری: تلاش آخر
  const parsed = Date.parse(String(v));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function pathMatches(pathname: string, rule: string | RegExp) {
  if (typeof rule === "string") return pathname.startsWith(rule);
  return rule.test(pathname);
}

function isSubscriptionGate(pathname: string) {
  return SUBSCRIPTION_REQUIRED.some((r) => pathMatches(pathname, r));
}

function isActiveSubscription(status?: string, expiresAt?: unknown) {
  // وضعیت قابل قبول
  if (status !== "active" && status !== "trial") return false;
  // تاریخ معتبر؟
  const t = toMs(expiresAt);
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

  const role =
    (session as any)?.role ??
    (session as any)?.user?.role ??
    (session as any)?.userRole ??
    (session as any)?.user?.userRole ??
    (session as any)?.claims?.role ??
    null;

  const hasKnownRole = !!role && (isAdmin(role) || isWholesaler(role) || isRetailer(role));

  // انقضا با بافر 30 ثانیه
  const expRaw = (session as any)?.accessTokenExpires as unknown;
  const expMs = toMs(expRaw); // ← این هم اگر اشتباهی ثانیه باشد، نرمال می‌شود
  const isExpired = expMs > 0 && Date.now() >= expMs - 30_000;

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
  // if (isAuth && isSubscriptionGate(pathname)) {
  //   const subStatus = (session as any)?.subscriptionStatus as string | undefined;
  //   const subExpRaw = (session as any)?.subscriptionExpiresAt as unknown;

  //   if (!isActiveSubscription(subStatus, subExpRaw)) {
  //     const roleSlug = roleSlugFrom(role); // ← نقش فعلی از همون قبل استخراج شده
  //     const to = new URL(`/${roleSlug}/subscribe`, req.url);

  //     // پیام و لینک و next
  //     to.searchParams.set("msg", "برای دسترسی به این بخش نیاز به اشتراک فعال دارید.");
  //     to.searchParams.set("buy", "https://nerrkhin.com/subscribe/buy");
  //     to.searchParams.set("next", pathname + url.search);
  //     // مهم: خود role را هم بفرست
  //     if (roleSlug) to.searchParams.set("role", roleSlug);

  //     return NextResponse.redirect(to);
  //   }
  // }

// 2.5) اگر لاگین است ولی «اشتراک لازم» دارد و فعال نیست → اول پل رفرش
if (isAuth && isSubscriptionGate(pathname)) {
  const subStatus = (session as any)?.subscriptionStatus as string | undefined;
  const subExp    = (session as any)?.subscriptionExpiresAt as string | number | Date | undefined;

  if (!isActiveSubscription(subStatus, subExp)) {
    const roleSlug = roleSlugFrom(role);
    const to = new URL(`/auth/refresh-bridge`, req.url);
    to.searchParams.set("next", pathname + url.search);
    to.searchParams.set("fallback", `/${roleSlug}/subscribe?from=${encodeURIComponent(pathname)}`);
    return NextResponse.redirect(to);
  }
}

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
  if (isAdmin(role))      return "panel";
  return "";
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
