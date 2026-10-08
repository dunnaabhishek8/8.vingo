import React from "react"
import { FaUtensils } from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="w-full border-t border-black/[0.06] bg-white/60 backdrop-blur mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center">
            <FaUtensils size={13} />
          </span>
          <span className="font-extrabold tracking-tight text-ink-900">Vingo</span>
        </div>
        <p className="text-xs text-ink-400 text-center">
          © {new Date().getFullYear()} Vingo · Delicious food delivered fast from the best restaurants near you.
        </p>
      </div>
    </footer>
  )
}