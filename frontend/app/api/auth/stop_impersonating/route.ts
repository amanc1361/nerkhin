import { NextResponse } from 'next/server';
import { getToken, encode } from 'next-auth/jwt';
import { cookies } from 'next/headers';

const SECRET = process.env.NEXTAUTH_SECRET!;

export async function GET(req: Request) {
  const impersonatedSession = await getToken({ req: req as any, secret: SECRET });

  // ۱. استخراج نشست اصلی ادمین که قبلاً ذخیره کرده بودیم
  const adminSession = (impersonatedSession as any)?.originalAdminSession;

  if (adminSession) {
    // ۲. رمزنگاری مجدد توکن ادمین
    const encryptedAdminToken = await encode({
      token: adminSession,
      secret: SECRET,
    });

    // ۳. بازگرداندن توکن ادمین به کوکی اصلی next-auth
    const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token';
      
    (await cookies()).set(cookieName, encryptedAdminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  } else {
      // اگر به هر دلیلی نشست اصلی پیدا نشد، کاربر را لاگ‌اوت می‌کنیم
      const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token';
      (await cookies()).delete(cookieName);
  }

  // بازگشت به پنل ادمین
  const redirectUrl = new URL('/panel', req.url);
  return NextResponse.redirect(redirectUrl);
}