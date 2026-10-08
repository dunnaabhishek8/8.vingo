import React, { useEffect, useState } from "react"
import { FaLocationDot, FaPlus } from "react-icons/fa6"
import { IoSearch, IoMenu, IoClose } from "react-icons/io5"
import { FiShoppingCart } from "react-icons/fi"
import { TbReceipt2 } from "react-icons/tb"
import { FaHeart } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { RxCross2 } from "react-icons/rx"
import { useLocation, useNavigate } from "react-router-dom"
import { setSearchItems, setUserData } from "../redux/userSlice"
import api from "../lib/api"
import useDebounce from "../hooks/useDebounce"
import NotificationBell from "./NotificationBell"
import ConfirmDialog from "./ui/ConfirmDialog"
import { useToast } from "./ui/Toast"

function Nav() {
  const { userData, currentCity, cartItems } = useSelector((state) => state.user)
  const { myShopData } = useSelector((state) => state.owner)
  const [showInfo, setShowInfo] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [query, setQuery] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const debouncedQuery = useDebounce(query, 300)

  const handleLogOut = async () => {
    setLoggingOut(true)
    try {
      await api.get("/api/auth/signout")
      dispatch(setUserData(null))
      toast.info("Logged out successfully")
      setShowInfo(false)
      setShowMobileMenu(false)
    } catch (error) {
      toast.error("Could not log out. Please try again.")
    } finally {
      setLoggingOut(false)
      setShowLogoutConfirm(false)
    }
  }

  const handleSearchItems = async (q) => {
    try {
      const result = await api.get(`/api/item/search-items?query=${encodeURIComponent(q)}&city=${encodeURIComponent(currentCity || "")}&limit=12`)
      dispatch(setSearchItems(result.data.items))
    } catch (error) {
      console.log(error)
    }
  }

  // Debounced search — fires only after typing pauses
  useEffect(() => {
    if (debouncedQuery) {
      handleSearchItems(debouncedQuery)
    } else {
      dispatch(setSearchItems(null))
    }
  }, [debouncedQuery])

  // Close mobile menu on navigation
  useEffect(() => {
    setShowMobileMenu(false)
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  const mobileLinks = [
    { label: "Home", path: "/", show: true },
    { label: "My Orders", path: "/my-orders", show: true },
    { label: "Cart", path: "/cart", show: userData.role === "user" },
    { label: "Favorites", path: "/favorites", show: userData.role === "user" },
    { label: "Add Food Item", path: "/add-item", show: userData.role === "owner" && !!myShopData }
  ].filter((l) => l.show)

  return (
    <>
      {/* click-away layers */}
      {showInfo && <div className="fixed inset-0 z-[9998]" onClick={() => setShowInfo(false)} />}
      {showMobileMenu && <div className="md:hidden fixed inset-0 z-[9996]" onClick={() => setShowMobileMenu(false)} />}

      <header className="w-full h-[80px] flex items-center justify-between md:justify-center gap-[20px] md:gap-[30px] px-4 sm:px-6 fixed top-0 z-[9999] bg-white/85 backdrop-blur-xl border-b border-black/[0.06]">

        {/* mobile search sheet */}
        {showSearch && userData.role === "user" && (
          <div className="md:hidden fixed top-[88px] left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white rounded-2xl shadow-pop border border-black/[0.06] p-2 flex items-center gap-2 animate-scale-in z-[9999]">
            <div className="flex items-center gap-2 pl-3 pr-3 py-2 border-r border-gray-200 shrink-0">
              <FaLocationDot size={18} className="text-brand-500" />
              <span className="max-w-[90px] truncate text-sm font-medium text-ink-700">{currentCity}</span>
            </div>
            <div className="flex items-center gap-2 flex-1 px-2">
              <IoSearch size={20} className="text-brand-500 shrink-0" />
              <input
                type="text"
                placeholder="Search delicious food..."
                className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none py-2"
                onChange={(e) => setQuery(e.target.value)}
                value={query}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* mobile hamburger */}
        <button
          aria-label="Open menu"
          className="md:hidden h-10 w-10 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] flex items-center justify-center text-ink-700"
          onClick={() => setShowMobileMenu((p) => !p)}
        >
          {showMobileMenu ? <IoClose size={20} /> : <IoMenu size={20} />}
        </button>

        <h1
          onClick={() => navigate("/")}
          className="text-[28px] leading-none font-extrabold tracking-tight bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 bg-clip-text text-transparent select-none cursor-pointer"
        >
          Vingo
        </h1>

        {/* desktop search bar */}
        {userData.role === "user" && (
          <div className="md:w-[60%] lg:w-[42%] h-[52px] bg-gray-50/90 border border-black/[0.06] rounded-full items-center gap-3 hidden md:flex px-2 focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100 transition">
            <div className="flex items-center gap-2 pl-4 pr-3 self-stretch border-r border-gray-200">
              <FaLocationDot size={18} className="text-brand-500" />
              <span className="max-w-[110px] truncate text-sm font-medium text-ink-700">{currentCity}</span>
            </div>
            <div className="flex items-center gap-2 flex-1 pr-3">
              <IoSearch size={20} className="text-brand-500 shrink-0" />
              <input
                type="text"
                placeholder="Search delicious food..."
                className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none"
                onChange={(e) => setQuery(e.target.value)}
                value={query}
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")} className="text-ink-400 hover:text-ink-700">
                  <RxCross2 size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {userData.role === "user" &&
            (showSearch ? (
              <button aria-label="Close search" className="md:hidden h-10 w-10 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] flex items-center justify-center text-brand-600 hover:bg-brand-50 transition" onClick={() => { setShowSearch(false); setQuery("") }}>
                <RxCross2 size={20} />
              </button>
            ) : (
              <button aria-label="Open search" className="md:hidden h-10 w-10 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] flex items-center justify-center text-brand-600 hover:bg-brand-50 transition" onClick={() => setShowSearch(true)}>
                <IoSearch size={20} />
              </button>
            ))}

          {userData.role === "owner" ? (
            <>
              {myShopData && (
                <>
                  <button className="hidden md:flex items-center gap-2 h-10 px-4 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-95 transition" onClick={() => navigate("/add-item")}>
                    <FaPlus size={15} />
                    <span>Add Food Item</span>
                  </button>
                  <button aria-label="Add food item" className="md:hidden h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 flex items-center justify-center active:scale-95 transition" onClick={() => navigate("/add-item")}>
                    <FaPlus size={17} />
                  </button>
                </>
              )}

              <button className={`hidden md:flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold transition ${isActive("/my-orders") ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25" : "bg-brand-50 text-brand-600 hover:bg-brand-100"}`} onClick={() => navigate("/my-orders")}>
                <TbReceipt2 size={18} />
                <span>My Orders</span>
              </button>
              <button aria-label="My orders" className={`md:hidden h-10 w-10 rounded-full flex items-center justify-center transition ${isActive("/my-orders") ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-600 hover:bg-brand-100"}`} onClick={() => navigate("/my-orders")}>
                <TbReceipt2 size={18} />
              </button>
            </>
          ) : (
            <>
              {userData.role === "user" && (
                <>
                  <button aria-label="Favorites" className={`hidden sm:flex h-10 w-10 rounded-full flex items-center justify-center transition ${isActive("/favorites") ? "bg-red-50 text-red-500" : "bg-white shadow-soft ring-1 ring-black/[0.06] text-ink-700 hover:text-red-500 hover:bg-red-50"}`} onClick={() => navigate("/favorites")}>
                    <FaHeart size={16} />
                  </button>
                  <button aria-label="Cart" className="relative h-10 w-10 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] flex items-center justify-center text-brand-600 hover:text-brand-700 hover:bg-brand-50 transition" onClick={() => navigate("/cart")}>
                    <FiShoppingCart size={19} />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
                        {cartItems.length}
                      </span>
                    )}
                  </button>
                </>
              )}

              <button className={`hidden md:block h-10 px-4 rounded-full text-sm font-semibold transition ${isActive("/my-orders") ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25" : "bg-brand-50 text-brand-600 hover:bg-brand-100"}`} onClick={() => navigate("/my-orders")}>
                My Orders
              </button>
            </>
          )}

          <NotificationBell />

          <button
            aria-label="Profile menu"
            className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-base font-bold uppercase shadow-lg shadow-brand-500/30 ring-2 ring-white/70 flex items-center justify-center active:scale-95 transition"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            {userData?.fullName?.trim().charAt(0)}
          </button>

          {showInfo && (
            <div className={`fixed top-[88px] right-4
              ${userData.role === "deliveryBoy" ? "md:right-[20%] lg:right-[40%]" : "md:right-[10%] lg:right-[25%]"} w-[210px] bg-white rounded-2xl shadow-pop border border-black/[0.06] p-2 flex flex-col z-[9999] animate-scale-in`}>
              <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
                <div className="text-[15px] font-bold text-ink-900 truncate">{userData.fullName}</div>
                <div className="text-xs text-ink-400 capitalize mt-0.5">{userData.role}</div>
              </div>
              {userData.role === "user" && (
                <>
                  <button className="md:hidden text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-ink-700 hover:bg-gray-50 transition" onClick={() => { setShowInfo(false); navigate("/my-orders") }}>My Orders</button>
                  <button className="md:hidden text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-ink-700 hover:bg-gray-50 transition" onClick={() => { setShowInfo(false); navigate("/favorites") }}>Favorites</button>
                </>
              )}
              <button className="text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-600 hover:bg-brand-50 transition" onClick={() => setShowLogoutConfirm(true)}>
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* mobile slide-down menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed top-[80px] inset-x-0 z-[9997] bg-white/95 backdrop-blur-xl border-b border-black/[0.06] shadow-pop animate-fade-in">
          <nav className="px-4 py-3 flex flex-col">
            {mobileLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition flex items-center gap-3 ${
                  isActive(link.path) ? "bg-brand-50 text-brand-600" : "text-ink-700 hover:bg-gray-50"
                }`}
              >
                {link.label}
                {link.path === "/cart" && cartItems.length > 0 && (
                  <span className="ml-auto h-5 min-w-[20px] px-1.5 rounded-full bg-brand-500 text-white text-[11px] font-bold flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      )}

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log out?"
        message="You'll need to sign in again to order food."
        confirmText="Log Out"
        danger
        busy={loggingOut}
        onConfirm={handleLogOut}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </>
  )
}

export default Nav