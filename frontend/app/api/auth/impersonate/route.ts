import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { authenticatedFetch } from '@/lib/server/server-api';
import { defaultRouteForRole, isAdmin } from '@/app/types/role';

const SECRET = process.env.NEXTAUTH_SECRET!;

export async function GET(req: Request) {
  const adminSession = await getToken({ req: req as any, secret: SECRET });

  if (!adminSession || !isAdmin(adminSession.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get('userId');

  if (!targetUserId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const { impersonationToken, user } = await authenticatedFetch(
      `/user/users/${targetUserId}/impersonate`,
      { method: 'POST' }
    );

    const impersonatedSession = {
      ...adminSession,
      accessToken: impersonationToken,
      name: user.fullName,
      email: user.phone,
      role: user.role,
      user: user,
      impersonating: true,
    };
    
    // --- شروع تغییرات ---
    // کوکی‌ها را قبل از ذخیره، کدگذاری می‌کنیم
    const encodedAdminSession = encodeURIComponent(JSON.stringify(adminSession));
    const encodedImpersonatedSession = encodeURIComponent(JSON.stringify(impersonatedSession));

    (await cookies()).set('admin_original_session', encodedAdminSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 15, // ۱۵ دقیقه
    });

    (await cookies()).set('impersonated_session_payload', encodedImpersonatedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 15,
    });
    // --- پایان تغییرات ---

    const redirectUrl = new URL(defaultRouteForRole(user.role), req.url);
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("Impersonation failed:", error);
    const adminPanelUrl = new URL('/panel/users?error=impersonation_failed', req.url);
    return NextResponse.redirect(adminPanelUrl);
  }
}