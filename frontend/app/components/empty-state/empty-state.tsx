import Image from 'next/image';
import React from 'react';
// import EmptyImage from '../../public/empty.svg'; 

interface EmptyStateProps {
  text: string;
  imgSize?: number;
}

const EmptyState: React.FC<EmptyStateProps> = ({ text, imgSize = 164 }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[124px]">
      <Image height={imgSize} width={imgSize} src='/empty.svg' alt="Empty state illustration" />
      <p>{text}</p>
    </div>
  );
};

export default EmptyState;
