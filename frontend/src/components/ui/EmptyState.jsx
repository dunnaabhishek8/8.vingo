import React from "react"

export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-white p-10 sm:p-12 text-center animate-fade-up">
      {icon && (
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gray-50 text-ink-400 flex items-center justify-center">
          {icon}
        </div>
      )}
      <p className="font-extrabold text-ink-900">{title}</p>
      {subtitle && <p className="text-sm text-ink-400 mt-1 max-w-sm mx-auto leading-relaxed">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}