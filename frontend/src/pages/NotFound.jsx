import React from "react"
import { Link } from "react-router-dom"
import { FaHouseChimney } from "react-icons/fa6"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-[100px] sm:text-[140px] leading-none font-extrabold tracking-tight bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent select-none">
        404
      </h1>
      <p className="text-xl font-extrabold text-ink-900 mt-2">Page not found</p>
      <p className="text-sm text-ink-500 mt-2 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-7 inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] transition"
      >
        <FaHouseChimney size={15} /> Back to Home
      </Link>
    </div>
  )
}