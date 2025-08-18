"use client";

import React, { useState } from "react";
import { PlusCircle, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";


import ReusableModal from "@/app/components/shared/generalModal";
import { useFiltersByCategoryAdmin } from "@/app/hooks/useFiltersByCategoryAdmin";
import { FilterForm } from "./FilterForm";
import { OptionForm } from "./optionForm";

export const FilterList: React.FC<{ categoryId: number }> = ({ categoryId }) => {
  const { filters, loading, error, refresh } = useFiltersByCategoryAdmin(categoryId);

  const [modal, setModal] = useState<
    | { type: "addFilter" }
    | { type: "editFilter"; filterId: number|string}
    | { type: "addOption"; filterId: number |string}
    | { type: "editOption"; filterId: number|string; optionId: number|string }
    | null
  >(null);

  if (loading) return <p>در حال بارگذاری...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      <button
        onClick={() => setModal({ type: "addFilter" })}
        className="bg-blue-dark text-white flex items-center gap-1 px-4 py-2 rounded hover:bg-blue-700"
      >
        <PlusCircle size={18} />
        فیلتر جدید
      </button>

      {filters.map((f) => (
        <details key={f.filter.id} className="border rounded">
          <summary className="cursor-pointer flex justify-between items-center px-4 py-2">
            <span>{f.filter.name}</span>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModal({ type: "editFilter", filterId: f.filter.id });
                }}
              >
                <Edit size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: call deleteFilter(f.filter.id)
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </summary>

          <div className="p-4 space-y-2 bg-gray-50 dark:bg-gray-800/30">
            {/* گزینه‌ها */}
            {f.options.map((o:any) => (
              <div key={o.id} className="flex justify-between items-center px-2 py-1 rounded hover:bg-gray-100">
                <span>{o.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => setModal({ type: "editOption", filterId: f.filter.id, optionId: o.id })}>
                    <Edit size={14} />
                  </button>
                  <button /* TODO: delete option */>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => setModal({ type: "addOption", filterId: f.filter.id })}
              className="text-blue-dark flex items-center gap-1 hover:underline text-sm"
            >
              <PlusCircle size={14} />
              گزینه جدید
            </button>
          </div>
        </details>
      ))}

      {/* Modal های فرم */}
      <ReusableModal
        isOpen={modal?.type === "addFilter" || modal?.type === "editFilter"}
        onClose={() => setModal(null)}
        title={modal?.type === "addFilter" ? "فیلتر جدید" : "ویرایش فیلتر"}
      >
        {modal && (modal.type === "addFilter" || modal.type === "editFilter") && (
          <FilterForm
            categoryId={categoryId}
            filterId={modal.type === "editFilter" ? modal.filterId :0}
            onSuccess={() => {
              setModal(null);
              refresh();
            }}
          />
        )}
      </ReusableModal>

      <ReusableModal
        isOpen={
          modal?.type === "addOption" || modal?.type === "editOption"
        }
        onClose={() => setModal(null)}
        title={modal?.type === "addOption" ? "گزینه جدید" : "ویرایش گزینه"}
      >
        {modal && (modal.type === "addOption" || modal.type === "editOption") && (
          <OptionForm
            filterId={modal.filterId}
            optionId={modal.type === "editOption" ? modal.optionId : 0}
            onSuccess={() => {
              setModal(null);
              refresh();
            }}
          />
        )}
      </ReusableModal>
    </div>
  );
};
