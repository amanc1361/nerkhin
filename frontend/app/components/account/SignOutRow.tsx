// components/account/SignOutRow.tsx
"use client";

import { signOut } from "next-auth/react";

const LogoutIcon = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 3a1 1 0 011 1v2H9V4a1 1 0 011-1zm1 17a1 1 0 01-1-1v-2h2v2a1 1 0 01-1 1zM4 11h8v2H4v-2zm13.293-4.707L14.586 9H21v2h-6.414l2.707 2.707-1.414 1.414L11.758 12l4.121-4.121 1.414 1.414z"/>
  </svg>
);

export default function SignOutRow() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex w-full items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-red-700 hover:bg-red-100"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-red-100 text-red-700">
          {LogoutIcon}
        </div>
        <span className="text-sm">خروج از حساب کاربری</span>
      </div>
      <svg className="h-5 w-5 rotate-180 text-red-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
      </svg>
    </button>
  );
}
