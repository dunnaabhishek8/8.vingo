import React from "react"
import { FaCircleCheck } from "react-icons/fa6"

const STEPS = [
  { key: "pending", label: "Order placed" },
  { key: "preparing", label: "Preparing" },
  { key: "out of delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" }
]

export default function OrderTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="text-sm font-bold text-red-600 capitalize">Order cancelled</span>
      </div>
    )
  }

  const currentIndex = STEPS.findIndex(s => s.key === status)

  return (
    <div className="w-full">
      <div className="relative flex justify-between">
        {/* connector line */}
        <div className="absolute top-[11px] left-[10px] right-[10px] h-[3px] bg-gray-200 rounded-full -z-0" />
        <div
          className="absolute top-[11px] left-[10px] h-[3px] bg-brand-500 rounded-full transition-all duration-500 -z-0"
          style={{ width: currentIndex <= 0 ? 0 : `${(currentIndex / (STEPS.length - 1)) * 100}%`, maxWidth: "calc(100% - 20px)" }}
        />
        {STEPS.map((step, idx) => {
          const done = idx <= currentIndex
          const isCurrent = idx === currentIndex
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
              <span
                className={`h-[25px] w-[25px] rounded-full flex items-center justify-center ring-4 transition-colors ${
                  done
                    ? "bg-brand-500 ring-brand-100 text-white"
                    : "bg-gray-200 ring-white text-gray-400"
                }`}
              >
                {done ? <FaCircleCheck size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <span
                className={`text-[10px] sm:text-xs font-semibold text-center leading-tight ${
                  isCurrent ? "text-brand-600" : done ? "text-ink-700" : "text-ink-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}