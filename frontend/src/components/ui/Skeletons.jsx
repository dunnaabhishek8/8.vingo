import React from "react"

const pulse = "bg-gray-200/70 rounded animate-pulse"

export function FoodCardSkeleton() {
  return (
    <div className="w-[250px] rounded-2xl bg-white border border-black/[0.05] shadow-soft overflow-hidden">
      <div className={`w-full h-[170px] ${pulse}`} />
      <div className="p-4 space-y-2.5">
        <div className={`h-4 w-3/4 ${pulse}`} />
        <div className={`h-3 w-1/3 ${pulse}`} />
        <div className="flex items-center justify-between pt-2">
          <div className={`h-5 w-16 ${pulse}`} />
          <div className={`h-9 w-24 rounded-full ${pulse}`} />
        </div>
      </div>
    </div>
  )
}

export function CardsSkeleton({ count = 8 }) {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 justify-items-center">
      {Array.from({ length: count }).map((_, i) => (
        <FoodCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function RowsSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-black/[0.05] shadow-soft p-4 flex items-center gap-4">
          <div className={`w-20 h-20 rounded-xl shrink-0 ${pulse}`} />
          <div className="flex-1 space-y-2">
            <div className={`h-4 w-1/2 ${pulse}`} />
            <div className={`h-3 w-1/3 ${pulse}`} />
            <div className={`h-3 w-1/4 ${pulse}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-black/[0.05] shadow-soft p-5 space-y-3">
      <div className={`h-3 w-1/2 ${pulse}`} />
      <div className={`h-7 w-2/3 ${pulse}`} />
    </div>
  )
}