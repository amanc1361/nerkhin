import Image from "next/image";
import React from "react"; // Explicitly import React

interface ViolationReportButtonProps {
  label: string;
  onClick?: () => void; // Added optional onClick handler
}

const ViolationReportButton: React.FC<ViolationReportButtonProps> = ({ label, onClick }) => {
  return (
    <button
      className="flex flex-row w-full h-56 items-center justify-center bg-blue-dark text-white border rounded-xl"
      onClick={onClick}
    >
      <Image
        src="/icons/message/message.svg"
        alt="edit"
        width={24}
        height={24}
        priority={false}
      />
      <span className="pr-2">{label}</span>
    </button>
  );
}

export default ViolationReportButton;
