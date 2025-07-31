// constants/panelProductTabs.ts
import { panelProductNavLabels } from '@/app/constants/string'; // ایمپورت لیبل‌ها

export interface PanelProductTabItem {
  label: string;
  href: string;
  pathname: string; // برای تشخیص تب فعال توسط PanelTabLayout
  order: number;
}

export const panelProductTabsData: PanelProductTabItem[] = [
  {
    label: panelProductNavLabels.requestedProducts,
    href: '/panel/products/new-products',
    pathname: '/panel/products/new-products', // یا '/panel/products' اگر این مسیر پایه است
    order: 1,
  },
  {
    label: panelProductNavLabels.approvedProducts,
    href: '/panel/products/approved-products',
    pathname: '/panel/products/approved-products',
    order: 2,
  },
  {
    label: panelProductNavLabels.addNewProduct,
    href: '/panel/products/add-new-product',
    pathname: '/panel/products/add-new-product',
    order: 3,
  },
];