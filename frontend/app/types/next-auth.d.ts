// فایل: types/next-auth.d.ts

import { DefaultSession, User as DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';

// با این کار، ما تایپ‌های پیش‌فرض NextAuth.js را با فیلدهای سفارشی خود گسترش می‌دهیم.

// گسترش تایپ JWT (توکن داخلی NextAuth.js)
declare module 'next-auth/jwt' {
  /** The shape of the JWT payload */
  interface JWT extends DefaultJWT {
    /** نقش کاربر */
    role: string | number;
    /** Access Token شما که از سرور Go گرفته شده */
    accessToken: string;
    /** Refresh Token شما که از سرور Go گرفته شده */
    refreshToken: string;
    /** زمان انقضای Access Token به صورت timestamp عددی */
    accessTokenExpires: number;
    /** برای انتقال خطای بازآوری توکن به کلاینت */
    error?: 'RefreshAccessTokenError';
  }
}

// گسترش تایپ Session (که در کلاینت از طریق useSession قابل دسترس است)
declare module 'next-auth' {
  /**
   * آبجکت User که از تابع authorize شما برگردانده می‌شود
   * و در اولین فراخوانی callback jwt قابل دسترس است.
   */
  interface User extends DefaultUser {
    role: string | number;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }

  /**
   * آبجکت Session که در کلاینت از طریق useSession() یا در سرور از طریق getServerSession() قابل دسترس است.
   */
  interface Session {
    user: {
      /** نقش کاربر */
      role: string | number;
      /** شناسه کاربر */
      id: string; // id کاربر که از توکن می‌آید
    } & DefaultSession['user']; // ترکیب با پراپرتی‌های پیش‌فرض session.user (name, email, image)

    /** Access Token شما که در کلاینت برای ارسال به API ها استفاده می‌شود */
    accessToken: string;
    /** خطای احتمالی هنگام بازآوری توکن */
    error?: 'RefreshAccessTokenError';
  }
}