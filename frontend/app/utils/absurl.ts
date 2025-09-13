// export function absApiUrl(path = ''): string {
//   const base = (process.env.NEXTAUTH_URL ?? 'https://nerrkhin.com')
//   const rel  = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api').replace(/\/$/, '')

//   // اگر path کامل است
//   if (path.startsWith('http')) return path

//   // ⬅️ اگر path خالی است هیچ اسلش اضافه نکن
//   if (path === '') return `${base}${rel}`

//   // در غیر این صورت یک / بین rel و path
//   return `${base}${rel}${path.startsWith('/') ? '' : '/'}${path}`
// }



/**
 * در همهٔ لایه‌ها (کلاینت یا سرور) یک URL کامل برمی‌گرداند.
 *
 * @param path  مسیر دلخواه مثل "/auth/login"
 * @returns     URL کامل مثل "https://nerrkhin.com/api/auth/login" یا "/api/auth/login"
 */
export function absApiUrl(path = ""): string {
  // اگر در Node.js اجرا می‌شود (SSR، middleware، authorize…)
const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")
    || "https://nerrkhin.com/api";
  return base + path;
  }

  // اگر در مرورگر اجرا می‌شود
