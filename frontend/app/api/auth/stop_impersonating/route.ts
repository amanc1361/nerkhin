import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  // حذف کوکی‌های تقلیدی
  (await
        // حذف کوکی‌های تقلیدی
        cookies()).delete('impersonated_session');
  (await cookies()).delete('impersonation_original_session');
  
  // بازگشت به پنل ادمین
  const redirectUrl = new URL('/panel', req.url);
  return NextResponse.redirect(redirectUrl);
}