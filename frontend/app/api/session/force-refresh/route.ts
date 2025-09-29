// app/api/session/force-refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { encode } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { refreshAccessTokenAPI } from "@/app/services/authapi";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";

export const runtime = "nodejs";

/* ---------------- helpers ---------------- */
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

function toMs(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number") return v < 1e12 ? v * 1000 : v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n < 1e12 ? n * 1000 : n;
    const d = Date.parse(v);
    return Number.isNaN(d) ? 0 : d;
  }
  const d = Date.parse(String(v));
  return Number.isNaN(d) ? 0 : d;
}

async function getJSON<T>(url: string, accessToken?: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function resolveActiveSubscription(accessToken: string): Promise<{
  status: "active" | "trial" | "none";
  expiresAt: string | number | null;
}> {
  const base = resolveBase(API_BASE_URL, INTERNAL_GO_API_URL);

  type UserSub = { expiresAt?: string | number | null } | Record<string, any>;
  const list1 = await getJSON<UserSub[]>(
    `${base}/user-subscription/fetch-user-subscriptions`,
    accessToken
  );
  const list = list1 ?? (await getJSON<UserSub[]>(`${base}/user-subscription/list`, accessToken));

  if (Array.isArray(list) && list.length) {
    const maxMs = list.reduce((mx, it) => {
      const t = toMs((it as any)?.expiresAt);
      return t > mx ? t : mx;
    }, 0);
    if (maxMs > Date.now()) {
      return { status: "active", expiresAt: maxMs };
    }
  }

  const prof = await getJSON<{ subscriptionStatus?: string; subscriptionExpiresAt?: any }>(
    `${base}/user/fetch-user`,
    accessToken
  );
  if (prof) {
    const st = (prof.subscriptionStatus as any) ?? "none";
    const ex = prof.subscriptionExpiresAt ?? null;
    const exMs = toMs(ex);
    if ((st === "active" || st === "trial") && exMs > Date.now()) {
      return { status: st === "trial" ? "trial" : "active", expiresAt: ex };
    }
  }

  return { status: "none", expiresAt: null };
}

function pickSessionCookieName(req: NextRequest) {
  return req.cookies.has("__Secure-next-auth.session-token")
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
}

/* ---------------- types ---------------- */
type AppJWT = JWT & {
  id?: string;
  role: string | number;
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string | number | null;
  error?: "RefreshAccessTokenError";
};

/* ---------------- handler ---------------- */
export async function POST(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Missing NEXTAUTH_SECRET" }, { status: 500 });
  }

  const curr = await getToken({ req, secret }).catch(() => null);
  if (!curr || !(curr as any).refreshToken) {
    return NextResponse.json({ ok: false, error: "NoToken" }, { status: 401 });
  }

  try {
    // 1) **مستقیم رفرش توکن بک‌اند** (همین‌جا اگر refreshToken جدید داد، استفاده می‌کنیم)
    const r: any = await refreshAccessTokenAPI((curr as any).refreshToken as string);
    const absExp = Date.now() + (r.accessTokenExpiresAt ?? r.expiresIn ?? 0) * 1000;

    // 2) ادعاهای اشتراک را همین الان از API خودت محاسبه کن
    const sub = await resolveActiveSubscription(r.accessToken);

    // 3) نقش را اگر لازم داری جداگانه هم می‌توانی از پروفایل بخوانی؛ فعلاً نقش قبلی حفظ می‌شود
    const base = curr as AppJWT;

    // 🔴 مهم: اگر بک‌اند Refresh Token را rotate می‌کند، اینجا به‌روزرسانی‌اش کن
    const nextRefreshToken =
      (r.refreshToken as string | undefined) && typeof r.refreshToken === "string"
        ? r.refreshToken
        : base.refreshToken;

    // 4) JWT جدید با ادعاهای تازه
    const nextToken: AppJWT = {
      ...base,
      accessToken: r.accessToken,
      accessTokenExpires: absExp,
      refreshToken: nextRefreshToken,                  // ← اگر rotate شده باشد، همین‌جا عوض می‌شود
      role: base.role,
      subscriptionStatus: sub.status,                  // ← «active/trial/none»
      subscriptionExpiresAt: sub.expiresAt,            // ← تاریخ دقیق
      error: undefined,
    };

    // 5) امضا و ست‌کردن کوکی سشن NextAuth
    const jwt = await encode({ token: nextToken, secret });
    const cookieName = pickSessionCookieName(req);
    const secure = cookieName.startsWith("__Secure-") || process.env.NODE_ENV === "production";

    const res = NextResponse.json({
      ok: true,
      subscriptionStatus: sub.status,
      subscriptionExpiresAt: sub.expiresAt,
      rotated: nextRefreshToken !== base.refreshToken, // برای دیباگ: آیا رفرش‌توکن عوض شد؟
    });
    res.cookies.set(cookieName, jwt, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure,
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "RefreshFailed" }, { status: 500 });
  }
}
