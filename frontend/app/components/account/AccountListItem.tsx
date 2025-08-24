// components/account/AccountListItem.tsx
import Link from "next/link";

export default function AccountListItem({
  href,
  title,
  icon,
  count,
}: {
  href: string;
  title: string;
  icon?: React.ReactNode;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 py-3 hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-gray-700">
          {icon || <span className="text-lg">›</span>}
        </div>
        <span className="text-sm">{title}</span>
      </div>

      <div className="ms-2 flex items-center gap-3">
        {typeof count === "number" && count > 0 && (
          <span className="grid h-7 min-w-7 place-items-center rounded-lg bg-gray-100 px-2 text-xs text-gray-700">
            {count}
          </span>
        )}
        <svg className="h-5 w-5 rotate-180 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
        </svg>
      </div>
    </Link>
  );
}
