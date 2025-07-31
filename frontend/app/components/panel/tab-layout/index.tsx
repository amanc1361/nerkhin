'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ShoppingCart } from 'lucide-react'; // نیاز به نصب: lucide-react

interface NavItem {
  label: string;
  href: string;
  pathname: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'کاربران جدید',
    href: '/panel/users/new-users',
    pathname: '/panel/users/new-users',
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: 'عمده فروشان',
    href: '/panel/users/wholesale-users',
    pathname: '/panel/users/wholesale-users',
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    label: 'خرده فروشان',
    href: '/panel/users/retail-users',
    pathname: '/panel/users/retail-users',
    icon: <ShoppingCart className="w-5 h-5" />,
  },
];

export default function PanelSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r shadow-sm h-full">
      <div className="p-4 text-xl font-bold text-center border-b">مدیریت کاربران</div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.pathname);
          return (
            <Link key={item.href} href={item.href} passHref>
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
