import Link from "next/link";
import type { SVGProps } from "react";
import Logo2 from "../Logo/logo2";
import Logo3 from "../Logo/logo3";

// مسیرها را مطابق محل قرار دادن فایل‌های شما تنظیم کنید

type Variant = "logo2" | "logo3";

type Props = SVGProps<SVGSVGElement> & {
  /** کدام لوگو رندر شود */
  variant?: Variant;
  /** اگر مقدار داشته باشد، لوگو لینک می‌شود */
  href?: string | null;
  /** برای a11y */
  title?: string;
  /** کلاس سایز مثل w-10 h-auto؛ اگر ندهید مقدار پیش‌فرض اعمال می‌شود */
  className?: string;
};

export default function BrandLogo({
  variant = "logo3",
  href = "",
  title = "Nerkhin",
  className = "w-14 h-auto",
  ...rest
}: Props) {
  const Node = variant === "logo2" ? Logo2 : Logo3;

  const el = <Node aria-label={title} className={className} {...rest} />;

  return href ? (
    <Link href={href} aria-label={title} className="inline-flex items-center">
      {el}
    </Link>
  ) : (
    el
  );
}
