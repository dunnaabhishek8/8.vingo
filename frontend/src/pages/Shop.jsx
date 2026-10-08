import React, { useEffect, useMemo, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { FaStore, FaLocationDot, FaArrowLeft, FaChevronRight, FaStar } from "react-icons/fa6"
import { FaUtensils } from "react-icons/fa"
import FoodCard from "../components/FoodCard"
import api from "../lib/api"
import { CardsSkeleton } from "../components/ui/Skeletons"
import EmptyState from "../components/ui/EmptyState"
import ErrorState from "../components/ui/ErrorState"

function Shop() {
  const { shopId } = useParams()
  const [shop, setShop] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [reviews, setReviews] = useState([])
  const [activeCategory, setActiveCategory] = useState("All")
  const navigate = useNavigate()

  const handleShop = async () => {
    setLoading(true)
    setFailed(false)
    try {
      const result = await api.get(`/api/item/get-by-shop/${shopId}`)
      setShop(result.data.shop)
      setItems(result.data.items)
    } catch (error) {
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleShop()
    window.scrollTo(0, 0)
  }, [shopId])

  // shop-level recent reviews
  useEffect(() => {
    if (!shopId) return
    api.get(`/api/review/shop/${shopId}`)
      .then(({ data }) => setReviews(data))
      .catch(() => {})
  }, [shopId])

  const menuCategories = useMemo(() => {
    const cats = [...new Set(items.map((i) => i.category))]
    return ["All", ...cats]
  }, [items])

  const displayedItems = useMemo(() => {
    if (activeCategory === "All") return items
    return items.filter((i) => i.category === activeCategory)
  }, [items, activeCategory])

  const avgRating = useMemo(() => {
    if (!reviews.length) return null
    const sum = reviews.reduce((s, r) => s + r.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }, [reviews])

  return (
    <div className="min-h-screen bg-cream">
      {/* back button */}
      <button
        aria-label="Go back"
        onClick={() => navigate("/")}
        className="fixed top-5 left-5 z-20 flex items-center gap-2 bg-black/45 hover:bg-black/60 backdrop-blur text-white px-4 py-2.5 rounded-full shadow-lg transition cursor-pointer"
      >
        <FaArrowLeft size={14} />
        <span className="text-sm font-semibold">Back</span>
      </button>

      {/* hero */}
      {shop && (
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 flex flex-col justify-end items-center text-center px-4 pb-10 md:pb-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-white text-xs font-bold uppercase tracking-wider mb-3">
              <FaStore size={13} /> Restaurant
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg">{shop.name}</h1>
            <div className="flex items-center gap-[10px] mt-3">
              <FaLocationDot size={18} className="text-brand-400" />
              <p className="text-base md:text-lg font-medium text-white/85">{shop.address}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-ink-400 mb-6">
          <Link to="/" className="hover:text-brand-600 transition">Home</Link>
          <FaChevronRight size={9} />
          <span className="font-semibold text-ink-700 truncate max-w-[200px]">{shop?.name || "Restaurant"}</span>
        </nav>

        {loading ? (
          <>
            <div className="w-full h-64 md:h-80 rounded-3xl bg-gray-200/70 animate-pulse mb-10" />
            <CardsSkeleton count={4} />
          </>
        ) : failed ? (
          <ErrorState message="We couldn't load this restaurant. It may be offline." onRetry={handleShop} />
        ) : (
          <>
            {/* menu header + category chips */}
            <div className="flex flex-col items-center mb-8">
              <h2 className="flex items-center gap-3 mb-5">
                <span className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><FaUtensils size={17} /></span>
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900">Our Menu</span>
              </h2>

              {menuCategories.length > 2 && (
                <div className="w-full flex overflow-x-auto no-scrollbar gap-2 justify-start sm:justify-center pb-1">
                  {menuCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`shrink-0 px-4 h-9 rounded-full text-sm font-bold transition ${
                        activeCategory === cat
                          ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
                          : "bg-white border border-gray-200 text-ink-600 hover:border-brand-300 hover:text-brand-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {displayedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                {displayedItems.map((item) => (
                  <FoodCard data={item} key={item._id} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FaUtensils size={24} />}
                title="No items in this category"
                subtitle="Try another category to explore more of the menu."
              />
            )}

            {/* reviews */}
            {reviews.length > 0 && (
              <section className="mt-14">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900">Recent Reviews</h2>
                  {avgRating && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                      <FaStar size={12} /> {avgRating}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="bg-white rounded-2xl border border-black/[0.05] shadow-soft p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-sm font-bold uppercase flex items-center justify-center">
                            {r.user?.fullName?.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-ink-900 truncate">{r.user?.fullName || "Customer"}</p>
                            <p className="text-xs text-ink-400 truncate">{r.item?.name}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 shrink-0 rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-bold text-green-700">
                          <FaStar size={10} /> {r.rating}
                        </span>
                      </div>
                      {r.text && <p className="mt-2.5 text-sm text-ink-600 leading-relaxed">{r.text}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Shop