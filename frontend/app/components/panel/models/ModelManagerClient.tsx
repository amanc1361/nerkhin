"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useModelActions } from '@/app/hooks/useModelActions';
import { modelPageMessages as messages } from '@/app/constants/modelmessage';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import ReusableModal from '@/app/components/shared/generalModal';
import ConfirmationDialog from '@/app/components/shared/ConfirmationDialog';
import { Brand, Model } from '@/app/types/types';

import { ModelForm } from '@/app/panel/model/forms/ModelForm';


interface Props {
  brand: Brand;
  initialModels: Model[];
}

export const ModelManagerClient: React.FC<Props> = ({ brand, initialModels }) => {
  const router = useRouter();
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'delete' | null, data?: Model }>({ type: null });
  
 const { isSubmitting, performAction } = useModelActions(() => {
    setModal({ type: null });
    router.refresh();
  });

  const handleFormSubmit = (title: string) => {
    if (modal.type === 'add') {
      performAction('add', { title, brandId: brand.id });
    } else if (modal.type === 'edit' && modal.data) {
      performAction('update', { id: modal.data.id, title });
    }
  };

  return (
    <div className="rounded-lg border p-4 sm:p-6 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-md">
      <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-600">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
          {messages.pageTitle.replace('{brandName}', brand.title)}
        </h2>
        <button onClick={() => setModal({ type: 'add' })} className="flex items-center gap-2 rounded-lg bg-blue-dark px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
          <PlusCircle size={18} />
          {messages.addModel}
        </button>
      </div>

      <div className="space-y-2">
        {initialModels.length > 0 ? (
          initialModels.map(model => (
            <div key={model.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50">
              <span className="font-medium text-gray-700 dark:text-gray-200">{model.title}</span>
              <div className="flex items-center gap-3 text-gray-500">
                <button onClick={() => setModal({ type: 'edit', data: model })} className="hover:text-blue-dark" title={messages.editModel}><Edit size={16} /></button>
                <button onClick={() => setModal({ type: 'delete', data: model })} className="hover:text-red-500" title={messages.deleteModel}><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">{messages.noModels}</p>
        )}
      </div>

      <ReusableModal isOpen={modal.type === 'add' || modal.type === 'edit'} onClose={() => setModal({ type: null })} title={modal.type === 'add' ? messages.addModel : messages.editModel}>
        <ModelForm onSubmit={handleFormSubmit} onCancel={() => setModal({ type: null })} isSubmitting={isSubmitting} initialTitle={modal.data?.title} />
      </ReusableModal>

      <ReusableModal isOpen={modal.type === 'delete'} onClose={() => setModal({ type: null })} title={messages.confirmDeleteTitle}>
        {modal.data && (
          <ConfirmationDialog
            message={messages.confirmDeleteModel.replace('{modelName}', modal.data.title)}
            onConfirm={() => performAction('delete', modal.data)}
            onCancel={() => setModal({ type: null })}
            isConfirming={isSubmitting}
            confirmText={messages.confirm}
          />
        )}
      </ReusableModal>
    </div>
  );
};