"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ImpersonationBanner() {
  const { data: session } = useSession();
  
  // @ts-ignore
  if (!session?.impersonating) {
    return null;
  }

  return (
    <div className="bg-yellow-400 text-black text-center p-2 font-semibold">
      {/* @ts-ignore */}
      شما در حال مشاهده سایت به جای "{session.user.name}" هستید.
      <Link href="/api/auth/stop_impersonating" className="ml-4 font-bold underline">
        بازگشت به پنل ادمین
      </Link>
    </div>
  );
}