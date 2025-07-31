import React, { useState, useCallback } from "react";

interface InputProps {
  id: string;
  type?: React.HTMLInputTypeAttribute; // Use React.HTMLInputTypeAttribute for type prop
  onChange: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
}

export const Input: React.FC<InputProps> = ({
  id,
  type = "text",
  onChange,
  defaultValue = "",
  placeholder,
  label,
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        className="w-full border-1 rounded-xl p-2 border-gray-light"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
      />
    </div>
  );
};
