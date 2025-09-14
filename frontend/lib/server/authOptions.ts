// // // مسیر: lib/server/authOptions.ts
// // import type { NextAuthOptions } from "next-auth";
// // import CredentialsProvider from "next-auth/providers/credentials";
// // import { verifyCodeAPI, refreshAccessTokenAPI } from "@/app/services/authapi";
// // import type { User } from "next-auth";

// // // کمکى کوچک براى JWT-های Paseto یا …
// // export function decodeJwtPayload(token: string): { exp?: number } | null {
// //   try {
// //     const payload = JSON.parse(
// //       Buffer.from(token.split(".")[1], "base64").toString()
// //     );
// //     return payload ?? null;
// //   } catch {
// //     return null;
// //   }
// // }

// // export const authOptions: NextAuthOptions = {
  
// //   debug: process.env.NODE_ENV === "development",

// //   providers: [
// //     CredentialsProvider({
// //       id: "credentials",
// //       name: "Credentials",
// //       credentials: {
// //         phone: { label: "Phone", type: "text" },
// //         code:  { label: "Code",  type: "text" },
// //       },

// //       async authorize(credentials) {
// //         if (!credentials?.phone || !credentials?.code)
// //           throw new Error("Phone & code required");
// //          try {
// //         const resp = await verifyCodeAPI(credentials.phone, credentials.code);
// //            if (resp?.user && resp.accessToken && resp.user.role !== undefined) { 
// //           const ttlSec = resp.accessTokenExpiresAt;        // ← عددى که سرور برمى‌گرداند (ثانیه)
// //           const absExp = Date.now() + ttlSec * 1000;       // ← تبدیل به timestamp مطلق

// //           const user: User & {
// //             accessToken: string;
// //             refreshToken: string;
// //             accessTokenExpires: number;
// //             role: string | number;
// //           } = {
// //             id:   String(resp.user.id),
// //             name: resp.user.fullName,
// //             role: resp.user.role,
// //             accessToken:        resp.accessToken,
// //             refreshToken:       resp.refreshToken,
// //             accessTokenExpires: absExp,
// //           };

// //           return user;
// //         }  }
// //         catch (err) {
// //             console.error("🔴 verifyCodeAPI FETCH FAILED:", err);
// //         }
// //         return null;
// //       },
// //     }),
// //   ],

// //   session: { strategy: "jwt" },
// //   pages:   { signIn: "/auth/login" },
// //   secret:  process.env.NEXTAUTH_SECRET,

// //   callbacks: {
// //     /** هر بار که توکن ساخته یا خوانده می‌شود */
// //     async jwt({ token, user }) {
// //       /* ورود اولیه */
// //       if (user) {
// //         token.id                 = user.id;
// //         token.role               = user.role;
// //         token.accessToken        = user.accessToken;
// //         token.refreshToken       = user.refreshToken;
// //         token.accessTokenExpires = user.accessTokenExpires;
// //         return token;
// //       }

// //       /* اگر هنوز ≥۵ دقیقه تا انقضا مانده، همان را برگردان */
// //       if (
// //         typeof token.accessTokenExpires === "number" &&
// //         Date.now() < token.accessTokenExpires - 5 * 60_000
// //       ) {
// //         return token;
// //       }

// //       /* رفرش توکن */
// //       try {
// //         const r = await refreshAccessTokenAPI(token.refreshToken as string);
// //         const absExp = Date.now() + r.accessTokenExpiresAt * 1000;

// //         return {
// //           ...token,
// //           accessToken:        r.accessToken,
// //           accessTokenExpires: absExp,
// //           refreshToken:       token.refreshToken, // ممکن است سرور refreshToken جدید ندهد
// //         };
// //       } catch (err) {
// //         return { ...token, error: "RefreshAccessTokenError" };
// //       }
// //     },

// //     /** دادهٔ سشن که به کلاینت می‌رود */
// //     async session({ session, token }) {
// //       session.user.id     = token.id as string;
// //       session.user.role   = token.role;
// //       session.accessToken = token.accessToken as string;
// //       session.error       = (token as any).error ?? undefined;
// //       return session;
// //     },
// //   },
// // };




// // مسیر: lib/server/authOptions.ts
// import type { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { verifyCodeAPI, refreshAccessTokenAPI } from "@/app/services/authapi";
// import type { User } from "next-auth";

// // کمکى کوچک براى JWT-های Paseto یا …
// export function decodeJwtPayload(token: string): { exp?: number } | null {
//   try {
//     const payload = JSON.parse(
//       Buffer.from(token.split(".")[1], "base64").toString()
//     );
//     return payload ?? null;
//   } catch {
//     return null;
//   }
// }

// export const authOptions: NextAuthOptions = {
  
//   debug: process.env.NODE_ENV === "development",

//   providers: [
//     CredentialsProvider({
//       id: "credentials",
//       name: "Credentials",
//       credentials: {
//         phone: { label: "Phone", type: "text" },
//         code:  { label: "Code",  type: "text" },
//       },

//       async authorize(credentials) {
//         if (!credentials?.phone || !credentials?.code)
//           throw new Error("Phone & code required");
//         try {
//           const resp = await verifyCodeAPI(credentials.phone, credentials.code);
//           if (resp?.user && resp.accessToken && resp.user.role !== undefined) {
//             const ttlSec = resp.accessTokenExpiresAt;        // ← عددى که سرور برمى‌گرداند (ثانیه)
//             const absExp = Date.now() + ttlSec * 1000;       // ← تبدیل به timestamp مطلق

//             // NEW ⬇️ استخراج فیلدهای اشتراک از پاسخ بک‌اند (سطح ریشه یا user)
//             const subStatus =
//               resp?.subscriptionStatus ??
//               resp?.user?.subscriptionStatus ??
//               "none";
//             const subExp =
//               resp?.subscriptionExpiresAt ??
//               resp?.user?.subscriptionExpiresAt ??
//               null;

//             const user: User & {
//               accessToken: string;
//               refreshToken: string;
//               accessTokenExpires: number;
//               role: string | number;
//               // NEW ⬇️
//               subscriptionStatus?: string;
//               subscriptionExpiresAt?: string | null;
//             } = {
//               id:   String(resp.user.id),
//               name: resp.user.fullName,
//               role: resp.user.role,
//               accessToken:        resp.accessToken,
//               refreshToken:       resp.refreshToken,
//               accessTokenExpires: absExp,
//               // NEW ⬇️
//               subscriptionStatus: subStatus,
//               subscriptionExpiresAt: subExp,
//             };

//             return user;
//           }
//         } catch (err) {
//           console.error("🔴 verifyCodeAPI FETCH FAILED:", err);
//         }
//         return null;
//       },
//     }),
//   ],

//   session: { strategy: "jwt" },
//   pages:   { signIn: "/auth/login" },
//   secret:  process.env.NEXTAUTH_SECRET,

//   callbacks: {
//     /** هر بار که توکن ساخته یا خوانده می‌شود */
//     async jwt({ token, user }) {
//       /* ورود اولیه */
//       if (user) {
//         token.id                 = user.id;
//         token.role               = (user as any).role;
//         token.accessToken        = (user as any).accessToken;
//         token.refreshToken       = (user as any).refreshToken;
//         token.accessTokenExpires = (user as any).accessTokenExpires;

//         // NEW ⬇️ عبور دادن وضعیت اشتراک به توکن
//         token.subscriptionStatus    = (user as any).subscriptionStatus ?? "none";
//         token.subscriptionExpiresAt = (user as any).subscriptionExpiresAt ?? null;

//         return token;
//       }

//       /* اگر هنوز ≥۵ دقیقه تا انقضا مانده، همان را برگردان */
//       if (
//         typeof token.accessTokenExpires === "number" &&
//         Date.now() < (token.accessTokenExpires as number) - 5 * 60_000
//       ) {
//         return token;
//       }

//       /* رفرش توکن */
//       try {
//         const r = await refreshAccessTokenAPI(token.refreshToken as string);
//         const absExp = Date.now() + r.accessTokenExpiresAt * 1000;

//         return {
//           ...token,
//           accessToken:        r.accessToken,
//           accessTokenExpires: absExp,
//           refreshToken:       token.refreshToken, // ممکن است سرور refreshToken جدید ندهد
//           // NEW ⬇️ اگر سرور در رفرش هم این فیلدها را فرستاد، به‌روز کن
//           subscriptionStatus:    (r as any).subscriptionStatus ?? (token as any).subscriptionStatus ?? "none",
//           subscriptionExpiresAt: (r as any).subscriptionExpiresAt ?? (token as any).subscriptionExpiresAt ?? null,
//         };
//       } catch (err) {
//         return { ...token, error: "RefreshAccessTokenError" };
//       }
//     },

//     /** دادهٔ سشن که به کلاینت می‌رود */
//     async session({ session, token }) {
//       session.user.id     = token.id as string;
//       (session.user as any).role = token.role;
//       (session as any).accessToken = token.accessToken as string;
//       (session as any).error       = (token as any).error ?? undefined;

//       // NEW ⬇️ این دو فیلد را هم به سشن بده؛ میدل‌ور از getToken همین‌ها را می‌خوانَد
//       (session as any).subscriptionStatus    = (token as any).subscriptionStatus ?? "none";
//       (session as any).subscriptionExpiresAt = (token as any).subscriptionExpiresAt ?? null;

//       return session;
//     },
//   },
// };


// مسیر: lib/server/authOptions.ts
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyCodeAPI, refreshAccessTokenAPI } from "@/app/services/authapi"; // Assuming this exists

export const authOptions: NextAuthOptions = {
  
  debug: process.env.NODE_ENV === "development",

  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code:  { label: "Code",  type: "text" },
        deviceId: { label: "Device ID", type: "text" }, // <--- ADDED
      },

      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code || !credentials.deviceId) { // <--- CHANGED
          throw new Error("Phone, code, and deviceId are required");
        }
        
        try {
          // CHANGED: Pass deviceId to the API call
          const resp = await verifyCodeAPI(credentials.phone, credentials.code, credentials.deviceId);
          
          if (resp?.user && resp.accessToken && resp.user.role !== undefined) {
            const ttlSec = resp.accessTokenExpiresAt;
            const absExp = Date.now() + ttlSec * 1000;

            const subStatus = resp?.subscriptionStatus ?? resp?.user?.subscriptionStatus ?? "none";
            const subExp = resp?.subscriptionExpiresAt ?? resp?.user?.subscriptionExpiresAt ?? null;

            // This is the user object that gets passed to the jwt callback
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
          // If API returns something unexpected but not an error
          return null;

        } catch (error: any) {
            // Re-throw the error with the message from the backend API
            // This message will be available in `result.error` in the UI
            throw new Error(error.message || "An unknown error occurred during authentication.");
        }
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages:   { signIn: "/auth/login" },
  secret:  process.env.NEXTAUTH_SECRET,

  callbacks: {
    // [The rest of the callbacks (jwt, session) remain the same as your provided file]
    async jwt({ token, user }) {
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

      if (
        typeof token.accessTokenExpires === "number" &&
        Date.now() < (token.accessTokenExpires as number) - 5 * 60_000
      ) {
        return token;
      }

      try {
        const r = await refreshAccessTokenAPI(token.refreshToken as string);
        const absExp = Date.now() + r.accessTokenExpiresAt * 1000;
        return {
          ...token,
          accessToken:        r.accessToken,
          accessTokenExpires: absExp,
          refreshToken:       token.refreshToken,
          subscriptionStatus:    (r as any).subscriptionStatus ?? (token as any).subscriptionStatus ?? "none",
          subscriptionExpiresAt: (r as any).subscriptionExpiresAt ?? (token as any).subscriptionExpiresAt ?? null,
        };
      } catch (err) {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    async session({ session, token }) {
      session.user.id     = token.id as string;
      (session.user as any).role = token.role;
      (session as any).accessToken = token.accessToken as string;
      (session as any).error       = (token as any).error ?? undefined;
      (session as any).subscriptionStatus    = (token as any).subscriptionStatus ?? "none";
      (session as any).subscriptionExpiresAt = (token as any).subscriptionExpiresAt ?? null;
      return session;
    },
  },
};