import React from "react"
import { FaCircleCheck } from "react-icons/fa6"
import { useLocation, useNavigate } from "react-router-dom"

function OrderPlaced() {
  const navigate = useNavigate()
  const { state } = useLocation() // { total, paymentMethod, paid } passed from Checkout

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center px-4 text-center">
      <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-scale-in">
        <FaCircleCheck className="text-green-500 text-6xl" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 mb-2">Order Placed!</h1>

      {typeof state?.total === "number" && (
        <div className="mt-1 mb-4 inline-flex items-center gap-2 rounded-full bg-white border border-black/[0.06] shadow-soft px-4 py-2">
          <span className="text-lg font-extrabold text-brand-600">₹{state.total}</span>
          <span className="h-4 w-px bg-gray-200" />
          <span className={`text-xs font-bold uppercase tracking-wide ${state.paid ? "text-green-600" : "text-orange-500"}`}>
            {state.paymentMethod === "online" ? (state.paid ? "Paid Online" : "Payment Pending") : "Cash on Delivery"}
          </span>
        </div>
      )}

      <p className="text-ink-500 max-w-md mb-8 leading-relaxed">
        Thank you for your purchase. Your order is being prepared.
        You can track your order status in the "My Orders" section.
      </p>
      <button
        className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-7 py-3 rounded-2xl font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] transition"
        onClick={() => navigate("/my-orders")}
      >
        Back to My Orders
      </button>
    </div>
  )
}

export default OrderPlaced