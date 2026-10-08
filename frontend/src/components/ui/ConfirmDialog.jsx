import React from "react"

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onClose
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={busy ? undefined : onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-pop border border-black/[0.06] p-6 animate-scale-in">
        <h3 className="text-lg font-extrabold tracking-tight text-ink-900">{title}</h3>
        {message && <p className="mt-2 text-sm text-ink-500 leading-relaxed">{message}</p>}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            disabled={busy}
            onClick={onClose}
            className="px-4 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-ink-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            disabled={busy}
            onClick={onConfirm}
            className={`px-4 h-10 rounded-xl text-sm font-bold text-white transition disabled:opacity-60 ${
              danger
                ? "bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700"
                : "bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700"
            }`}
          >
            {busy ? "Please wait…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}