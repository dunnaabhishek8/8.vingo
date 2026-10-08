import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaMinus, FaPlus, FaHeart, FaStar, FaLeaf, FaDrumstickBite, FaArrowLeft, FaChevronRight, FaStore } from "react-icons/fa6"
import { FaShoppingCart } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { addToCart, toggleFavoriteLocal } from "../redux/userSlice"
import api from "../lib/api"
import { addRecentItemId } from "../lib/recent"
import FoodCard from "../components/FoodCard"
import ErrorState from "../components/ui/ErrorState"
import { useToast } from "../components/ui/Toast"

function ItemDetail() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toast = useToast()
  const { cartItems, favorites } = useSelector((state) => state.user)

  const [item, setItem] = useState(null)
  const [related, setRelated] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [failed, setFailed] = useState(false)

  const load = async () => {
    setFailed(false)
    try {
      const { data } = await api.get(`/api/item/get-by-id/${itemId}`)
      setItem(data)
      addRecentItemId(data._id)

      // related items: same category within the item's city
      if (data.shop?.city) {
        try {
          const res = await api.get(
            `/api/item/search-items?query=${encodeURIComponent(data.category)}&city=${encodeURIComponent(data.shop.city)}&category=${encodeURIComponent(data.category)}&limit=8`
          )
          setRelated(res.data.items.filter((i) => String(i._id) !== String(data._id)))
        } catch {
          /* related is optional */
        }
      }
    } catch {
      setFailed(true)
    }
  }

  useEffect(() => {
    load()
    window.scrollTo(0, 0)
  }, [itemId])

  const isFavorited = favorites.some((f) => String(f._id) === String(item?._id))

  const handleFavorite = async () => {
    dispatch(toggleFavoriteLocal(item))
    try {
      const { data: result } = await api.post(`/api/favorite/toggle/${item._id}`)
      if (!result.favorited) dispatch(toggleFavoriteLocal(item._id))
    } catch {
      dispatch(toggleFavoriteLocal(item))
      toast.error("Could not update favorites")
    }
  }

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      shop: item.shop?._id || item.shop,
      quantity,
      foodType: item.foodType
    }))
    toast.success(`${quantity} × ${item.name} added to cart`)
  }

  if (failed) {
    return (
      <div className="min-h-screen bg-cream pt-28 px-4 max-w-2xl mx-auto">
        <ErrorState message="This item could not be found or is no longer available." onRetry={() => navigate("/")} />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-cream pt-28 px-4 max-w-4xl mx-auto animate-pulse">
        <div className="rounded-3xl bg-gray-200/70 h-72 w-full" />
        <div className="mt-6 space-y-3">
          <div className="h-7 w-2/3 bg-gray-200/70 rounded" />
          <div className="h-4 w-1/3 bg-gray-200/70 rounded" />
          <div className="h-20 w-full bg-gray-200/70 rounded" />
        </div>
      </div>
    )
  }

  const soldOut = item.isAvailable === false

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24">
        {/* back + breadcrumb */}
        <div className="flex items-center gap-3 mb-6">
          <button
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="h-11 w-11 shrink-0 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] text-brand-600 hover:bg-brand-50 transition flex items-center justify-center cursor-pointer"
          >
            <FaArrowLeft size={18} />
          </button>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-ink-400">
            <button onClick={() => navigate("/")} className="hover:text-brand-600 transition">Home</button>
            <FaChevronRight size={9} />
            <span className="font-semibold text-ink-700 truncate">{item.category}</span>
          </nav>
        </div>

        {/* main card */}
        <div className="bg-white rounded-3xl shadow-card border border-black/[0.05] overflow-hidden animate-fade-up">
          <div className="relative w-full h-64 sm:h-80">
            <img src={item.image} alt={item.name} className={`w-full h-full object-cover ${soldOut ? "grayscale" : ""}`} />
            <button
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
              onClick={handleFavorite}
              className="absolute top-4 right-4 h-11 w-11 rounded-full bg-white/95 backdrop-blur shadow-md flex items-center justify-center transition hover:scale-110 active:scale-95"
            >
              <FaHeart size={17} className={isFavorited ? "text-red-500" : "text-gray-300"} />
            </button>
            {soldOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <span className="bg-white text-ink-900 text-sm font-extrabold uppercase tracking-wider px-4 py-2 rounded-full shadow">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900">{item.name}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
                    <FaStar size={11} /> {Number(item.rating?.average || 0).toFixed(1)} ({item.rating?.count || 0})
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-ink-700 capitalize">
                    {item.foodType === "veg" ? <FaLeaf size={10} className="text-green-600" /> : <FaDrumstickBite size={10} className="text-red-500" />}
                    {item.foodType}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-ink-700">
                    {item.category}
                  </span>
                </div>
              </div>
              <span className="text-3xl font-extrabold text-brand-600">₹{item.price}</span>
            </div>

            {item.description && (
              <p className="mt-4 text-sm sm:text-base text-ink-500 leading-relaxed">{item.description}</p>
            )}

            {/* shop chip */}
            {item.shop?.name && (
              <button
                onClick={() => item.shop._id && navigate(`/shop/${item.shop._id}`)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-sm font-semibold text-ink-700 hover:border-brand-300 hover:text-brand-600 transition"
              >
                <FaStore size={13} className="text-brand-500" />
                {item.shop.name}
                {item.shop.city ? ` · ${item.shop.city}` : ""}
              </button>
            )}

            {/* actions */}
            {!soldOut && (
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center justify-between sm:justify-start rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden w-full sm:w-auto">
                  <button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-3 text-ink-700 hover:bg-gray-50 disabled:opacity-40 transition">
                    <FaMinus size={13} />
                  </button>
                  <span className="w-10 text-center font-extrabold">{quantity}</span>
                  <button aria-label="Increase quantity" onClick={() => setQuantity((q) => q + 1)} className="px-4 py-3 text-ink-700 hover:bg-gray-50 transition">
                    <FaPlus size={13} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] transition flex items-center justify-center gap-2"
                >
                  <FaShoppingCart size={16} />
                  Add to Cart · ₹{item.price * quantity}
                </button>
              </div>
            )}
            {cartItems.some((i) => i.id == item._id) && !soldOut && (
              <button onClick={() => navigate("/cart")} className="mt-3 text-sm font-bold text-brand-600 hover:text-brand-700 transition">
                View cart →
              </button>
            )}
          </div>
        </div>

        {/* related */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900 mb-5">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center">
              {related.map((rel) => (
                <FoodCard key={rel._id} data={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ItemDetail