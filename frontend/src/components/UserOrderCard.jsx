import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaStar } from "react-icons/fa"
import ConfirmDialog from "./ui/ConfirmDialog"
import { useToast } from "./ui/Toast"
import api from "../lib/api"
import { useDispatch } from "react-redux"
import { cancelOrderLocal } from "../redux/userSlice"

function UserOrderCard({ data }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toast = useToast()
  const [selectedRating, setSelectedRating] = useState({})
  const [reviewText, setReviewText] = useState({})
  const [reviewOpenFor, setReviewOpenFor] = useState(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const canCancel = () => {
    const statuses = Array.isArray(data.shopOrders)
      ? data.shopOrders.map((so) => so.status)
      : [data.shopOrders?.status]
    return statuses.every((s) => s === "pending" || s === "preparing")
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await api.post(`/api/order/cancel/${data._id}`)
      dispatch(cancelOrderLocal(data._id))
      toast.success("Order cancelled successfully.")
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not cancel the order.")
    } finally {
      setCancelling(false)
      setShowCancelConfirm(false)
    }
  }

  const submitReview = async (itemId) => {
    const rating = selectedRating[itemId]
    if (!rating) {
      toast.info("Please pick a star rating first.")
      return
    }
    setSubmittingReview(true)
    try {
      await api.post("/api/review", {
        itemId,
        orderId: data._id,
        rating,
        text: reviewText[itemId] || ""
      })
      toast.success("Thanks for your review! ⭐")
      setReviewOpenFor(null)
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not submit review.")
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.05] p-4 sm:p-5 space-y-4">
      {/* header */}
      <div className="flex justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <p className="font-extrabold text-ink-900">Order #{data?._id?.slice(-6)}</p>
          <p className="text-sm text-ink-400 mt-0.5">{formatDate(data.createdAt)}</p>
        </div>

        <div className="text-right space-y-1.5">
          {data.paymentMethod === "cod" ? (
            <p className="text-xs font-bold uppercase tracking-wide text-ink-500">{data.paymentMethod}</p>
          ) : (
            <p className="text-xs font-bold uppercase tracking-wide text-ink-500">
              Payment:{" "}
              <span className={data.payment ? "text-green-600" : "text-red-500"}>
                {data.payment ? "Paid" : "Pending"}
              </span>
            </p>
          )}
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
              data.shopOrders?.[0]?.status === "delivered"
                ? "bg-green-100 text-green-700"
                : data.shopOrders?.[0]?.status === "cancelled"
                  ? "bg-red-50 text-red-500"
                  : "bg-brand-50 text-brand-600"
            }`}
          >
            {data.shopOrders?.[0]?.status || "Pending"}
          </span>
        </div>
      </div>

      {/* shop sections */}
      {data.shopOrders?.map((shopOrder, index) => (
        <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-3.5 space-y-3" key={index}>
          <p className="font-bold text-ink-900">{shopOrder.shop?.name || "Restaurant unavailable"}</p>

          <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-1">
            {shopOrder.shopOrderItems?.map((item, idx) => (
              <div key={idx} className="flex-shrink-0 w-36 rounded-xl border border-black/[0.05] p-2 bg-white shadow-sm">
                <img
                  src={item.item?.image || item.image || "https://via.placeholder.com/150"}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-24 object-cover rounded-lg"
                />
                <p className="text-sm font-semibold mt-1.5 truncate">{item.name}</p>
                <p className="text-xs text-ink-500">Qty: {item.quantity} × ₹{item.price}</p>

                {/* rate & review after delivery */}
                {shopOrder.status === "delivered" && item.item && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          aria-label={`Rate ${star} star`}
                          className={`text-xl leading-none transition-transform hover:scale-110 ${
                            (selectedRating[item.item?._id] || 0) >= star
                              ? "text-amber-400"
                              : "text-gray-300 hover:text-amber-300"
                          }`}
                          onClick={() => setSelectedRating((prev) => ({ ...prev, [item.item?._id]: star }))}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    {reviewOpenFor === item.item?._id ? (
                      <div className="space-y-1.5 animate-fade-in">
                        <textarea
                          value={reviewText[item.item?._id] || ""}
                          onChange={(e) => setReviewText((prev) => ({ ...prev, [item.item?._id]: e.target.value }))}
                          placeholder="Share your experience…"
                          rows={2}
                          maxLength={500}
                          className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none"
                        />
                        <div className="flex gap-1.5">
                          <button
                            disabled={submittingReview}
                            onClick={() => submitReview(item.item?._id)}
                            className="flex-1 h-7 rounded-md bg-brand-500 text-white text-[11px] font-bold hover:bg-brand-600 transition disabled:opacity-60"
                          >
                            {submittingReview ? "…" : "Submit"}
                          </button>
                          <button
                            onClick={() => setReviewOpenFor(null)}
                            className="h-7 px-2 rounded-md bg-gray-100 text-[11px] font-bold text-ink-600 hover:bg-gray-200 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewOpenFor(item.item?._id)}
                        className="text-[11px] font-bold text-brand-600 hover:text-brand-700 transition"
                      >
                        Write a review →
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-brand-100 pt-2.5">
            <p className="font-bold text-ink-900">Subtotal: ₹{shopOrder.subtotal}</p>
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                shopOrder.status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : shopOrder.status === "cancelled"
                    ? "bg-red-50 text-red-500"
                    : "bg-white text-brand-600 border border-brand-100"
              }`}
            >
              {shopOrder.status}
            </span>
          </div>
        </div>
      ))}

      {/* footer */}
      <div className="flex justify-between items-center border-t border-gray-100 pt-3 gap-3">
        <p className="font-extrabold text-ink-900 text-lg">Total: ₹{data.totalAmount}</p>
        <div className="flex items-center gap-2">
          {canCancel() && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 active:scale-95 transition"
            >
              Cancel
            </button>
          )}
          <button
            className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 active:scale-95 transition"
            onClick={() => navigate(`/track-order/${data._id}`)}
          >
            Track Order
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showCancelConfirm}
        title="Cancel this order?"
        message="The restaurant will be notified immediately. This cannot be undone."
        confirmText="Yes, Cancel Order"
        danger
        busy={cancelling}
        onConfirm={handleCancel}
        onClose={() => setShowCancelConfirm(false)}
      />
    </div>
  )
}

export default UserOrderCard