// فایل: middleware.ts

import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';


const SECRET = process.env.NEXTAUTH_SECRET;

const LOGIN_PAGE_URL = '/auth/login';
const SIGNUP_PAGE_URL = '/auth/sign-up';
const ADMIN_DASHBOARD_URL = '/panel';
const USER_DASHBOARD_URL = '/bazaar';
const PUBLIC_HOME_PAGE_URL = '/'; // مسیر صفحه اصلی

// نقش‌ها را دقیقاً مطابق با مقادیری که در توکن شما ذخیره می‌شود، تعریف کنید
const ADMIN_ROLES: Array<number | string> = [1, 2, "1", "2", "admin", "superadmin"];
const USER_ROLES: Array<number | string> = [3, 4, "3", "4", "user", "wholesaler", "retailer"];

// مسیرهایی که برای دسترسی به آن‌ها حتماً باید لاگین کرده باشید
const PROTECTED_ROUTES = [ADMIN_DASHBOARD_URL, USER_DASHBOARD_URL, '/profile'];

export async function middleware(req: NextRequest) {
  // اطلاعات نشست کاربر را از کوکی امن NextAuth.js با استفاده از secret می‌خواند
  const session = await getToken({ req, secret: SECRET });
  const { pathname } = req.nextUrl;

  const isAuthenticated = !!session;
  const userRole = session?.role as string | number | null;

  const isTryingAuthPage = pathname.startsWith(LOGIN_PAGE_URL) || pathname.startsWith(SIGNUP_PAGE_URL);
  const isTryingHomePage = pathname === PUBLIC_HOME_PAGE_URL;
  const isTryingProtectedPath = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // --- سناریو ۱: کاربر لاگین کرده و در صفحه لاگین/ثبت‌نام یا صفحه اصلی است ---
  if (isAuthenticated && (isTryingAuthPage || isTryingHomePage)) {
    let targetDashboard = USER_DASHBOARD_URL; // داشبورد پیش‌فرض
    if (userRole !== null && ADMIN_ROLES.includes(userRole)) {
      targetDashboard = ADMIN_DASHBOARD_URL;
    }
    
    // فوراً به داشبورد مربوط به نقش کاربر هدایت می‌شود
    return NextResponse.redirect(new URL(targetDashboard, req.url));
  }

  // --- سناریو ۲: کاربر لاگین نکرده و سعی در دسترسی به یک مسیر محافظت‌شده دارد ---
  if (!isAuthenticated && isTryingProtectedPath) {
    // به صفحه لاگین هدایت می‌شود و مسیر درخواستی اصلی ذخیره می‌شود
    const redirectUrl = new URL(LOGIN_PAGE_URL, req.url);
    redirectUrl.searchParams.set('redirect', pathname + req.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  // --- سناریو ۳: کاربر لاگین کرده و در یک مسیر محافظت‌شده است (بررسی دسترسی نقش) ---
  if (isAuthenticated && isTryingProtectedPath && userRole !== null) {
    const isAdminPath = pathname.startsWith(ADMIN_DASHBOARD_URL);
    const isUserAdmin = ADMIN_ROLES.includes(userRole);

    // اگر کاربر با نقش عادی سعی در دسترسی به پنل ادمین دارد
    if (isAdminPath && !isUserAdmin) {
      // او را به داشبورد خودش هدایت کن
      return NextResponse.redirect(new URL(USER_DASHBOARD_URL, req.url));
    }
    // می‌توانید منطق‌های پیچیده‌تر دیگری برای نقش‌ها در اینجا اضافه کنید
  }

  // اگر هیچکدام از شرایط بالا برقرار نبود، اجازه دسترسی به مسیر درخواستی داده می‌شود
  return NextResponse.next();
}

// --- به‌روزرسانی config.matcher ---
export const config = {
  matcher: [
    // مسیر صفحه اصلی را برای اجرای Middleware اضافه می‌کنیم
    '/',

    // مسیرهای محافظت شده
    '/panel/:path*',
    '/bazaar/:path*',
    '/profile/:path*',

    '/auth/login',
    '/auth/sign-up',
    
  ],
};



