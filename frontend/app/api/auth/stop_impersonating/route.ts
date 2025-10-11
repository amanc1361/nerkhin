import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const originalSessionCookie = (await cookies()).get('admin_original_session');

  if (originalSessionCookie?.value) {
    // بازگرداندن نشست اصلی ادمین به کوکی اصلی next-auth
    (await
          // بازگرداندن نشست اصلی ادمین به کوکی اصلی next-auth
          cookies()).set('next-auth.session-token', originalSessionCookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  // پاک کردن کوکی موقت
  (await
        // پاک کردن کوکی موقت
        cookies()).delete('admin_original_session');

  // بازگشت به پنل ادمین
  const redirectUrl = new URL('/panel', req.url);
  return NextResponse.redirect(redirectUrl);
}