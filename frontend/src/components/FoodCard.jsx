import React, { memo, useState } from "react"
import { FaLeaf, FaDrumstickBite, FaStar, FaMinus, FaPlus, FaShoppingCart, FaHeart } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { addToCart, toggleFavoriteLocal } from "../redux/userSlice"
import api from "../lib/api"
import { useToast } from "./ui/Toast"

function FoodCard({ data }) {
  const [quantity, setQuantity] = useState(0)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const { cartItems, favorites } = useSelector((state) => state.user)

  const isFavorited = favorites.some((f) => String(f._id) === String(data._id))
  const soldOut = data.isAvailable === false

  const handleIncrease = () => setQuantity((q) => q + 1)
  const handleDecrease = () => setQuantity((q) => (q > 0 ? q - 1 : q))

  const handleFavorite = async (e) => {
    e.stopPropagation()
    // optimistic update
    dispatch(toggleFavoriteLocal(data))
    try {
      const { data: result } = await api.post(`/api/favorite/toggle/${data._id}`)
      if (!result.favorited) {
        // server says removed — reconcile
        dispatch(toggleFavoriteLocal(data._id))
      }
    } catch {
      // revert on failure
      dispatch(toggleFavoriteLocal(data))
      toast.error("Could not update favorites")
    }
  }

  return (
    <div className={`group w-[250px] rounded-2xl bg-white border border-black/[0.05] shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col ${soldOut ? "opacity-80" : ""}`}>
      <div className="relative w-full h-[170px] overflow-hidden cursor-pointer" onClick={() => navigate(`/item/${data._id}`)}>
        <img
          src={data.image}
          alt={data.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${soldOut ? "grayscale" : ""}`}
        />

        {/* veg / non-veg badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full px-2 py-1 shadow-sm flex items-center gap-1.5">
          {data.foodType === "veg"
            ? <FaLeaf className="text-green-600 text-xs" />
            : <FaDrumstickBite className="text-red-500 text-xs" />}
          <span className="text-[10px] font-bold uppercase tracking-wide text-ink-700">{data.foodType}</span>
        </div>

        {/* favorite heart */}
        <button
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          onClick={handleFavorite}
          className="absolute top-3 left-3 h-8 w-8 rounded-full bg-white/95 backdrop-blur shadow-sm flex items-center justify-center transition hover:scale-110 active:scale-95"
        >
          <FaHeart size={13} className={isFavorited ? "text-red-500" : "text-gray-300"} />
        </button>

        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="bg-white text-ink-900 text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-4 gap-1.5">
        <h1
          className="font-bold text-ink-900 text-[15px] leading-snug line-clamp-1 cursor-pointer hover:text-brand-600 transition"
          onClick={() => navigate(`/item/${data._id}`)}
        >
          {data.name}
        </h1>

        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-bold text-green-700">
            <FaStar className="text-[10px]" />
            {Number(data.rating?.average || 0).toFixed(1)}
          </span>
          <span className="text-xs text-ink-400">({data.rating?.count || 0})</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-4 mt-auto">
        <span className="font-extrabold text-ink-900 text-lg">₹{data.price}</span>

        {soldOut ? (
          <span className="text-xs font-bold text-ink-400 uppercase tracking-wide">Unavailable</span>
        ) : (
          <div className="flex items-center rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden">
            <button
              aria-label="Decrease quantity"
              disabled={quantity === 0}
              className="px-2.5 py-2 text-ink-700 hover:bg-gray-50 disabled:opacity-40 transition"
              onClick={handleDecrease}
            >
              <FaMinus size={11} />
            </button>
            <span className="w-6 text-center text-sm font-bold">{quantity}</span>
            <button
              aria-label="Increase quantity"
              className="px-2.5 py-2 text-ink-700 hover:bg-gray-50 transition"
              onClick={handleIncrease}
            >
              <FaPlus size={11} />
            </button>
            <button
              aria-label="Add to cart"
              className={`${cartItems.some((i) => i.id == data._id) ? "bg-ink-900" : "bg-brand-500"} text-white px-3 py-2.5 transition-colors hover:opacity-90`}
              onClick={() => {
                if (quantity > 0) {
                  dispatch(
                    addToCart({
                      id: data._id,
                      name: data.name,
                      price: data.price,
                      image: data.image,
                      shop: data.shop?._id || data.shop,
                      quantity,
                      foodType: data.foodType
                    })
                  )
                  toast.success(`${data.name} added to cart`)
                  setQuantity(0)
                }
              }}
            >
              <FaShoppingCart size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Memoized — avoids re-rendering every card when unrelated state changes
export default memo(FoodCard)