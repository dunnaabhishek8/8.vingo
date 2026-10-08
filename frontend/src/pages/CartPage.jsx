import React, { useState } from "react"
import { IoIosArrowRoundBack } from "react-icons/io"
import { FiShoppingCart } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import CartItemCard from "../components/CartItemCard"
import { clearCart } from "../redux/userSlice"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import EmptyState from "../components/ui/EmptyState"

function CartPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { cartItems, totalAmount } = useSelector((state) => state.user)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  return (
    <div className="min-h-screen bg-cream flex justify-center p-4 sm:p-6">
      <div className="w-full max-w-[800px]">
        <div className="flex items-center gap-4 mb-6">
          <button
            aria-label="Go back"
            className="h-11 w-11 shrink-0 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] text-brand-600 hover:bg-brand-50 transition flex items-center justify-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <IoIosArrowRoundBack size={24} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900">Your Cart</h1>
          {cartItems.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="ml-auto text-sm font-bold text-red-500 hover:text-red-600 transition"
            >
              Clear all
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <EmptyState
            icon={<FiShoppingCart size={26} />}
            title="Your Cart is Empty"
            subtitle="Browse delicious food around you and add items to get started."
            action={
              <button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 transition"
              >
                Explore Food
              </button>
            }
          />
        ) : (
          <>
            <div className="space-y-3">
              {cartItems.map((item, index) => (
                <CartItemCard data={item} key={index} />
              ))}
            </div>

            <div className="mt-6 bg-white p-5 rounded-2xl shadow-soft border border-black/[0.05] flex justify-between items-center">
              <h1 className="font-semibold text-ink-500">Total Amount</h1>
              <span className="text-2xl font-extrabold text-brand-600">₹{totalAmount}</span>
            </div>

            {totalAmount <= 500 && (
              <p className="mt-3 text-xs text-center text-ink-400 font-medium">
                Add ₹{501 - totalAmount} more to unlock FREE delivery 🎉
              </p>
            )}

            <div className="mt-5 flex justify-end">
              <button
                className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-7 py-3 rounded-2xl font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] transition cursor-pointer"
                onClick={() => navigate("/checkout")}
              >
                Proceed to CheckOut
              </button>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear your cart?"
        message="All items will be removed from your cart."
        confirmText="Clear Cart"
        danger
        onConfirm={() => {
          dispatch(clearCart())
          setShowClearConfirm(false)
        }}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  )
}

export default CartPage