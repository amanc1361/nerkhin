import React from "react"; // Import React

interface SaveChangesButtonProps {
  label: string;
  confirm: () => void;
}

const SaveChangesButton: React.FC<SaveChangesButtonProps> = ({ label, confirm }) => {
  return (
    <button
      onClick={confirm}
      className="flex flex-row w-1/2 sm:w-358 h-56 items-center justify-center text-gray-50 bg-blue-dark border border-gray-50 rounded-xl"
    >
      <span>{label}</span>
    </button>
  );
};

export default SaveChangesButton;
