import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { authenticatedFetch } from '@/lib/server/server-api'; // مسیر فرضی
import { defaultRouteForRole, isAdmin } from '@/app/types/role'; // مسیر فرضی

const SECRET = process.env.NEXTAUTH_SECRET!;

export async function GET(req: Request) {
  const sessionToken = await getToken({ req: req as any, secret: SECRET });

  // ۱. بررسی اینکه کاربر فعلی ادمین است
  if (!sessionToken || !isAdmin(sessionToken.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get('userId');

  if (!targetUserId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // ۲. دریافت توکن تقلیدی از بک‌اند Go
    const { impersonationToken, user } = await authenticatedFetch(
      `/admin/users/${targetUserId}/impersonate`,
      { method: 'POST' }
    );

    // ۳. ذخیره توکن اصلی ادمین در یک کوکی جداگانه
    const adminTokenString = JSON.stringify(sessionToken);
    (await cookies()).set('impersonation_original_session', adminTokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    // ۴. ساخت یک آبجکت نشست جدید برای کاربر تقلید شده
    const impersonatedSession = {
      ...sessionToken, // کپی کردن برخی مقادیر پایه از نشست ادمین
      accessToken: impersonationToken,
      user: user, // اطلاعات کاربر جدید
      role: user.role,
      name: user.fullName,
      email: user.phone, // یا هر فیلد دیگری
      impersonating: true, // یک فلگ برای شناسایی در UI
    };

    // ۵. آپدیت کردن نشست next-auth با اطلاعات جدید
    // این بخش کمی پیچیده است و به نحوه پیاده‌سازی next-auth شما بستگی دارد.
    // راه ساده‌تر این است که اطلاعات جدید را در کوکی دیگری ذخیره کرده و middleware را آپدیت کنیم.
    // در اینجا ما یک کوکی جدید برای نشست تقلیدی ایجاد می‌کنیم.
    (await
          // ۵. آپدیت کردن نشست next-auth با اطلاعات جدید
          // این بخش کمی پیچیده است و به نحوه پیاده‌سازی next-auth شما بستگی دارد.
          // راه ساده‌تر این است که اطلاعات جدید را در کوکی دیگری ذخیره کرده و middleware را آپدیت کنیم.
          // در اینجا ما یک کوکی جدید برای نشست تقلیدی ایجاد می‌کنیم.
          cookies()).set('impersonated_session', JSON.stringify(impersonatedSession), {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         path: '/',
    });


    // ۶. ریدایرکت به داشبورد کاربر
    const redirectUrl = new URL(defaultRouteForRole(user.role), req.url);
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("Impersonation failed:", error);
    const adminPanelUrl = new URL('/panel', req.url); // بازگشت به پنل در صورت خطا
    return NextResponse.redirect(adminPanelUrl);
  }
}