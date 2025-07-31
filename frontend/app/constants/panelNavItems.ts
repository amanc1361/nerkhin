// constants/panelNavItems.ts
import {
  LayoutDashboard,
  MapPinIcon,
  FolderClosedIcon,
  PackageIcon,
  UsersIcon,
  ShieldAlertIcon,
  BadgeCheckIcon,
  BadgeDollarSignIcon,
 
} from 'lucide-react';
import { panelMessages } from '@/app/constants/string'; // ایمپورت متن‌ها
import { PanelNavItem } from '@/app/types/panel/panelmenu';
export const panelNavItems: PanelNavItem[] = [
  {
    href: "/panel",
    label: panelMessages.dashboard,
    activePathSegment: "/panel",
    Icon: LayoutDashboard,
  },
  {
    href: "/panel/cities",
    label: panelMessages.cities,
    activePathSegment: "/panel/cities",
    Icon: MapPinIcon,
  },
  {
    href: "/panel/categories",
    label: panelMessages.categories,
    activePathSegment: "/panel/categories",
    Icon: FolderClosedIcon,
  },
  {
    href: "/panel/products/list", // یا مسیر اصلی محصولات /panel/products
    label: panelMessages.products,
    activePathSegment: "/panel/products",
    Icon: PackageIcon,
  },
  {
    href: "/panel/users/new-users", // یا مسیر اصلی کاربران /panel/users
    label: panelMessages.users,
    activePathSegment: "/panel/users",
    Icon: UsersIcon,
  },
  {
    href: "/panel/reports/new-reports", // یا مسیر اصلی /panel/reports
    label: panelMessages.reports,
    activePathSegment: "/panel/reports",
    Icon: ShieldAlertIcon,
  },
  {
    href: "/panel/admins",
    label: panelMessages.admins,
    activePathSegment: "/panel/admins",
    Icon: BadgeCheckIcon,
  },
  {
    href: "/panel/subscriptions",
    label: panelMessages.subscriptions,
    activePathSegment: "/panel/subscriptions",
    Icon: BadgeDollarSignIcon,
  },
];