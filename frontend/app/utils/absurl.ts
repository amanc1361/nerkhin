export function absApiUrl(path = ''): string {
  const base = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const rel  = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/go').replace(/\/$/, '')

  // اگر path کامل است
  if (path.startsWith('http')) return path

  // ⬅️ اگر path خالی است هیچ اسلش اضافه نکن
  if (path === '') return `${base}${rel}`

  // در غیر این صورت یک / بین rel و path
  return `${base}${rel}${path.startsWith('/') ? '' : '/'}${path}`
}