import { NextResponse } from 'next/server';
import { getToken, encode } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { authenticatedFetch } from '@/lib/server/server-api';
import { defaultRouteForRole, isAdmin } from '@/app/types/role';

const SECRET = process.env.NEXTAUTH_SECRET!;

export async function POST(req: Request) { // <-- تغییر به POST
  try {
    const adminSession = await getToken({ req:req as any, secret: SECRET });

    if (!adminSession || !isAdmin(adminSession.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId: targetUserId } = await req.json(); // <-- خواندن از بدنه‌ی درخواست

    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { impersonationToken, user } = await authenticatedFetch(
      `/user/users/${targetUserId}/impersonate`,
      { method: 'POST' }
    );

    const impersonatedPayload = {
      ...adminSession,
      accessToken: impersonationToken,
      name: user.fullName,
      email: user.phone,
      role: user.role,
      user: user,
      impersonating: true,
      originalAdminSession: adminSession,
    };
    
    const encryptedImpersonationToken = await encode({
      token: impersonatedPayload,
      secret: SECRET,
    });
    
    const cookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token';
      
    (await cookies()).set(cookieName, encryptedImpersonationToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    const redirectUrl = defaultRouteForRole(user.role);
    return NextResponse.json({ success: true, redirectUrl });

  } catch (error) {
    console.error("Impersonation failed:", error);
    return NextResponse.json({ success: false, error: 'Impersonation failed' }, { status: 500 });
  }
}