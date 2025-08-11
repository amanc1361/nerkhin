'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('🌐 global error:', error, 'digest:', error.digest);

  return (
    <html>
      <body>
        <main className="mx-auto max-w-md p-6 text-center space-y-4">
          <h1 className="text-2xl font-semibold">خطای غیرمنتظره</h1>
          {error?.digest && (
            <p className="text-xs text-gray-400">
              کد پیگیری: <code className="px-1 py-0.5 rounded bg-gray-100">{error.digest}</code>
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => reset()} className="rounded-lg px-4 py-2 border">
              Try again
            </button>
            <a href="/auth/login?reauth=1" className="rounded-lg px-4 py-2 border">
              ورود دوباره
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
