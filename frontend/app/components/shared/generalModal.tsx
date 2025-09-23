"use client";
import React, { useEffect, useCallback } from "react";
import { X } from "lucide-react";


interface ReusableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Dialog width options */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const sizeMap: Record<NonNullable<ReusableModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-5xl w-11/12",
};

const ReusableModal: React.FC<ReusableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "xl",
}) => {
  // بستن با کلید Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // جلوگیری از بستن هنگام کلیک روی محتوای مودال
  const stopPropagation = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation(),
    [],
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={stopPropagation}
        style={{ scrollbarWidth: "none" }} // برای Firefox
        className={`${sizeMap[size]} relative mx-auto w-full max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ease-out dark:bg-gray-800`}
      >
        {/* هِدر */}
        <header className="flex items-center justify-between border-b pb-3 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-1 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </header>

        {/* بدنه */}
        <section className="mt-4">{children}</section>
      </div>
    </div>
  );
};

export default ReusableModal;
