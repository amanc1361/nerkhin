"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { Category, Brand } from '@/app/types/types'; // مسیر صحیح
import { categoryMessages as messages } from '@/app/constants/categoryMessages'; // مسیر صحیح
import { useCategoryActions } from '@/app/hooks/useCategoryActions';
import { useAuthenticatedApi } from '@/app/hooks/useAuthenticatedApi';


import { PlusCircle, Trash2, ChevronDown, Edit } from 'lucide-react';

import ReusableModal from '@/app/components/shared/generalModal';
import ConfirmationDialog from '@/app/components/shared/ConfirmationDialog';

import LoadingSpinner from '@/app/components/Loading/Loading';
import { brandApi } from '@/app/services/categoryApi';

import { AddNewCategoryForm } from './AddNewCategoryForm';
import { AddNewBrandForm } from './AddNewBrandForm';
import { BrandItem } from '../brands/brand-item/brand-item';
import Link from 'next/link';

const IMAGE_HOST = process.env.NEXT_PUBLIC_IMAGE_HOST || '';

interface CategoryItemProps {
  category: Category;
  level: number;
  onActionSuccess: () => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({ category, level, onActionSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modal, setModal] = useState<{ type: string | null; data?: any }>({ type: null });
  
  // State محلی برای نگهداری برندها؛ دیگر از category.brands استفاده نمی‌کنیم
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  const { api } = useAuthenticatedApi();
  const { isSubmitting, performAction } = useCategoryActions();

  const isSubCategory = level > 0;
  const hasSubCategories = category.subCategories && category.subCategories.length > 0;
  
  // یک آیتم قابل باز شدن است اگر زیردسته داشته باشد یا خودش یک زیردسته باشد (که می‌تواند برند داشته باشد)
  const canExpand = hasSubCategories || isSubCategory;

  // تابع برای واکشی برندها فقط در صورت نیاز
  const fetchBrands = useCallback(async () => {
    if (!api) return;
    setIsLoadingChildren(true);
    try {
      const fetchedBrands = await api.get<Brand[]>(brandApi.getByCategory(category.id));
      setBrands(fetchedBrands);
    } catch (error) {
      toast.error(messages.fetchError);
    } finally {
      setIsLoadingChildren(false);
    }
  }, [api, category.id]);

  const handleToggle = useCallback(() => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);
    // اگر یک زیردسته برای اولین بار باز می‌شود و لیست برندهای آن خالی است، آنها را واکشی کن
    if (isSubCategory && nextIsOpen && brands.length === 0) {
      fetchBrands();
    }
  }, [isOpen, isSubCategory, brands.length, fetchBrands]);
  
  // تابع نهایی برای اجرای عملیات و رفرش کردن state صحیح
  const handleAction = async (actionType: any, actionData: any) => {
    const success = await performAction(actionType, actionData);
    if (success) {
      setModal({ type: null }); // بستن مودال
      if (actionType.includes('Category')) {
        onActionSuccess(); // رفرش کل درخت برای عملیات روی دسته‌ها
      } else if (actionType.includes('Brand')) {
        fetchBrands(); // فقط رفرش لیست برندها برای عملیات روی برند
      }
    }
  };
  
  const imageUrl =`${IMAGE_HOST}/uploads/${category.imageUrl}`|| "/icons/imageicon/default-placeholder.png";
  
  return (
    <>
      <div className="border-b dark:border-gray-700">
       <span>{imageUrl}</span>
        <div className="flex w-full items-center justify-between p-3 pr-4 hover:bg-gray-50 dark:hover:bg-gray-700/50" style={{ paddingRight: `${level * 24 + 16}px` }}>
          <div className="flex flex-grow items-center gap-3 cursor-pointer select-none" onClick={handleToggle}>
            <div className="flex w-5 items-center justify-center">
              {canExpand && <ChevronDown size={18} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />}
            </div>
            <Image src={imageUrl} alt={category.title} width={40} height={40} className="h-10 w-10 rounded-md object-cover bg-gray-200" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">{category.title}</span>
          </div>
               { isSubCategory && (
              <div className="flex gap-2">
  <button /* افزودن دسته / افزودن برندِ موجود */ />

  {/* دکمه جدید */}
  <Link
    href={`/panel/filters?categoryId=${category.id}`}
    className=" text-green-500 flex items-center gap-1 px-4 p-2 "
  >
    <PlusCircle size={18} />
    <span>افزودن فیلتر</span>
  </Link>
</div>
            )}
          <div className="flex flex-shrink-0 items-center gap-2 md:gap-4">
            {level === 0 && (
              <button onClick={() => setModal({ type: 'addSub', data: category })} className="flex items-center gap-1 text-sm text-blue-dark hover:text-blue-500" title={messages.addSubCategory}><PlusCircle size={15} /><span className="hidden md:inline">زیردسته</span></button>
            )}
            {isSubCategory && (
              <button onClick={() => setModal({ type: 'addBrand', data: category })} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800" title={messages.addBrand}><PlusCircle size={15} /><span className="hidden md:inline">برند</span></button>
             
            )}
       
            <button onClick={() => setModal({ type: 'deleteCat', data: category })} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700" title={messages.delete  }><Trash2 size={15} /></button>
          </div>
          
        </div>
        
        {isOpen && (
          <div className="bg-gray-50/50 dark:bg-black/20" style={{ paddingLeft: `${level * 24 + 16}px`, paddingRight: `${level * 24 + 16}px` }}>
            {isLoadingChildren ? (
              <div className="flex justify-center p-4"><LoadingSpinner mode="inline" size="small" /></div>
            ) : (
              <>
                {hasSubCategories && category.subCategories?.map(subCat => <CategoryItem key={subCat.id} category={subCat} level={level + 1} onActionSuccess={onActionSuccess} />)}
                {isSubCategory && brands.length > 0 && (
                  <div className="p-4">
                    {brands.map(brand => (
                      <BrandItem key={brand.id} brand={brand} 
                        onEdit={() => setModal({ type: 'editBrand', data: brand })} 
                        onDelete={() => setModal({ type: 'deleteBrand', data: brand })} 
                      />
                    ))}
                  </div>
                )}
                {isSubCategory && brands.length === 0 && !isLoadingChildren && <div className="p-4 text-xs text-gray-400">{messages.noItems}</div>}
              </>
            )}
          </div>
        )}
      </div>
   
      <ReusableModal 
        isOpen={['addSub', 'addBrand', 'editBrand'].includes(modal.type || '')} 
        onClose={() => setModal({ type: null })} 
        title={
          modal.type === 'addSub' ? `${messages.addSubCategory} به «${modal.data?.title}»` :
          modal.type === 'addBrand' ? `${messages.addBrandModalTitle} «${modal.data?.title}»` :
          modal.type === 'editBrand' ? `${messages.editBrandModalTitle} «${modal.data?.title}»` : ''
        }
      >
        {modal.type === 'addSub' && <AddNewCategoryForm onSubmit={(fd) => handleAction('addCategory', fd)} onCancel={() => setModal({ type: null })} isSubmitting={isSubmitting} parentId={modal.data?.id as number} />}
        {modal.type === 'addBrand' && <AddNewBrandForm onSubmit={(title) => handleAction('addBrand', { title, categoryId: modal.data.id })} onCancel={() => setModal({ type: null })} isSubmitting={isSubmitting} />}
        {modal.type === 'editBrand' && <AddNewBrandForm onSubmit={(title) => handleAction('updateBrand', { id: modal.data.id, title })} onCancel={() => setModal({ type: null })} isSubmitting={isSubmitting} initialTitle={modal.data?.title} />}
      </ReusableModal>

      <ReusableModal 
        isOpen={['deleteCat', 'deleteBrand'].includes(modal.type || '')} 
        onClose={() => setModal({ type: null })} 
        title={modal.type === 'deleteCat' ? messages.deleteCategoryModalTitle : messages.deleteBrandModalTitle}
      >
        <ConfirmationDialog
          message={ modal.type === 'deleteCat' ? messages.confirmDeleteCategory.replace('{name}', modal.data?.title) : messages.confirmDeleteBrand.replace('{name}', modal.data?.title) }
          onConfirm={() => handleAction(modal.type === 'deleteCat' ? 'deleteCategory' : 'deleteBrand', modal.data)}
          onCancel={() => setModal({ type: null })}
          isConfirming={isSubmitting}
          confirmText={messages.confirmAndDelete}
        />
      </ReusableModal>
    </>
  );
};