import { Suspense } from "react";
import RefreshBridgeClient from "./RefreshBridgeClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RefreshBridgePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl p-8 shadow">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
               در حال بررسی اطلاعات کاربر........

            </p>
          </div>
        </div>
      </main>
    }>
      <RefreshBridgeClient />
    </Suspense>
  );
}
