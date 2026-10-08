import React, { useEffect, useMemo, useRef, useState } from "react"
import Nav from "./Nav"
import { categories } from "../category"
import CategoryCard from "./CategoryCard"
import { FaCircleChevronLeft, FaCircleChevronRight, FaStar, FaUtensils } from "react-icons/fa6"
import { useSelector } from "react-redux"
import FoodCard from "./FoodCard"
import { useNavigate } from "react-router-dom"
import api from "../lib/api"
import { CardsSkeleton } from "./ui/Skeletons"
import EmptyState from "./ui/EmptyState"
import Footer from "./Footer"
import { getRecentItemIds } from "../lib/recent"

// Compact horizontal item card used in recommendation / recent rows
function MiniItemCard({ item }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/item/${item._id}`)}
      className="shrink-0 w-[220px] flex items-center gap-3 bg-white rounded-2xl border border-black/[0.05] shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all p-2.5 text-left"
    >
      <img src={item.image} alt={item.name} loading="lazy" className="w-14 h-14 rounded-xl object-cover shrink-0" />
      <span className="min-w-0">
        <span className="block text-sm font-bold text-ink-900 truncate">{item.name}</span>
        <span className="flex items-center gap-1 text-xs text-ink-500">
          <FaStar size={9} className="text-amber-400" />
          {Number(item.rating?.average || 0).toFixed(1)} · ₹{item.price}
        </span>
      </span>
    </button>
  )
}

const SORTS = [
  { key: "newest", label: "Newest first" },
  { key: "rating", label: "Top rated" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" }
]

function UserDashboard() {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector((state) => state.user)
  const cateScrollRef = useRef(null)
  const shopScrollRef = useRef(null)
  const navigate = useNavigate()
  const [showLeftCateButton, setShowLeftCateButton] = useState(false)
  const [showRightCateButton, setShowRightCateButton] = useState(false)
  const [showLeftShopButton, setShowLeftShopButton] = useState(false)
  const [showRightShopButton, setShowRightShopButton] = useState(false)

  // filters & sorting (client-side over the city's items)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [foodFilter, setFoodFilter] = useState("all")

  // recommendations
  const [recommendations, setRecommendations] = useState(null)

  useEffect(() => {
    if (!currentCity) return
    let cancelled = false
    api.get(`/api/item/recommendations/${encodeURIComponent(currentCity)}`)
      .then(({ data }) => { if (!cancelled) setRecommendations(data) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [currentCity])

  const recentItems = useMemo(() => {
    const ids = getRecentItemIds()
    if (!ids.length || !Array.isArray(itemsInMyCity)) return []
    return ids
      .map((id) => itemsInMyCity.find((i) => String(i._id) === String(id)))
      .filter(Boolean)
  }, [itemsInMyCity])

  const displayedItems = useMemo(() => {
    let list = Array.isArray(itemsInMyCity) ? [...itemsInMyCity] : []
    if (selectedCategory !== "All") {
      list = list.filter((i) => i.category === selectedCategory)
    }
    if (foodFilter !== "all") {
      list = list.filter((i) => i.foodType === foodFilter)
    }
    switch (sortBy) {
      case "rating":
        list.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
        break
      case "price_asc":
        list.sort((a, b) => a.price - b.price)
        break
      case "price_desc":
        list.sort((a, b) => b.price - a.price)
        break
      default:
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    return list
  }, [itemsInMyCity, selectedCategory, sortBy, foodFilter])

  const handleFilterByCategory = (category) => {
    setSelectedCategory(category)
  }

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current
    if (element) {
      setLeftButton(element.scrollLeft > 0)
      setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth)
    }
  }

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth"
      })
    }
  }

  useEffect(() => {
    if (cateScrollRef.current) {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      cateScrollRef.current.addEventListener('scroll', () => {
        updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      })
      shopScrollRef.current.addEventListener('scroll', () => {
        updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      })
    }

    return () => {
      cateScrollRef?.current?.removeEventListener("scroll", () => {
        updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      })
      shopScrollRef?.current?.removeEventListener("scroll", () => {
        updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      })
    }
  }, [categories])

  const isLoading = itemsInMyCity === null
  const hasActiveFilters = selectedCategory !== "All" || foodFilter !== "all" || sortBy !== "newest"

  return (
    <div className="w-screen min-h-screen flex flex-col gap-10 items-center bg-cream pb-10">
      <Nav />

      {/* search results */}
      {searchItems && searchItems.length > 0 && (
        <div className="w-full max-w-6xl px-4 sm:px-6 flex flex-col gap-5 items-start">
          <div className="w-full bg-white shadow-soft rounded-3xl border border-black/[0.05] p-5 sm:p-6 animate-fade-up">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900 border-b border-gray-100 pb-3 mb-5">
              Search Results
            </h1>
            <div className="w-full flex flex-wrap gap-5 justify-center">
              {searchItems.map((item) => (
                <FoodCard data={item} key={item._id} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* categories */}
      <div className="w-full max-w-6xl px-4 sm:px-6 flex flex-col gap-5 items-start">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900">Inspiration for your first order</h1>
        <div className="w-full relative">
          {showLeftCateButton && (
            <button aria-label="Scroll left" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-card ring-1 ring-black/[0.06] text-ink-700 hover:text-brand-600 hover:scale-105 transition flex items-center justify-center" onClick={() => scrollHandler(cateScrollRef, "left")}>
              <FaCircleChevronLeft size={18} />
            </button>
          )}
          <div className='w-full flex overflow-x-auto no-scrollbar gap-4 pb-1 scroll-smooth' ref={cateScrollRef}>
            {categories.map((cate, index) => (
              <CategoryCard name={cate.category} image={cate.image} key={index} onClick={() => handleFilterByCategory(cate.category)} />
            ))}
          </div>
          {showRightCateButton && (
            <button aria-label="Scroll right" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-card ring-1 ring-black/[0.06] text-ink-700 hover:text-brand-600 hover:scale-105 transition flex items-center justify-center" onClick={() => scrollHandler(cateScrollRef, "right")}>
              <FaCircleChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* shops */}
      <div className='w-full max-w-6xl px-4 sm:px-6 flex flex-col gap-5 items-start'>
        <h1 className='text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900'>Best Shops in {currentCity}</h1>
        <div className='w-full relative'>
          {showLeftShopButton && (
            <button aria-label="Scroll left" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-card ring-1 ring-black/[0.06] text-ink-700 hover:text-brand-600 hover:scale-105 transition flex items-center justify-center" onClick={() => scrollHandler(shopScrollRef, "left")}>
              <FaCircleChevronLeft size={18} />
            </button>
          )}
          <div className='w-full flex overflow-x-auto no-scrollbar gap-4 pb-1 scroll-smooth' ref={shopScrollRef}>
            {shopInMyCity?.map((shop, index) => (
              <CategoryCard name={shop.name} image={shop.image} key={index} onClick={() => navigate(`/shop/${shop._id}`)} />
            ))}
          </div>
          {showRightShopButton && (
            <button aria-label="Scroll right" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-card ring-1 ring-black/[0.06] text-ink-700 hover:text-brand-600 hover:scale-105 transition flex items-center justify-center" onClick={() => scrollHandler(shopScrollRef, "right")}>
              <FaCircleChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* recommendations */}
      {recommendations && (recommendations.topRated?.length > 0 || recommendations.popular?.length > 0) && (
        <>
          {recommendations.topRated?.length > 0 && (
            <div className='w-full max-w-6xl px-4 sm:px-6 flex flex-col gap-4 items-start'>
              <h1 className='text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900'>Top rated near you ⭐</h1>
              <div className='w-full flex overflow-x-auto no-scrollbar gap-3 pb-1 scroll-smooth'>
                {recommendations.topRated.map((item) => (
                  <MiniItemCard item={item} key={item._id} />
                ))}
              </div>
            </div>
          )}
          {recommendations.popular?.length > 0 && (
            <div className='w-full max-w-6xl px-4 sm:px-6 flex flex-col gap-4 items-start'>
              <h1 className='text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900'>Popular right now 🔥</h1>
              <div className='w-full flex overflow-x-auto no-scrollbar gap-3 pb-1 scroll-smooth'>
                {recommendations.popular.map((item) => (
                  <MiniItemCard item={item} key={item._id} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* recently viewed */}
      {recentItems.length > 0 && (
        <div className='w-full max-w-6xl px-4 sm:px-6 flex flex-col gap-4 items-start'>
          <h1 className='text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900'>Recently viewed</h1>
          <div className='w-full flex overflow-x-auto no-scrollbar gap-3 pb-1 scroll-smooth'>
            {recentItems.map((item) => (
              <MiniItemCard item={item} key={item._id} />
            ))}
          </div>
        </div>
      )}

      {/* suggested items with filters */}
      <div className='w-full max-w-6xl px-4 sm:px-6 flex flex-col gap-5 items-start'>
        <h1 className='text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900'>
          {selectedCategory === "All" ? "Suggested Food Items" : selectedCategory}
        </h1>

        {/* filter bar */}
        {!isLoading && (
          <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-black/[0.05] shadow-soft px-4 py-3">
            <div className="flex items-center gap-2">
              {[
                { key: "all", label: "All" },
                { key: "veg", label: "Veg" },
                { key: "non veg", label: "Non-Veg" }
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFoodFilter(f.key)}
                  className={`px-4 h-9 rounded-full text-sm font-bold transition ${
                    foodFilter === f.key
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
                      : "bg-gray-100 text-ink-700 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={() => { setSelectedCategory("All"); setFoodFilter("all"); setSortBy("newest") }}
                  className="px-4 h-9 rounded-full text-sm font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition"
                >
                  Clear Filters
                </button>
              )}
              <select
                aria-label="Sort items"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 transition cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isLoading ? (
          <CardsSkeleton count={8} />
        ) : displayedItems.length > 0 ? (
          <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 justify-items-center'>
            {displayedItems.map((item) => (
              <FoodCard key={item._id} data={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FaUtensils size={24} />}
            title="No items match your filters"
            subtitle="Try a different category or clear the filters to see everything available in your city."
            action={
              <button
                onClick={() => { setSelectedCategory("All"); setFoodFilter("all"); setSortBy("newest") }}
                className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 transition"
              >
                Clear Filters
              </button>
            }
          />
        )}
      </div>

      <Footer />
    </div>
  )
}

export default UserDashboard