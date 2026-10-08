import React from "react"
import { FaStore, FaLocationDot, FaMoneyBillWave } from "react-icons/fa6"

const RATE_PER_DELIVERY = 50

function formatDate(dateString) {
  if (!dateString) return ""
  return new Date(dateString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

export default function DeliveryOrderCard({ data }) {
  const so = data.shopOrders || {}
  const items = so.shopOrderItems || []
  const delivered = so.status === "delivered"
  const cancelled = so.status === "cancelled"

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.05] p-4 sm:p-5 space-y-3">
      {/* header */}
      <div className="flex justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="min-w-0">
          <p className="font-extrabold text-ink-900 flex items-center gap-2">
            <FaStore size={13} className="text-brand-500 shrink-0" />
            <span className="truncate">{so.shop?.name || "Restaurant"}</span>
          </p>
          <p className="text-sm text-ink-400 mt-0.5">{formatDate(data.createdAt)}</p>
        </div>

        <div className="text-right space-y-1.5 shrink-0">
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
              delivered
                ? "bg-green-100 text-green-700"
                : cancelled
                  ? "bg-red-50 text-red-500"
                  : "bg-brand-50 text-brand-600"
            }`}
          >
            {so.status}
          </span>
          {delivered && (
            <p className="text-sm font-extrabold text-green-600 flex items-center justify-end gap-1">
              <FaMoneyBillWave size={12} /> +₹{RATE_PER_DELIVERY}
            </p>
          )}
        </div>
      </div>

      {/* items */}
      <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex-shrink-0 w-32 rounded-xl border border-black/[0.05] p-2 bg-gray-50/60">
            <img
              src={item.item?.image || item.image}
              alt={item.name}
              loading="lazy"
              className="w-full h-20 object-cover rounded-lg"
            />
            <p className="text-xs font-semibold mt-1 truncate">{item.name}</p>
            <p className="text-[11px] text-ink-500">Qty: {item.quantity}</p>
          </div>
        ))}
      </div>

      {/* footer */}
      <div className="flex justify-between items-center border-t border-gray-100 pt-3 gap-3 text-sm">
        <p className="text-ink-500 flex items-center gap-1.5 min-w-0">
          <FaLocationDot size={12} className="text-brand-500 shrink-0" />
          <span className="truncate">{data.deliveryAddress?.text}</span>
        </p>
        <p className="font-extrabold text-ink-900 shrink-0">₹{so.subtotal}</p>
      </div>
    </div>
  )
}