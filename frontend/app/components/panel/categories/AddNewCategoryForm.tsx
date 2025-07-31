 

  "use client";

  import React, { useEffect, useRef, useState } from "react";
  import Image from "next/image";
  import { toast } from 'react-toastify';
  import { categoryMessages, categoryMessages as messages } from '@/app/constants/categoryMessages';
  import LoadingSpinner from '@/app/components/Loading/Loading';

  interface AddNewCategoryFormProps {
    parentId?: number | null;
    onSubmit: (formData: FormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
  }

  export const AddNewCategoryForm: React.FC<AddNewCategoryFormProps> = ({ parentId = null, onSubmit, onCancel, isSubmitting }) => {
    const [title, setTitle] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !image) {
        toast.error("عنوان و تصویر دسته نمی‌توانند خالی باشند.");
        return;
      }
      const formData = new FormData();
      // سرور Go شما انتظار data به صورت JSON دارد
      formData.append('data', JSON.stringify({ parentId, title }));
      // و فایل تصویر
      formData.append('images', image);
      
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex cursor-pointer flex-col items-center justify-center gap-2" onClick={() => fileInputRef.current?.click()}>
          <Image 
            width={80} 
            height={80} 
            alt="Upload Icon" 
            className="rounded-lg object-cover"
            src={imagePreview || "/icons/imageicon/1200px-Picture_icon_BLACK.svg.png"} // مسیر آیکون پیش‌فرض
          />
          <span className={`text-sm ${image ? "text-green-500" : "text-gray-500"}`}>
            {image ? messages.imageSelected : messages.imageLabel}
          </span>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1 text-right dark:text-gray-200">{messages.titleLabel}</label>
          <input 
            id="title" 
            name="title" 
            type="text" 
            placeholder={categoryMessages.titleLabel} 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required
            className="w-full rounded-lg border border-gray-300 p-2 text-center dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
          >
            {messages.cancel}
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting || !image || !title} 
            className="flex min-w-[100px] items-center justify-center rounded-lg bg-blue-dark px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? <LoadingSpinner size="small" mode="inline" /> : messages.submit}
          </button>
        </div>
      </form>
    );
  };