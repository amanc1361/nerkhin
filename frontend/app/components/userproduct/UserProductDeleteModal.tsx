// app/components/userproduct/UserProductDeleteModal.tsx
"use client";

import { UserProductMessages } from "@/lib/server/texts/userProdutMessages";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  messages: UserProductMessages;
};

export default function UserProductDeleteModal({ open, onClose, onConfirm, messages }: Props) {
  if (!open) return null;
  const m = messages?.modals?.delete || ({} as any);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="text-sm font-semibold text-slate-900">{m.title}</h3>
        </div>
        <div className="px-5 py-4 text-sm text-slate-700">
          {m.message}
        </div>
        <div className="px-5 py-4 flex gap-3 justify-start">
          <button onClick={onConfirm} className="px-4 py-2 rounded-2xl bg-rose-600 text-white">
            {m.confirm}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-2xl border border-slate-300 text-slate-700">
            {m.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
