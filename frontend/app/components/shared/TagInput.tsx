// مسیر: components/shared/TagInput.tsx
"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  // پراپ setTags با onTagsChange جایگزین شد
  onTagsChange: (newTags: string[]) => void;
  placeholder?: string;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange, placeholder = "تگ جدید..." }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        onTagsChange([...tags, newTag]); // فراخوانی پراپ جدید
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove)); // فراخوانی پراپ جدید
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
      {tags.map((tag, index) => (
        <div key={index} className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          <span>{tag}</span>
          <button type="button" onClick={() => removeTag(tag)} className="ml-1"><X size={14} /></button>
        </div>
      ))}
      <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="flex-grow bg-transparent p-1 outline-none"/>
    </div>
  );
};