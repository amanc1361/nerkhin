"use client";

import React from "react";
import Link from "next/link";

// اگر util مخصوص ترکیب کلاس‌ها نداری، از این استفاده کن
function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

type IconType = React.ComponentType<{ className?: string }>;

export type SocialItem = {
  key: string;
  label: string;
  href?: string | null;
  Icon: IconType; // ← به جای ReactNode خود کامپوننت آیکن را بفرست
};

interface SocialIconsProps {
  socials: SocialItem[];
  className?: string;
  size?: number; // سایز اختیاری (px)
  activeClassName?: string;   // برای شخصی‌سازی رنگ حالت فعال
  inactiveClassName?: string; // برای شخصی‌سازی رنگ حالت غیرفعال
}

const SocialIcons: React.FC<SocialIconsProps> = ({
  socials,
  className,
  size = 24,
  activeClassName = "text-blue-500 hover:text-blue-600",
  inactiveClassName = "text-gray-400",
}) => {
  return (
    <div className={cx("flex justify-between gap-3", className)}>
      {socials.map(({ key, label, href, Icon }) => {
        const isActive = !!href && href.trim().length > 0;
        const iconClasses = cx(
          "transition-colors",
          // سایز را با tailwind via arbitrary values ست می‌کنیم
          // (اگر نمی‌خواهی arbitrary استفاده شود، می‌توانی w-6 h-6 نگه داری)
          `w-[${size}px] h-[${size}px]`,
          isActive ? activeClassName : inactiveClassName
        );

        const icon = <Icon className={iconClasses} />;

        return isActive ? (
          <Link
            key={key}
            href={href!}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
          >
            {icon}
          </Link>
        ) : (
          <span key={key} aria-label={label} title={label} aria-disabled="true">
            {icon}
          </span>
        );
      })}
    </div>
  );
};

export default SocialIcons;
