import type { LucideProps } from 'lucide-react';

export interface PanelNavItem {
  href: string;
  label: string; // متن لیبل مستقیماً از messages گرفته می‌شود
  activePathSegment: string; // برای تشخیص مسیر فعال (مثلاً "/panel/cities")
  Icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>; // تایپ صحیح برای کامپوننت‌های آیکون lucide-react
}
