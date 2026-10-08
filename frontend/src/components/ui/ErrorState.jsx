import React from "react"
import { FaRotateRight } from "react-icons/fa6"

export default function ErrorState({ message = "Something went wrong while loading this.", onRetry }) {
  return (
    <div className="rounded-3xl border border-red-100 bg-red-50/60 p-10 text-center animate-fade-up">
      <p className="font-bold text-red-600">Oops!</p>
      <p className="text-sm text-ink-500 mt-1 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-white border border-red-200 text-sm font-bold text-red-600 hover:bg-red-50 transition"
        >
          <FaRotateRight size={13} /> Try Again
        </button>
      )}
    </div>
  )
}