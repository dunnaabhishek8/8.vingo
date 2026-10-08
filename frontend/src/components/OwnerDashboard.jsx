import React, { useEffect, useState } from "react"
import Nav from "./Nav"
import { useSelector } from "react-redux"
import { FaUtensils, FaIndianRupeeSign, FaClockRotateLeft, FaCircleCheck, FaFireBurner } from "react-icons/fa6"
import { useNavigate } from "react-router-dom"
import { FaPen } from "react-icons/fa"
import OwnerItemCard from "./OwnerItemCard"
import api from "../lib/api"
import { StatSkeleton } from "./ui/Skeletons"
import EmptyState from "./ui/EmptyState"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

function StatCard({ icon, label, value, accent = "brand" }) {
  const accents = {
    brand: "bg-brand-50 text-brand-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-500",
    blue: "bg-blue-50 text-blue-600"
  }
  return (
    <div className="bg-white rounded-2xl border border-black/[0.05] shadow-soft p-4 sm:p-5 flex items-center gap-3.5">
      <span className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center ${accents[accent]}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide truncate">{label}</p>
        <p className="text-lg sm:text-xl font-extrabold text-ink-900 leading-tight">{value}</p>
      </div>
    </div>
  )
}

function OwnerDashboard() {
  const { myShopData } = useSelector((state) => state.owner)
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get("/api/order/owner-stats")
      .then(({ data }) => setStats(data))
      .catch(() => {})
  }, [])

  return (
    <div className="w-full min-h-screen bg-cream flex flex-col items-center pb-16">
      <Nav />

      {/* ---------- no shop yet ---------- */}
      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6 w-full pt-8">
          <div className="w-full max-w-md bg-white rounded-3xl border-2 border-dashed border-brand-200 p-8 text-center shadow-soft animate-fade-up">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
              <FaUtensils className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900 mb-1.5">Add Your Restaurant</h2>
            <p className="text-ink-500 mb-6 text-sm sm:text-base leading-relaxed">
              Join our food delivery platform and reach thousands of hungry customers every day.
            </p>
            <button
              className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-95 transition"
              onClick={() => navigate("/create-edit-shop")}
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* ---------- shop exists ---------- */}
      {myShopData && (
        <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900 flex items-center gap-3 mt-8 text-center">
            <span className="h-11 w-11 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
              <FaUtensils className="w-5 h-5" />
            </span>
            Welcome to {myShopData.name}
          </h1>

          {/* analytics */}
          <section className="w-full max-w-3xl space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {stats ? (
                <>
                  <StatCard icon={<FaIndianRupeeSign size={16} />} label="Today's Revenue" value={`₹${stats.todayRevenue}`} accent="green" />
                  <StatCard icon={<FaClockRotateLeft size={15} />} label="Pending Orders" value={stats.pending} accent="orange" />
                  <StatCard icon={<FaCircleCheck size={15} />} label="Completed" value={stats.completed} accent="blue" />
                  <StatCard icon={<FaFireBurner size={15} />} label="Completion Rate" value={`${stats.completionRate}%`} />
                </>
              ) : (
                Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
              )}
            </div>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* weekly revenue chart */}
                <div className="md:col-span-3 bg-white rounded-2xl border border-black/[0.05] shadow-soft p-4 sm:p-5">
                  <h3 className="text-sm font-extrabold tracking-tight text-ink-900 mb-3">Revenue · Last 7 Days</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={stats.weekly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eae6" />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#948d9c" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#948d9c" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip formatter={(v) => [`₹${v}`, "revenue"]} />
                      <Bar dataKey="revenue" fill="#ff4d2d" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* top items */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-black/[0.05] shadow-soft p-4 sm:p-5">
                  <h3 className="text-sm font-extrabold tracking-tight text-ink-900 mb-3">Most Ordered Items</h3>
                  {stats.topItems.length > 0 ? (
                    <ul className="space-y-2.5">
                      {stats.topItems.map((t, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <span className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-extrabold ${i === 0 ? "bg-brand-500 text-white" : "bg-gray-100 text-ink-600"}`}>
                            {i + 1}
                          </span>
                          <span className="flex-1 min-w-0 text-sm font-semibold text-ink-700 truncate">{t.name}</span>
                          <span className="text-sm font-extrabold text-brand-600">{t.qty}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-ink-400">No orders yet — stats appear after your first sale.</p>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* shop card */}
          <div className="bg-white rounded-3xl shadow-card border border-black/[0.05] overflow-hidden w-full max-w-3xl relative animate-fade-up">
            <button
              aria-label="Edit shop"
              className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/95 backdrop-blur shadow-soft text-brand-600 hover:text-brand-700 hover:scale-105 transition flex items-center justify-center"
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPen size={15} />
            </button>
            <img src={myShopData.image} alt={myShopData.name} className="w-full h-52 sm:h-64 object-cover" />
            <div className="p-5 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900">{myShopData.name}</h1>
              <p className="mt-1.5 text-sm font-semibold text-brand-600">{myShopData.city},{myShopData.state}</p>
              <p className="text-sm text-ink-500 mt-0.5">{myShopData.address}</p>
            </div>
          </div>

          {/* items */}
          {myShopData.items.length === 0 ? (
            <div className="flex justify-center items-center p-4 sm:p-6 w-full">
              <div className="w-full max-w-md bg-white rounded-3xl border-2 border-dashed border-brand-200 p-8 text-center shadow-soft">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
                  <FaUtensils className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900 mb-1.5">Add Your Food Item</h2>
                <p className="text-ink-500 mb-6 text-sm sm:text-base leading-relaxed">
                  Share your delicious creations with our customers by adding them to the menu.
                </p>
                <button
                  className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-95 transition"
                  onClick={() => navigate("/add-item")}
                >
                  Add Food
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full max-w-3xl px-4">
              <div className="w-full flex items-center justify-between max-w-3xl">
                <h2 className="text-lg font-extrabold tracking-tight text-ink-900">Your Menu</h2>
                <button
                  onClick={() => navigate("/add-item")}
                  className="text-sm font-bold text-brand-600 hover:text-brand-700 transition"
                >
                  + Add new
                </button>
              </div>
              {myShopData.items.map((item, index) => (
                <OwnerItemCard data={item} key={index} />
              ))}
            </div>
          )}
        </div>
      )}

      <EmptyStateSpacer />
    </div>
  )
}

// keeps layout spacing consistent without extra logic
function EmptyStateSpacer() {
  return <div className="h-2" />
}

export default OwnerDashboard