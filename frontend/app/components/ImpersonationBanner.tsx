"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ImpersonationBanner() {
  const { data: session } = useSession();
  
  // @ts-ignore
  const isImpersonating = session?.impersonating;
  // @ts-ignore
  const userName = session?.user?.name || 'کاربر';

  if (!isImpersonating) {
    return null;
  }

  return (
    <div className="bg-yellow-400 text-black text-center p-2 font-semibold sticky top-0 z-50">
      شما در حال مشاهده سایت به جای "{userName}" هستید.
      <Link href="/api/auth/stop_impersonating" className="mr-4 font-bold underline hover:text-blue-700">
        بازگشت به پنل ادمین
      </Link>
    </div>
  );
}