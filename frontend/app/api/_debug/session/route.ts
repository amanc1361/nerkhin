// app/api/_debug/session/route.ts
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/server/authOptions";

export async function GET() {
  const h = headers();
  const c = cookies();

  const session = await getServerSession(authOptions);

  const cookieNames = (await c).getAll().map((ck) => ck.name);
  const authCookie = (await c).get(
    process.env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token"
  );

  const payload = {
    ok: true,
    now: new Date().toISOString(),
    urlHeaders: {
      host: (await h).get("host"),
      xForwardedHost: (await h).get("x-forwarded-host"),
      xForwardedProto: (await h).get("x-forwarded-proto"),
      xForwardedFor: (await h).get("x-forwarded-for"),
      referer: (await h).get("referer"),
      userAgent: (await h).get("user-agent"),
    },
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
      NEXTAUTH_COOKIE_DOMAIN: process.env.NEXTAUTH_COOKIE_DOMAIN || null,
      NODE_ENV: process.env.NODE_ENV,
    },
    cookies: {
      names: cookieNames,
      hasAuthCookie: !!authCookie,
      authCookieMeta: authCookie
        ? { name: authCookie.name, valueLen: authCookie.value.length }
        : null,
    },
    session: session
      ? {
          hasUser: !!session.user,
          user: {
            id: (session.user as any)?.id ?? null,
            role: (session.user as any)?.role ?? null,
          },
          subscriptionStatus: (session as any)?.subscriptionStatus ?? null,
          subscriptionExpiresAt: (session as any)?.subscriptionExpiresAt ?? null,
        }
      : null,
  };

  return NextResponse.json(payload);
}
