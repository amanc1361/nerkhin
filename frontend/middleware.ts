// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SECRET = process.env.NEXTAUTH_SECRET!;
const LOGIN = "/auth/login";
const SIGNUP = "/auth/sign-up";
const PANEL = "/panel";
const BAZAAR = "/bazaar";
const HOME = "/";

const ADMIN = [1, 2, "1", "2", "admin", "superadmin"];
const PROTECTED = [PANEL, BAZAAR, "/profile"];
const AUTH_INVALID_FLAG = "auth_invalid";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.ico"
  ) return NextResponse.next();

  if (req.method !== "GET") return NextResponse.next();

  const token = await getToken({ req, secret: SECRET }) as any;

  // ✳️ اگر روی صفحات احراز هویت هستیم، یک هدر به درخواست تزریق کن
  const requestHeaders = new Headers(req.headers);
  const onAuth = pathname.startsWith(LOGIN) || pathname.startsWith(SIGNUP);
  if (onAuth) {
    requestHeaders.set("x-auth-page", "1");
  }

  const onHome = pathname === HOME;
  const onProtected = PROTECTED.some(p => pathname.startsWith(p));

  const exp = typeof token?.accessTokenExpires === "number" ? token.accessTokenExpires : 0;
  const isExpired = exp > 0 && Date.now() >= (exp - 30_000);
  const hadRefreshError = token?.error === "RefreshAccessTokenError";
  const flaggedInvalid = req.cookies.get(AUTH_INVALID_FLAG)?.value === "1";

  const isAuth = !!token?.accessToken && !isExpired && !hadRefreshError && !flaggedInvalid;

  // اجازهٔ رندر لاگین/ثبت‌نام
  if (onAuth) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isAuth && onHome) {
    return NextResponse.redirect(new URL(ADMIN.includes(token?.role as any) ? PANEL : BAZAAR, req.url));
  }

  if (!isAuth && onProtected) {
    const url = new URL(LOGIN, req.url);
    url.searchParams.set("redirect", pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/", "/panel/:path*", "/bazaar/:path*", "/profile/:path*", "/auth/login", "/auth/sign-up"],
};
