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

// مسیرهای محافظت‌شده (بدون bazaar)
const PROTECTED = [PANEL, WHOLESALER, RETAILER, "/profile"];

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

  // 👇 نقش را از چند محل ممکنِ سشن استخراج کن (بدون دست‌کاری فایل‌های دیگر)
  const role =
    (session as any)?.role ??
    (session as any)?.user?.role ??
    (session as any)?.userRole ??
    (session as any)?.user?.userRole ?? 
    (session as any)?.claims?.role ??
    null;

  // انقضا با بافر 30 ثانیه
  const exp = typeof (session as any)?.accessTokenExpires === "number"
    ? ((session as any).accessTokenExpires as number)
    : 0;
  const isExpired = exp > 0 && Date.now() >= exp - 30_000;

  const isAuth = !!session && !isExpired;

  const onAuth      = pathname.startsWith(LOGIN) || pathname.startsWith(SIGNUP);
  const onHome      = pathname === HOME;
  const onProtected = PROTECTED.some((p) => pathname.startsWith(p));

  // 1) اگر لاگین است و روی / یا /auth/*: بفرست به مسیر پیش‌فرض نقش
  if (isAuth && (onAuth || onHome)) {
    return NextResponse.redirect(new URL(defaultRouteForRole(role), req.url));
  }

  // 2) اگر لاگین نیست و روی مسیر محافظت‌شده است: بفرست لاگین (+redirect)
  if (!isAuth && onProtected) {
    const to = new URL(LOGIN, req.url);
    to.searchParams.set("redirect", pathname + url.search);
    return NextResponse.redirect(to);
  }

  // 3) اگر لاگین است و وارد /panel شده ولی ادمین نیست: بفرست مسیر نقش خودش
  if (isAuth && pathname.startsWith(PANEL) && !isAdmin(role)) {
    return NextResponse.redirect(new URL(defaultRouteForRole(role), req.url));
  }

  // 4) گارد تطابق مسیر با نقش — فقط وقتی نقش «قطعاً» خلاف مسیر است، ریدایرکت کن
  if (isAuth && pathname.startsWith(WHOLESALER)) {
    if (isAdmin(role))        return NextResponse.redirect(new URL(PANEL, req.url));
    if (isRetailer(role))     return NextResponse.redirect(new URL(RETAILER, req.url));
    // نقش نامشخص یا عمده‌فروش؟ دست نزن
  }

  if (isAuth && pathname.startsWith(RETAILER)) {
    if (isAdmin(role))        return NextResponse.redirect(new URL(PANEL, req.url));
    if (isWholesaler(role))   return NextResponse.redirect(new URL(WHOLESALER, req.url));
    // نقش نامشخص یا خرده‌فروش؟ دست نزن
  }

  return NextResponse.next();
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
