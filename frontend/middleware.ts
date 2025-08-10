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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.ico"
  ) return NextResponse.next();

  if (req.method !== "GET") return NextResponse.next();

  const session = await getToken({ req, secret: SECRET });

  // 🔧 جدید: انقضا را هم بسنج (با 30s مارجین)
  const exp = typeof (session as any)?.accessTokenExpires === "number" ? (session as any).accessTokenExpires : 0;
  const isExpired = exp > 0 && Date.now() >= (exp - 30_000);

  // 🔧 جدید: فقط وقتی لاگین حسابش کن که منقضی نباشه
  const isAuth = !!session && !isExpired;

  const role = (session as any)?.role;
  const onAuth = pathname.startsWith(LOGIN) || pathname.startsWith(SIGNUP);
  const onHome = pathname === HOME;
  const onProtected = PROTECTED.some(p => pathname.startsWith(p));

  if (isAuth && (onAuth || onHome)) {
    return NextResponse.redirect(new URL(ADMIN.includes(role as any) ? PANEL : BAZAAR, req.url));
  }

  if (!isAuth && onProtected) {
    const url = new URL(LOGIN, req.url);
    url.searchParams.set("redirect", pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (isAuth && pathname.startsWith(PANEL) && !ADMIN.includes(role as any)) {
    return NextResponse.redirect(new URL(BAZAAR, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/panel/:path*", "/bazaar/:path*", "/profile/:path*", "/auth/login", "/auth/sign-up"],
};
