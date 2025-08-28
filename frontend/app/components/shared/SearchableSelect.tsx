// app/components/shared/SearchableSelect.tsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type SearchableSelectOption = { value: number | string; label: string };

type Props = {
  value: number | string | "";
  onChange: (v: number | string | "") => void;
  items: SearchableSelectOption[];
  placeholder: string;
  searchPlaceholder?: string;
  noOptionsText?: string;
  disabled?: boolean;
  className?: string;
  dir?: "rtl" | "ltr";
};

export default function SearchableSelect({
  value,
  onChange,
  items,
  placeholder,
  searchPlaceholder,
  noOptionsText = "",
  disabled,
  className = "",
  dir = "rtl",
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRTL = dir === "rtl";
  const iconSideClass = isRTL ? "left-2" : "right-2";        // ← آیکن سمت چپ در RTL
  const iconPaddingClass = isRTL ? "pl-10" : "pr-10";        // ← پدینگ از سمت آیکن

  const selected = useMemo(
    () => items.find((i) => i.value === value),
    [items, value]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => (i.label || "").toLowerCase().includes(s));
  }, [items, q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQ("");
        setActive(0);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const displayValue = open ? q : (selected?.label ?? "");
  const currentPlaceholder = open ? (searchPlaceholder || placeholder) : placeholder;

  const selectByIndex = (idx: number) => {
    const it = filtered[idx];
    if (!it) return;
    onChange(it.value);
    setOpen(false);
    setQ("");
    setActive(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectByIndex(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQ("");
      setActive(0);
    }
  };

  return (
    <div ref={ref} dir={dir} className={`relative ${className}`}>
      {/* تک‌اینپوت */}
      <div className="relative">
        <input
          ref={inputRef}
          dir={dir}
          value={displayValue}
          onChange={(e) => { if (open) { setQ(e.target.value); setActive(0); } }}
          onFocus={() => setOpen(true)}
          readOnly={!open}
          placeholder={currentPlaceholder}
          disabled={disabled}
          onKeyDown={onKeyDown}
          className={`w-full p-3 ${iconPaddingClass} rounded-2xl border border-slate-200 bg-white outline-none
            ${open ? "rounded-b-none border-b-0" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          role="combobox"
          aria-controls="searchable-select-list"
        />

        {/* آیکن کشویی: در RTL سمت چپ */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen((o) => !o)}
          className={`absolute inset-y-0 ${iconSideClass} flex items-center text-slate-400`}
          aria-label="toggle"
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {open && !disabled && (
        <div className="absolute z-50 left-0 right-0 -mt-px rounded-2xl rounded-t-none border border-slate-200 bg-white shadow-lg">
          <ul id="searchable-select-list" role="listbox" className="max-h-64 overflow-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-400">{noOptionsText}</li>
            ) : (
              filtered.map((it, idx) => (
                <li
                  key={`${it.value}`}
                  role="option"
                  aria-selected={value === it.value}
                  onMouseEnter={() => setActive(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectByIndex(idx)}
                  className={`px-3 py-2 cursor-pointer text-sm
                    ${idx === active ? "bg-slate-100" : ""}
                    ${value === it.value ? "font-medium" : ""}`}
                >
                  {it.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
