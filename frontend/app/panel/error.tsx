'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('🛠 panel error:', error, 'digest:', error.digest);

    const msg = (error?.message || '').toLowerCase();
    if (
      msg.includes('unauthorized') ||
      msg.includes('401') ||
      (msg.includes('token') && (msg.includes('invalid') || msg.includes('expired')))
    ) {
      router.replace('/auth/login?reauth=1');
    }
  }, [error, router]);

  return (
    <main className="mx-auto max-w-md p-6 text-center space-y-4">
      <h1 className="text-2xl font-semibold">مشکل در بخش پنل</h1>
      <p className="text-sm text-gray-500">لطفاً دوباره تلاش کنید یا به داشبورد برگردید.</p>
      {error?.digest && (
        <p className="text-xs text-gray-400">
          کد پیگیری: <code className="px-1 py-0.5 rounded bg-gray-100">{error.digest}</code>
        </p>
      )}
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => reset()} className="rounded-lg px-4 py-2 border">Try again</button>
        <a href="/panel" className="rounded-lg px-4 py-2 border">داشبورد</a>
      </div>
    </main>
  );
}
