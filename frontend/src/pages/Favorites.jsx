import React, { useCallback, useEffect, useState } from "react"
import { IoIosArrowRoundBack } from "react-icons/io"
import { FaHeart } from "react-icons/fa"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setFavorites } from "../redux/userSlice"
import api from "../lib/api"
import FoodCard from "../components/FoodCard"
import EmptyState from "../components/ui/EmptyState"
import { CardsSkeleton } from "../components/ui/Skeletons"
import { useToast } from "../components/ui/Toast"

function Favorites() {
  const [items, setItems] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/api/favorite/my")
      setItems(data)
      dispatch(setFavorites(data))
    } catch {
      toast.error("Could not load your favorites.")
      setItems([])
    }
  }, [dispatch, toast])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            aria-label="Go back"
            onClick={() => navigate(-1)}
            className="h-11 w-11 shrink-0 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] text-brand-600 hover:bg-brand-50 transition flex items-center justify-center cursor-pointer"
          >
            <IoIosArrowRoundBack size={24} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900">Your Favorites</h1>
        </div>

        {items === null ? (
          <CardsSkeleton count={4} />
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 justify-items-center">
            {items.map((item) => (
              <FoodCard key={item._id} data={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FaHeart size={24} />}
            title="No favorites yet"
            subtitle="Tap the heart on any dish to save it here for quick ordering later."
            action={
              <button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 transition"
              >
                Explore Food
              </button>
            }
          />
        )}
      </div>
    </div>
  )
}

export default Favorites