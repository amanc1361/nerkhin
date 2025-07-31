import React from "react";
import { User } from "@/app/types/types"; // Import User type

interface UserItemProps {
  name: User['fullName'];
  phoneNumber: User['username']; // Assuming username is the phone number
  validationTime: User['createdAt']; // Assuming validationTime is createdAt
}

const UserItem: React.FC<UserItemProps> = ({ name, phoneNumber, validationTime }) => {
  return (
    <div className="flex flex-row justify-between content-center border-b-1 text-center p-4">
      <span>{name}</span>
      <span>{phoneNumber}</span>
      <span>{validationTime}</span>
    </div>
  );
}

export default UserItem;
