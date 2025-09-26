

// // مسیر: lib/server/authOptions.ts
// import type { NextAuthOptions, User } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { verifyCodeAPI, refreshAccessTokenAPI } from "@/app/services/authapi"; // Assuming this exists

// export const authOptions: NextAuthOptions = {
  
//   debug: process.env.NODE_ENV === "development",

//   providers: [
//     CredentialsProvider({
//       id: "credentials",
//       name: "Credentials",
//       credentials: {
//         phone: { label: "Phone", type: "text" },
//         code:  { label: "Code",  type: "text" },
//         deviceId: { label: "Device ID", type: "text" }, // <--- ADDED
//       },

//       async authorize(credentials) {
//         if (!credentials?.phone || !credentials?.code || !credentials.deviceId) { // <--- CHANGED
//           throw new Error("Phone, code, and deviceId are required");
//         }
        
//         try {
//           // CHANGED: Pass deviceId to the API call
//           const resp = await verifyCodeAPI(credentials.phone, credentials.code, credentials.deviceId);
          
//           if (resp?.user && resp.accessToken && resp.user.role !== undefined) {
//             const ttlSec = resp.accessTokenExpiresAt;
//             const absExp = Date.now() + ttlSec * 1000;

//             const subStatus = resp?.subscriptionStatus ?? resp?.user?.subscriptionStatus ?? "none";
//             const subExp = resp?.subscriptionExpiresAt ?? resp?.user?.subscriptionExpiresAt ?? null;

//             // This is the user object that gets passed to the jwt callback
//             const userForToken: User & {
//               accessToken: string;
//               refreshToken: string;
//               accessTokenExpires: number;
//               role: string | number;
//               subscriptionStatus?: string;
//               subscriptionExpiresAt?: string | null;
//             } = {
//               id:   String(resp.user.id),
//               name: resp.user.fullName,
//               role: resp.user.role,
//               accessToken:        resp.accessToken,
//               refreshToken:       resp.refreshToken,
//               accessTokenExpires: absExp,
//               subscriptionStatus: subStatus,
//               subscriptionExpiresAt: subExp,
//             };

//             return userForToken;
//           }
//           // If API returns something unexpected but not an error
//           return null;

//         } catch (error: any) {
//             // Re-throw the error with the message from the backend API
//             // This message will be available in `result.error` in the UI
//             throw new Error(error.message || "An unknown error occurred during authentication.");
//         }
//       },
//     }),
//   ],

//   session: { strategy: "jwt" },
//   pages:   { signIn: "/auth/login" },
//   secret:  process.env.NEXTAUTH_SECRET,

//   callbacks: {
//     // [The rest of the callbacks (jwt, session) remain the same as your provided file]
//     async jwt({ token, user }) {
//       if (user) {
//         token.id                    = user.id;
//         token.role                  = (user as any).role;
//         token.accessToken           = (user as any).accessToken;
//         token.refreshToken          = (user as any).refreshToken;
//         token.accessTokenExpires    = (user as any).accessTokenExpires;
//         token.subscriptionStatus    = (user as any).subscriptionStatus ?? "none";
//         token.subscriptionExpiresAt = (user as any).subscriptionExpiresAt ?? null;
//         return token;
//       }

//       if (
//         typeof token.accessTokenExpires === "number" &&
//         Date.now() < (token.accessTokenExpires as number) - 5 * 60_000
//       ) {
//         return token;
//       }

//       try {
//         const r = await refreshAccessTokenAPI(token.refreshToken as string);
//         const absExp = Date.now() + r.accessTokenExpiresAt * 1000;
//         return {
//           ...token,
//           accessToken:        r.accessToken,
//           accessTokenExpires: absExp,
//           refreshToken:       token.refreshToken,
//           subscriptionStatus:    (r as any).subscriptionStatus ?? (token as any).subscriptionStatus ?? "none",
//           subscriptionExpiresAt: (r as any).subscriptionExpiresAt ?? (token as any).subscriptionExpiresAt ?? null,
//         };
//       } catch (err) {
//         return { ...token, error: "RefreshAccessTokenError" };
//       }
//     },

//     async session({ session, token }) {
//       session.user.id     = token.id as string;
//       (session.user as any).role = token.role;
//       (session as any).accessToken = token.accessToken as string;
//       (session as any).error       = (token as any).error ?? undefined;
//       (session as any).subscriptionStatus    = (token as any).subscriptionStatus ?? "none";
//       (session as any).subscriptionExpiresAt = (token as any).subscriptionExpiresAt ?? null;
//       return session;
//     },
//   },
// };
// مسیر: lib/server/authOptions.ts
// مسیر: lib/server/authOptions.ts
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyCodeAPI, refreshAccessTokenAPI } from "@/app/services/authapi";

// --- Helper: در صورت نیاز، بعد از رفرش، پروفایل تازه را از بک‌اند بگیر ---
async function fetchFreshProfile(opts: {
  accessToken: string;
  uid?: string | number | null;
}) {
  const base =
    process.env.INTERNAL_GO_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "";

  if (!base) return null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${opts.accessToken}`,
  };

  const uid = opts.uid ? String(opts.uid) : undefined;

  const candidates = [
    `${base}/api/auth/me`,
    `${base}/api/users/me`,
    uid ? `${base}/api/users/${uid}/profile` : null,
    uid ? `${base}/api/users/${uid}` : null,
  ].filter(Boolean) as string[];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: "GET", headers, cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      // به دنبال نقش/وضعیت اشتراک می‌گردیم
      if (data && (data.role !== undefined || data.subscriptionStatus !== undefined)) {
        return {
          role: data.role,
          subscriptionStatus: data.subscriptionStatus,
          subscriptionExpiresAt: data.subscriptionExpiresAt ?? null,
        };
      }
    } catch {
      // مسیر بعدی را امتحان کن
    }
  }
  return null;
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",

  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" },
        deviceId: { label: "Device ID", type: "text" },
      },

      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code || !credentials.deviceId) {
          throw new Error("Phone, code, and deviceId are required");
        }

        try {
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
              id: String(resp.user.id),
              name: resp.user.fullName,
              role: resp.user.role,
              accessToken: resp.accessToken,
              refreshToken: resp.refreshToken,
              accessTokenExpires: absExp,
              subscriptionStatus: subStatus,
              subscriptionExpiresAt: subExp,
            };

            return userForToken;
          }
          return null;
        } catch (error: any) {
          throw new Error(
            error?.message || "An unknown error occurred during authentication."
          );
        }
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // پشتیبانی از فورس‌رفرش با trigger="update" اضافه شد؛ سایر رفتارها حفظ شده‌اند
    async jwt({ token, user, trigger }) {
      // 1) لاگین اولیه: اطلاعات را در توکن بنشان
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.accessTokenExpires = (user as any).accessTokenExpires;
        token.subscriptionStatus =
          (user as any).subscriptionStatus ?? "none";
        token.subscriptionExpiresAt =
          (user as any).subscriptionExpiresAt ?? null;
        return token;
      }

      // 2) فورس‌رفرش وقتی از کلاینت useSession().update() صدا زده شود
      if (trigger === "update" && token?.refreshToken) {
        try {
          const r = await refreshAccessTokenAPI(token.refreshToken as string);
          const absExp = Date.now() + r.accessTokenExpiresAt * 1000;

          // نقش/اشتراک جدید اگر بک‌اند در پاسخ رفرش بدهد
          let nextRole =
            (r as any).role ??
            (r as any).user?.role ??
            (token as any).role;
          let nextSubStatus =
            (r as any).subscriptionStatus ??
            (token as any).subscriptionStatus ??
            "none";
          let nextSubExpiresAt =
            (r as any).subscriptionExpiresAt ??
            (token as any).subscriptionExpiresAt ??
            null;

          // در صورت عدم بازگشت ادعاهای جدید، بلافاصله پروفایل را بگیر
          if (!nextRole || nextSubStatus === "none") {
            try {
              const prof = await fetchFreshProfile({
                accessToken: r.accessToken,
                uid: token.id as string,
              });
              if (prof) {
                nextRole = prof.role ?? nextRole;
                nextSubStatus = prof.subscriptionStatus ?? nextSubStatus;
                nextSubExpiresAt =
                  prof.subscriptionExpiresAt ?? nextSubExpiresAt;
              }
            } catch {
              // نادیده بگیر؛ از مقادیر قبلی استفاده می‌کنیم
            }
          }

          return {
            ...token,
            accessToken: r.accessToken,
            accessTokenExpires: absExp,
            refreshToken: token.refreshToken,
            role: nextRole,
            subscriptionStatus: nextSubStatus,
            subscriptionExpiresAt: nextSubExpiresAt,
            error: undefined,
          };
        } catch (err) {
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }

      // 3) اگر هنوز زود است، همان توکن فعلی را برگردان
      if (
        typeof token.accessTokenExpires === "number" &&
        Date.now() < (token.accessTokenExpires as number) - 5 * 60_000
      ) {
        return token;
      }

      // 4) رفرش خودکار نزدیک انقضا (رفتار قبلی)
      try {
        const r = await refreshAccessTokenAPI(token.refreshToken as string);
        const absExp = Date.now() + r.accessTokenExpiresAt * 1000;

        return {
          ...token,
          accessToken: r.accessToken,
          accessTokenExpires: absExp,
          refreshToken: token.refreshToken,
          subscriptionStatus:
            (r as any).subscriptionStatus ??
            (token as any).subscriptionStatus ??
            "none",
          subscriptionExpiresAt:
            (r as any).subscriptionExpiresAt ??
            (token as any).subscriptionExpiresAt ??
            null,
          role:
            (r as any).role ?? (r as any).user?.role ?? (token as any).role,
          error: undefined,
        };
      } catch (err) {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as any).role = token.role;
      (session as any).accessToken = token.accessToken as string;
      (session as any).error = (token as any).error ?? undefined;
      (session as any).subscriptionStatus =
        (token as any).subscriptionStatus ?? "none";
      (session as any).subscriptionExpiresAt =
        (token as any).subscriptionExpiresAt ?? null;
      return session;
    },
  },
};
