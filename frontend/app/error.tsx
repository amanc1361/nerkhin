'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // لاگ داخلی (می‌تونی اینجا به یک endpoint هم بفرستی)
    console.error('💥 error boundary caught:', error, 'digest:', error.digest);

    // اگر پیام خطا مربوط به احراز هویت/توکن بود → مستقیم لاگین
    const msg = (error?.message || '').toLowerCase();
    if (
      msg.includes('unauthorized') ||
      msg.includes('401') ||
      msg.includes('token') && (msg.includes('invalid') || msg.includes('expired'))
    ) {
      router.replace('/auth/login?reauth=1');
    }
  }, [error, router]);

  return (
    <main className="mx-auto max-w-md p-6 text-center space-y-4">
      <h1 className="text-2xl font-semibold">مشکلی پیش آمد</h1>
      <p className="text-sm text-gray-500">
        اگر مشکل موقتی بوده باشد، با زدن دکمهٔ زیر صفحه دوباره تلاش می‌شود.
      </p>
      {error?.digest && (
        <p className="text-xs text-gray-400">
          کد پیگیری: <code className="px-1 py-0.5 rounded bg-gray-100">{error.digest}</code>
        </p>
      )}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="rounded-lg px-4 py-2 border"
          aria-label="Try again"
        >
          Try again
        </button>
        <button
          onClick={() => router.replace('/')}
          className="rounded-lg px-4 py-2 border"
          aria-label="Go home"
        >
          صفحهٔ اصلی
        </button>
      </div>
    </main>
  );
}
