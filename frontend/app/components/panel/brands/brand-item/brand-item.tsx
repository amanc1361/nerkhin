// // مسیر: components/panel/categories/BrandItem.tsx
// "use client";
// import React from 'react';
// import { Brand } from '@/app/types/types';
// import { Edit, Trash2, ArrowLeft } from 'lucide-react';
// import Link from 'next/link';

// interface BrandItemProps {
//   brand: Brand;
//   onEdit: () => void;
//   onDelete: () => void;
// }
// export const BrandItem: React.FC<BrandItemProps> = ({ brand, onEdit, onDelete }) => {
//   return (
//         <Link href={`/panel/brand/${brand.id}/category/${brand.categoryId}/models`} className="hover:text-green-600" title="مدیریت مدل‌ها">
//     <div className="flex items-center justify-between py-2 pl-4 border-b border-dashed dark:border-gray-700/50 group">
//       <span className="font-medium text-gray-700 dark:text-gray-300">{brand.title}</span>
//       <div className="flex items-center gap-4 text-gray-500">
//         <button onClick={onEdit} className="hover:text-blue-dark" title="ویرایش برند"><Edit size={15} /></button>
//         <button onClick={onDelete} className="hover:text-red-500" title="حذف برند"><Trash2 size={15} /></button>
        
//       </div>
//     </div>
//         </Link>
//   );
// };


"use client";
import React from 'react';
import { Brand } from '@/app/types/types';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BrandItemProps {
  brand: Brand;
  onEdit: () => void;
  onDelete: () => void;
}

export const BrandItem: React.FC<BrandItemProps> = ({ brand, onEdit, onDelete }) => {
  return (
    // The main container is still a link for easy navigation
    <Link 
    href={`/panel/brand/${brand.id}/category/${brand.categoryId}/models`} // The link to your new page
      className="flex items-center justify-between py-2 pl-4 border-b border-dashed dark:border-gray-700/50 group hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md"
    >
      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-dark">
        {brand.title}
      </span>

      {/* Container for action buttons */}
      <div className="flex items-center gap-4 text-gray-500">
        <button 
          onClick={(e) => {
            e.preventDefault(); // Prevents the link navigation
            e.stopPropagation(); // Stops the event from bubbling to the parent Link
            onEdit(); // Opens the edit modal
          }} 
          className="hover:text-blue-dark" 
          title="Edit Brand"
        >
          <Edit size={15} />
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault(); // Prevents the link navigation
            e.stopPropagation(); // Stops the event from bubbling to the parent Link
            onDelete(); // Opens the delete modal
          }} 
          className="hover:text-red-500" 
          title="Delete Brand"
        >
          <Trash2 size={15} />
        </button>
      
      </div>
    </Link>
  );
};

export default BrandItem;