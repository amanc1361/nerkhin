import React from "react";

interface RadioButtonProps {
  id: string;
  name: string;
  label: string;
  value: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  id,
  name,
  label,
  value,
  checked,
  onChange,
}) => {
  return (
    <div className="flex gap-2 items-center">
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
      />
      <label htmlFor={id} className="block text-md font-medium text-gray-700">
        {label}
      </label>
    </div>
  );
};
