// app/api/auth/force-refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { encode } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { refreshAccessTokenAPI } from "@/app/services/authapi";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";

// ---- helpers ----
const clean = (s: string) => (s || "").replace(/\/+$/, "");
const isAbs = (s: string) => /^https?:\/\//i.test(s);
const withSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);
function resolveBase(publicBase?: string, internalBase?: string) {
  const pb = clean(publicBase || "/api/go");
  const ib = clean(internalBase || "");
  if (isAbs(pb)) return pb;
  if (!ib) return withSlash(pb);
  const tail = withSlash(pb);
  return ib.endsWith(tail) ? ib : ib + tail;
}

async function fetchProfileByAccessToken(accessToken: string) {
  const base = resolveBase(API_BASE_URL, INTERNAL_GO_API_URL);
  const url = `${base}/user/fetch-user`;
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  if (!data) return null;
  return {
    role: (data as any)?.role,
    subscriptionStatus: (data as any)?.subscriptionStatus,
    subscriptionExpiresAt: (data as any)?.subscriptionExpiresAt ?? null,
  };
}

function pickSessionCookieName(req: NextRequest) {
  return req.cookies.has("__Secure-next-auth.session-token")
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
}

// اگر در پروژه‌تان JWT Augment شده و فیلدها اجباری‌اند، این نوع با آن هم‌راستاست
type AppJWT = JWT & {
  role: string | number;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string | number | null;
  error?: string;
};

export async function POST(req: Request) {
  const secret = process.env.NEXTAUTH_SECRET!;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Missing NEXTAUTH_SECRET" }, { status: 500 });
  }

  // getToken نیاز به NextRequest دارد
  const nreq = new NextRequest(req.url, { headers: req.headers });
  const curr = await getToken({ req: nreq, secret }); // توکن فعلی از کوکی
  if (!curr || !(curr as any).refreshToken) {
    return NextResponse.json({ ok: false, error: "NoToken" }, { status: 401 });
  }

  try {
    // 1) توکن جدید از بک‌اند
    const r = await refreshAccessTokenAPI((curr as any).refreshToken as string);
    const absExp = Date.now() + r.accessTokenExpiresAt * 1000;

    // 2) ادعاهای فعلی از پروفایل
    const claims = await fetchProfileByAccessToken(r.accessToken);

    // 3) ساخت JWT جدید مطابق نوع Augmented شما
    const base = curr as AppJWT; // از کوکی فعلی شروع می‌کنیم
    const nextToken: AppJWT = {
      ...base,
      accessToken: r.accessToken,
      accessTokenExpires: absExp,
      refreshToken: base.refreshToken,
      role: (claims?.role ?? base.role) as any,
      subscriptionStatus: claims?.subscriptionStatus ?? base.subscriptionStatus ?? "none",
      subscriptionExpiresAt: claims?.subscriptionExpiresAt ?? base.subscriptionExpiresAt ?? null,
      error: undefined,
      // (اختیاری) زمان صدور/انقضا: اگر در پروژه شما لازم است
      // iat: Math.floor(Date.now() / 1000),
      // exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    };

    // 4) امضا و ست‌کردن کوکی سشن NextAuth
    const jwt = await encode({ token: nextToken, secret }); // ← الان نوع درست است
    const res = NextResponse.json({ ok: true });
    const cookieName = pickSessionCookieName(nreq);
    const secure = cookieName.startsWith("__Secure-") || process.env.NODE_ENV === "production";

    res.cookies.set(cookieName, jwt, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure,
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "RefreshFailed" }, { status: 500 });
  }
}
