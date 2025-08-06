// مسیر: middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SECRET = process.env.NEXTAUTH_SECRET!;          // مطمئن شوید در dev نیز ست شده
const LOGIN_PAGE_URL        = "/auth/login";
const SIGNUP_PAGE_URL       = "/auth/sign-up";
const ADMIN_DASHBOARD_URL   = "/panel";
const USER_DASHBOARD_URL    = "/bazaar";
const PUBLIC_HOME_PAGE_URL  = "/";

const ADMIN_ROLES = [1, 2, "1", "2", "admin", "superadmin"];
const USER_ROLES  = [3, 4, "3", "4", "user", "wholesaler", "retailer"];
const PROTECTED   = [ADMIN_DASHBOARD_URL, USER_DASHBOARD_URL, "/profile"];

export async function middleware(req: NextRequest) {
  const session = await getToken({ req, secret: SECRET });
  const { pathname } = req.nextUrl;

  const isAuth         = !!session;
  const userRole       = session?.role;
  const onAuthPage     = pathname.startsWith(LOGIN_PAGE_URL) || pathname.startsWith(SIGNUP_PAGE_URL);
  const onHomePage     = pathname === PUBLIC_HOME_PAGE_URL;
  const onProtected    = PROTECTED.some((p) => pathname.startsWith(p));

  /* ۱) کاربر لاگین و در صفحهٔ لاگین یا خانه است → ری‌دایرکت به داشبورد */
  if (isAuth && (onAuthPage || onHomePage)) {
    const target = ADMIN_ROLES.includes(userRole as any)
      ? ADMIN_DASHBOARD_URL
      : USER_DASHBOARD_URL;
    return NextResponse.redirect(new URL(target, req.url));
  }

  /* ۲) کاربر لاگین نیست و مسیر محافظت‌شده می‌خواهد */
  if (!isAuth && onProtected) {
    const url = new URL(LOGIN_PAGE_URL, req.url);
    url.searchParams.set("redirect", pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  /* ۳) کاربر لاگین است ولی نقش نامجاز براى پنل ادمین */
  if (isAuth && onProtected && pathname.startsWith(ADMIN_DASHBOARD_URL)) {
    if (!ADMIN_ROLES.includes(userRole as any)) {
      return NextResponse.redirect(new URL(USER_DASHBOARD_URL, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/panel/:path*",
    "/bazaar/:path*",
    "/profile/:path*",
    "/auth/login",
    "/auth/sign-up",
  ],
};
