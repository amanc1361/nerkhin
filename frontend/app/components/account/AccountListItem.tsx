// components/account/AccountListItem.tsx
import Link from "next/link";

export default function AccountListItem({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-gray-100">
          {icon || <span>•</span>}
        </div>
        <span className="text-sm">{title}</span>
      </div>
      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
      </svg>
    </Link>
  );
}
