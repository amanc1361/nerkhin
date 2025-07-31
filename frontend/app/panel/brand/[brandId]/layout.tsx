import React from "react";

/* اگر فقط برای نمایش children است و brandId لازم ندارید ➜
   می‌توانید بخش استخراج brandId را حذف کنید. */
interface RouteParams {
  brandId: string;
}

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  /** مطابق LayoutProps: Promise<any> | undefined */
  params?: Promise<RouteParams>;
}) {
  const p: RouteParams | undefined =
    params && typeof (params as any).then === "function"
      ? await params
      : (params as unknown as RouteParams | undefined);

  

  return (
    <div className="h-full">
  
      {children}
    </div>
  );
}
