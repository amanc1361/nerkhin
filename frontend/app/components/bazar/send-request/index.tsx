import React from "react"; // Explicitly import React

interface SendRequestButtonProps {
  label: string;
  onClick: () => void;
}

const SendRequestButton: React.FC<SendRequestButtonProps> = ({ label, onClick }) => {
    return (
        <button className="flex flex-row items-center justify-center w-full sm:w-358 h-56 bg-blue-dark text-gray-50 border rounded-xl" onClick={onClick}>
            <span className="pr-2">{label}</span>
        </button>
    );
}

export default SendRequestButton;
