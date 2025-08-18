"use client";

import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/app/components/Loading/Loading";
import { useFilterDetails } from "@/app/hooks/useFilterDetails";
import { filterMessages as m } from "@/app/constants/filterMessage";
import { toast } from "react-toastify";
import { useFilterActions } from "@/app/hooks/useFilterAction";

interface Props {
  filterId: number | string;
  optionId: number | string;
  onSuccess: () => void;
}

export const OptionForm: React.FC<Props> = ({ filterId, optionId, onSuccess }) => {
  const fid = Number(filterId) || 0;
  const oid = Number(optionId) || 0;
  const isEdit = oid > 0;

  const { submitting, act } = useFilterActions(onSuccess);
  const { title: initialTitle, loading } = useFilterDetails("option", oid);
  const [title, setTitle] = useState("");

  useEffect(() => setTitle(initialTitle), [initialTitle]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error(m.fieldRequired);
      return;
    }
    const payload = isEdit
      ? { id: oid, filterId: fid, title }  // ← filterId را هم بفرست
      : { filterId: fid, title };

    act(isEdit ? "updateOption" : "createOption", payload);
  };

  if (loading) return <LoadingSpinner size="small" />;

  return (
    <div className="space-y-4 p-2">
      <label className="block text-sm mb-1">{m.optionTitleLabel}</label>
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
