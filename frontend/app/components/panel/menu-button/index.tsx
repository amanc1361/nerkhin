"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface ClientPanelMenuButtonProps {
  children: React.ReactNode;
  label: string;
  href: string;
  menuPathname: string;
}

const ClientPanelMenuButton: React.FC<ClientPanelMenuButtonProps> = ({
  children,
  label,
  href,
  menuPathname,
}) => {
  const pathname = usePathname();

  const isActive =
    (menuPathname === "/panel" && pathname === "/panel") ||
    (menuPathname !== "/panel" && pathname.includes(menuPathname));

  return (
    <Link href={href} className="block">
      <div
        className={`
          group flex items-center gap-3 px-5 py-3 my-1 rounded-md cursor-pointer transition-all duration-200
          ${isActive
            ? "bg-blue-dark text-white font-semibold shadow-inner"
            : "text-white hover:bg-blue-light hover:text-white hover:shadow"
          }
        `}
      >
        <div className="w-5 h-5 text-inherit">{children}</div>
        <span className="text-sm">{label}</span>
      </div>
    </Link>
  );
};

export default ClientPanelMenuButton;
