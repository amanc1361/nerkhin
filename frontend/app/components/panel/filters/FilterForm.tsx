"use client";

import React, { useState, useEffect } from "react";
import LoadingSpinner from "@/app/components/Loading/Loading";
import { filterMessages as m } from "@/app/constants/filterMessage";
import { toast } from "react-toastify";
import { useFilterActions } from "@/app/hooks/useFilterAction";
import { useFilterDetails } from "@/app/hooks/useFilterDetails";

interface Props {
  categoryId: number;
  filterId: number | string;
  onSuccess: () => void;
}

export const FilterForm: React.FC<Props> = ({ categoryId, filterId, onSuccess }) => {
  const fid = Number(filterId) || 0;
  const isEdit = fid > 0;

  const { submitting, act } = useFilterActions(onSuccess);
  const { title: initialTitle, loading } = useFilterDetails("filter", fid);
  const [title, setTitle] = useState("");

  useEffect(() => setTitle(initialTitle), [initialTitle]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error(m.fieldRequired);
      return;
    }

    const payload = isEdit
      ? { id: fid, categoryId, title }  // ← categoryId را هم می‌فرستیم تا ساختار کامل شود
      : { categoryId, title };

    act(isEdit ? "updateFilter" : "createFilter", payload);
  };

  if (loading) return <LoadingSpinner size="small" />;

  return (
    <div className="space-y-4 p-2">
      <label className="block text-sm mb-1">{m.filterTitleLabel}</label>
      <input
        className="w-full border rounded p-2"
        value={title || ""}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <button
        type="button"
        disabled={submitting || !title.trim()}
        onClick={handleSave}
        className="bg-blue-dark text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {submitting ? <LoadingSpinner size="small" mode="inline" /> : m.save}
      </button>
    </div>
  );
};
