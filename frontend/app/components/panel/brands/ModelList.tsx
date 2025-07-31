"use client";

import React, { useState } from "react";
import { Brand, Model } from "@/app/types/types";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import ConfirmationDialog from "@/app/components/shared/ConfirmationDialog";
import ReusableModal from "@/app/components/shared/generalModal";
import { ModelForm } from "@/app/panel/model/forms/ModelForm";
import { modelPageMessages as messages } from "@/app/constants/modelmessage";
import { useBrandPageActions } from "@/app/hooks/useBrandPageAction";


interface ModelListProps {
  brand: Brand;
  models: Model[];
  onModelSelect: (model: Model) => void;
  selectedModelId?: number | string | null;
  onListChange: (models: Model[]) => void;
}

export const ModelList: React.FC<ModelListProps> = ({
  brand,
  models,
  onModelSelect,
  selectedModelId,
  onListChange,
}) => {
  const [modal, setModal] = useState<{
    type: "add" | "edit" | "delete" | null;
    data?: Model;
  }>({ type: null });

  const { isSubmitting, performAction } = useBrandPageActions(
    brand,
    (updatedModels) => {
      setModal({ type: null });
      onListChange(updatedModels);
    }
  );

  const handleFormSubmit = (title: string) => {
    const action = modal.type === "add" ? "addModel" : "updateModel";
    const data =
      modal.type === "add"
        ? { title, brandId: brand.id }
        : { id: modal.data?.id, title };
    performAction(action, data);
  };

  return (
    <div className="rounded-lg border p-4 h-full flex flex-col dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-600 flex-shrink-0">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
          {messages.modelTitleLabel}
        </h2>
        <button
          onClick={() => setModal({ type: "add" })}
          className="text-sm text-blue-dark flex items-center gap-1 hover:underline"
        >
          <PlusCircle size={16} /> {messages.addModel}
        </button>
      </div>

      <div className="overflow-y-auto">
        {models.length > 0 ? (
          models.map((model) => (
            <div
              key={model.id}
              onClick={() => onModelSelect(model)}
              className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
                selectedModelId === model.id
                  ? "bg-blue-100 dark:bg-blue-900/50"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="dark:text-gray-200">{model.title}</span>
              <div className="flex gap-3 text-gray-500">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModal({ type: "edit", data: model });
                  }}
                  className="hover:text-blue-dark"
                  title={messages.editModel}
                >
                  <Edit size={15} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setModal({ type: "delete", data: model });
                  }}
                  className="hover:text-red-500"
                  title={messages.deleteModel}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 text-center py-8">
            {messages.noModels}
          </p>
        )}
      </div>

      {/* مودال افزودن/ویرایش مدل */}
      <ReusableModal
        isOpen={modal.type === "add" || modal.type === "edit"}
        onClose={() => setModal({ type: null })}
        title={
          modal.type === "add" ? messages.addModel : messages.editModel
        }
      >
        <ModelForm
          onSubmit={handleFormSubmit}
          onCancel={() => setModal({ type: null })}
          isSubmitting={isSubmitting}
          initialTitle={modal.data?.title}
        />
      </ReusableModal>

      {/* مودال تأیید حذف */}
      <ReusableModal
        isOpen={modal.type === "delete"}
        onClose={() => setModal({ type: null })}
        title={messages.deleteModel}
      >
        {modal.data && (
          <ConfirmationDialog
            message={messages.confirmDeleteModel.replace(
              "{modelName}",
              modal.data.title
            )}
            onConfirm={() =>
              performAction("deleteModel", { id: modal.data!.id })
            }
            onCancel={() => setModal({ type: null })}
            isConfirming={isSubmitting}
          />
        )}
      </ReusableModal>
    </div>
  );
};
