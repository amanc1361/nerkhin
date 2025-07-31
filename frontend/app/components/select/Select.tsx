import React, { useState, useEffect, useRef } from "react";
import CustomChevronDown from "../icon-components/ChevronDown"; // Updated import path
import { XCircle } from "lucide-react"; // ChevronDown is replaced by CustomChevronDown

interface Option {
  value: string | number | undefined;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string | number | undefined;
  onChange: (selectedOption: Option, currentValue: string | number | undefined) => void;
  placeholder?: string;
  hasCustomIcon?: boolean;
  close?: boolean;
  size?: "sm" | "md";
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  hasCustomIcon = false,
  close = true,
  size,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (option: Option) => {
    onChange(option, value);
    setIsOpen(false);
  };

  const getSelectedOption = (): Option | undefined => {
    return options.find((option) => option.value === value);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const removeSelectedOption = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    onChange({ value: undefined, label: "" }, value); // Pass an empty option to clear selection
    setIsOpen(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = getSelectedOption();

  return (
    <div ref={selectRef} className="w-full">
      <button
        type="button"
        className={`w-full ${
          size === "md" ? "h-14" : "h-11"
        } flex justify-between items-center border-1 rounded-xl p-2 border-gray-light`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <div className="flex gap-2 items-center">
          {hasCustomIcon ? <CustomChevronDown /> : <CustomChevronDown />} {/* Using CustomChevronDown consistently */}
          {value !== undefined && close && (
            <XCircle size={20} onClick={removeSelectedOption} />
          )}
        </div>
      </button>
      <div className="relative">
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`block w-full px-4 py-2 text-right ${
                  selectedOption && selectedOption.value === option.value ? "bg-blue-100" : ""
                } hover:bg-blue-100 focus:outline-none`}
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
