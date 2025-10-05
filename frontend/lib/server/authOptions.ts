
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyCodeAPI, refreshAccessTokenAPI } from "@/app/services/authapi";
import { API_BASE_URL, INTERNAL_GO_API_URL } from "@/app/config/apiConfig";

/* -------------------- helpers: base resolver -------------------- */
const clean = (s: string) => (s || "").replace(/\/+$/, "");
const isAbs = (s: string) => /^https?:\/\//i.test(s);
const withLeadingSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);

function resolveRootBase(publicBase?: string, internalBase?: string) {
  const pb = clean(publicBase || "/api/go");          // همون چیزی که تو پروژه‌ت استفاده می‌کنی
  const ib = clean(internalBase || "");
  if (isAbs(pb)) return pb;
  if (!ib) return withLeadingSlash(pb);
  const tail = withLeadingSlash(pb);
  if (ib.endsWith(tail)) return ib;
  return ib + tail;
}

/* -------------------- مهم: گرفتن پروفایل با توکن تازه -------------------- */
/** دقیقا همان اندپوینت پروژهٔ خودت: GET /user/fetch-user */
async function fetchProfileByAccessToken(accessToken: string) {
  const base = resolveRootBase(API_BASE_URL, INTERNAL_GO_API_URL);
  const url = `${base}/user/fetch-user`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    // اگر پروفایل برنگشت، ادعاها را از پاسخ رفرش تغییر نمی‌دهیم
    return null;
  }

  // پاسخ بک‌اند خودت را بدون حدس می‌خوانیم
  const data = await res.json().catch(() => null);
  if (!data) return null;

  // فیلدها طبق API خودت (همونی که در server-api استفاده می‌کنی)
  return {
    role: (data as any)?.role,
    subscriptionStatus: (data as any)?.subscriptionStatus,
    subscriptionExpiresAt: (data as any)?.subscriptionExpiresAt ?? null,
  };
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",

  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        phone:    { label: "Phone",    type: "text" },
        code:     { label: "Code",     type: "text" },
        deviceId: { label: "Device ID", type: "text" },
      },

      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code || !credentials.deviceId) {
          throw new Error("Phone, code, and deviceId are required");
        }

        const resp = await verifyCodeAPI(
          credentials.phone,
          credentials.code,
          credentials.deviceId
        );

        if (resp?.user && resp.accessToken && resp.user.role !== undefined) {
          const ttlSec = resp.accessTokenExpiresAt;
          const absExp = Date.now() + ttlSec * 1000;

          const subStatus =
            resp?.subscriptionStatus ??
            resp?.user?.subscriptionStatus ??
            "none";
          const subExp =
            resp?.subscriptionExpiresAt ??
            resp?.user?.subscriptionExpiresAt ??
            null;

          const userForToken: User & {
            accessToken: string;
            refreshToken: string;
            accessTokenExpires: number;
            role: string | number;
            subscriptionStatus?: string;
            subscriptionExpiresAt?: string | null;
          } = {
            id:   String(resp.user.id),
            name: resp.user.fullName,
            role: resp.user.role,
            accessToken:        resp.accessToken,
            refreshToken:       resp.refreshToken,
            accessTokenExpires: absExp,
            subscriptionStatus: subStatus,
            subscriptionExpiresAt: subExp,
          };

          return userForToken;
        }

        return null;
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages:   { signIn: "/auth/login" },
  secret:  process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, trigger }) {
      // 1) ورود اولیه
      if (user) {
        token.id                    = user.id;
        token.role                  = (user as any).role;
        token.accessToken           = (user as any).accessToken;
        token.refreshToken          = (user as any).refreshToken;
        token.accessTokenExpires    = (user as any).accessTokenExpires;
        token.subscriptionStatus    = (user as any).subscriptionStatus ?? "none";
        token.subscriptionExpiresAt = (user as any).subscriptionExpiresAt ?? null;
        return token;
      }

      // 2) فورس‌رفرش به‌محض update() از صفحهٔ موفقیت
      if (trigger === "update" && token?.refreshToken) {
        try {
          const r = await refreshAccessTokenAPI(token.refreshToken as string);
          const absExp = Date.now() + r.accessTokenExpiresAt * 1000;

          // ✅ بعد از گرفتن توکن تازه، پروفایل واقعیِ همین لحظه را از بک‌اند خودت می‌گیریم
          let claims = await fetchProfileByAccessToken(r.accessToken);

          return {
            ...token,
            accessToken:        r.accessToken,
            accessTokenExpires: absExp,
            refreshToken:       token.refreshToken,
            role:               (claims?.role ?? (token as any).role) as any,
            subscriptionStatus: claims?.subscriptionStatus ?? (token as any).subscriptionStatus ?? "none",
            subscriptionExpiresAt: claims?.subscriptionExpiresAt ?? (token as any).subscriptionExpiresAt ?? null,
            error: undefined,
          };
        } catch {
          // اگر رفرش شکست خورد، ارور را روی توکن می‌گذاریم (UI می‌تواند نشان دهد)
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }

      // 3) اگر هنوز وقت رفرش نیست، توکن فعلی را برگردان
      if (
        typeof token.accessTokenExpires === "number" &&
        Date.now() < (token.accessTokenExpires as number) - 5 * 60_000
      ) {
        return token;
      }

      // 4) رفرش خودکار نزدیک انقضا + همگام‌سازی ادعاها از بک‌اند خودت
      try {
        const r = await refreshAccessTokenAPI(token.refreshToken as string);
        const absExp = Date.now() + r.accessTokenExpiresAt * 1000;

        let claims = await fetchProfileByAccessToken(r.accessToken);

        return {
          ...token,
          accessToken:        r.accessToken,
          accessTokenExpires: absExp,
          refreshToken:       token.refreshToken,
          role:               (claims?.role ?? (token as any).role) as any,
          subscriptionStatus: claims?.subscriptionStatus ?? (token as any).subscriptionStatus ?? "none",
          subscriptionExpiresAt: claims?.subscriptionExpiresAt ?? (token as any).subscriptionExpiresAt ?? null,
          error: undefined,
        };
      } catch {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as any).role = token.role;
      (session as any).accessToken = token.accessToken as string;
      (session as any).error       = (token as any).error ?? undefined;
      (session as any).subscriptionStatus    = (token as any).subscriptionStatus ?? "none";
      (session as any).subscriptionExpiresAt = (token as any).subscriptionExpiresAt ?? null;
      return session;
    },
  },
};
