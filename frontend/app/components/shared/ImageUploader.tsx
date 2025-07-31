// مسیر: components/shared/ImageUploader.tsx
"use client";

import React from 'react';
import { toast } from 'react-toastify';
import { UploadCloud, X } from 'lucide-react';
import { productMessages as messages } from '@/app/constants/productMessages';

interface ImageUploaderProps {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  defaultIndex: number;
  setDefaultIndex: (index: number) => void;
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  setImages,
  defaultIndex,
  setDefaultIndex,
  maxImages = 6, // شما در عکس خود ۴ جایگاه داشتید
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      if (images.length + filesArray.length > maxImages) {
        toast.error(messages.maxImagesError.replace('{maxImages}', String(maxImages)));
        return;
      }
      setImages(prev => [...prev, ...filesArray]);
      // پس از انتخاب، مقدار اینپوت را خالی می‌کنیم تا بتوان فایل تکراری را دوباره انتخاب کرد
      event.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    // جلوگیری از تغییر در حین آپلود
    if (document.readyState !== "complete") return;
    
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    
    // اگر تصویر پیش‌فرض حذف شد، اولین تصویر به عنوان پیش‌فرض جدید انتخاب شود
    if (defaultIndex === indexToRemove) {
      setDefaultIndex(0);
    } else if (defaultIndex > indexToRemove) {
      // اگر تصویری قبل از تصویر پیش‌فرض حذف شد، ایندکس پیش‌فرض را یکی کم کن
      setDefaultIndex(indexToRemove-1);
    }
  };

  return (
    <div className="w-full">
      <label className="text-base font-semibold text-gray-800 dark:text-gray-200">
        {messages.uploadImages}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-2">
        {images.map((file, index) => (
          <div 
            key={index} 
            className="relative aspect-square border-2 rounded-lg group transition-all"
            style={{ borderColor: index === defaultIndex ? 'var(--color-primary-main, #3B82F6)' : 'transparent' }} // استفاده از متغیر CSS یا رنگ مستقیم
          >
            <img 
              src={URL.createObjectURL(file)} 
              alt={`preview ${index}`} 
              className="w-full h-full object-cover rounded-lg" 
              onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)} // آزاد کردن حافظه
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1">
              <button 
                type="button" 
                onClick={() => removeImage(index)} 
                className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 hover:bg-white"
                title="حذف تصویر"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-0 w-full text-center bg-black/50 p-1 rounded-b-md cursor-pointer" onClick={() => setDefaultIndex(index)}>
                <input 
                  type="radio" 
                  id={`default-${index}`} 
                  name="defaultImage" 
                  checked={index === defaultIndex} 
                  onChange={() => setDefaultIndex(index)}
                  className="mr-1"
                />
                <label htmlFor={`default-${index}`} className="text-white text-xs font-bold select-none cursor-pointer">
                  {messages.defaultImage}
                </label>
              </div>
            </div>
          </div>
        ))}
        {images.length < maxImages && (
          <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500 dark:text-gray-400">
              <UploadCloud size={32}/>
              <p className="mb-2 text-sm">انتخاب عکس</p>
            </div>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange} 
              ref={fileInputRef}
            />
          </label>
        )}
      </div>
    </div>
  );
};