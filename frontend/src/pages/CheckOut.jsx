import React, { useEffect, useState } from "react"
import { IoIosArrowRoundBack } from "react-icons/io"
import { IoSearchOutline } from "react-icons/io5"
import { TbCurrentLocation } from "react-icons/tb"
import { IoLocationSharp } from "react-icons/io5"
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet"
import { useDispatch, useSelector } from "react-redux"
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from "../redux/mapSlice"
import { MdDeliveryDining } from "react-icons/md"
import { FaCreditCard, FaTag } from "react-icons/fa"
import axios from "axios"
import { FaMobileScreenButton } from "react-icons/fa6"
import { useNavigate } from "react-router-dom"
import api from "../lib/api"
import { addMyOrder, setCartFromServer, clearCart } from "../redux/userSlice"
import { useToast } from "../components/ui/Toast"

// Recenter the Leaflet map when location changes.
// useMap is called unconditionally at the top level (fixes Rules-of-Hooks risk).
function RecenterMap({ location }) {
  const map = useMap()
  useEffect(() => {
    if (location?.lat && location?.lon) {
      map.setView([location.lat, location.lon], 16, { animate: true })
    }
  }, [location?.lat, location?.lon, map])
  return null
}

function CheckOut() {
  const { location, address } = useSelector((state) => state.map)
  const { cartItems, totalAmount, userData } = useSelector((state) => state.user)
  const [addressInput, setAddressInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [placing, setPlacing] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null) // {code, discount, description}
  const [offers, setOffers] = useState([])
  const [couponLoading, setCouponLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const toast = useToast()

  const apiKey = import.meta.env.VITE_GEOAPIKEY

  // Fee logic mirrors the backend exactly
  const deliveryFee = totalAmount > 500 ? 0 : 40
  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, totalAmount) : 0
  const amountWithDeliveryFee = Math.max(0, totalAmount + deliveryFee - discount)

  // ---------- geocoding ----------
  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat, lon: lng }))
    getAddressByLatLng(lat, lng)
  }

  const getCurrentLocation = () => {
    if (!userData?.location?.coordinates) return
    const latitude = userData.location.coordinates[1]
    const longitude = userData.location.coordinates[0]
    dispatch(setLocation({ lat: latitude, lon: longitude }))
    getAddressByLatLng(latitude, longitude)
  }

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`
      )
      dispatch(setAddress(result?.data?.results[0].address_line2))
    } catch (error) {
      console.log(error)
    }
  }

  const getLatLngByAddress = async () => {
    if (!addressInput.trim()) {
      toast.info("Type an address first, then search.")
      return
    }
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`
      )
      const { lat, lon } = result.data.features[0].properties
      dispatch(setLocation({ lat, lon }))
    } catch (error) {
      toast.error("Couldn't find that address. Try picking it on the map.")
    }
  }

  // ---------- cart validation against live prices/availability ----------
  useEffect(() => {
    setAddressInput(address || "")
  }, [address])

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.post("/api/order/validate-cart", { cartItems })
        if (cancelled) return
        const hasChanges = data.items.some((l) => l.changed || l.exists === false || l.isAvailable === false)
        if (hasChanges) {
          dispatch(setCartFromServer(data.items))
          const removed = data.items.filter((l) => l.exists === false || l.isAvailable === false).map((l) => l.name)
          if (removed.length > 0) {
            toast.info(`Removed unavailable items: ${removed.join(", ")}`)
          } else {
            toast.info("Cart updated with latest prices.")
          }
        }
      } catch {
        /* non-blocking */
      }
    })()
    return () => { cancelled = true }
  }, [])

  // ---------- offers ----------
  useEffect(() => {
    api.get("/api/coupon/active")
      .then(({ data }) => setOffers(data))
      .catch(() => {})
  }, [])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const { data } = await api.post("/api/coupon/apply", { code: couponCode.trim(), amount: totalAmount })
      setAppliedCoupon(data)
      toast.success(`${data.code} applied — you saved ₹${data.discount}!`)
    } catch (error) {
      setAppliedCoupon(null)
      toast.error(error?.response?.data?.message || "Could not apply coupon.")
    } finally {
      setCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
  }

  // ---------- place order ----------
  const finalizeOrder = () => {
    dispatch(clearCart())
    removeCoupon()
  }

  const handlePlaceOrder = async () => {
    if (!addressInput.trim()) {
      toast.error("Please enter a delivery address.")
      return
    }
    if (!cartItems.length) {
      toast.error("Your cart is empty.")
      return
    }

    setPlacing(true)
    try {
      const payload = {
        paymentMethod,
        couponCode: appliedCoupon?.code || "",
        deliveryAddress: {
          text: addressInput,
          latitude: location.lat,
          longitude: location.lon
        },
        cartItems
      }
      const result = await api.post("/api/order/place-order", payload)

      if (paymentMethod === "cod") {
        dispatch(addMyOrder(result.data))
        finalizeOrder()
        navigate("/order-placed", {
          state: { total: result.data.totalAmount, paymentMethod: "cod", paid: false }
        })
      } else {
        const orderId = result.data.orderId
        const razorOrder = result.data.razorOrder
        openRazorpayWindow(orderId, razorOrder)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not place order. Please try again.")
    } finally {
      setPlacing(false)
    }
  }

  const openRazorpayWindow = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder.amount,
      currency: "INR",
      name: "Vingo",
      description: "Food Delivery",
      order_id: razorOrder.id,
      modal: {
        ondismiss: () => {
          setPlacing(false)
          toast.error("Payment cancelled. Your order was not placed — you can retry anytime.")
        }
      },
      handler: async function (response) {
        try {
          const result = await api.post("/api/order/verify-payment", {
            razorpay_payment_id: response.razorpay_payment_id,
            orderId
          })
          dispatch(addMyOrder(result.data))
          finalizeOrder()
          navigate("/order-placed", {
            state: { total: result.data.totalAmount, paymentMethod: "online", paid: true }
          })
        } catch (error) {
          toast.error(error?.response?.data?.message || "Payment verification failed. Contact support if money was deducted.")
        } finally {
          setPlacing(false)
        }
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 sm:p-6 py-24">
      <button
        aria-label="Go back"
        className="fixed top-5 left-5 z-[20] h-11 w-11 rounded-full bg-white shadow-card ring-1 ring-black/[0.06] text-brand-600 hover:bg-brand-50 transition flex items-center justify-center cursor-pointer"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={24} />
      </button>

      <div className="w-full max-w-[900px] bg-white rounded-3xl shadow-card border border-black/[0.05] p-5 sm:p-8 space-y-8 animate-fade-up">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900">Checkout</h1>

        {/* delivery location */}
        <section>
          <h2 className="flex items-center gap-2.5 mb-4">
            <span className="h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><IoLocationSharp size={18} /></span>
            <span className="text-base sm:text-lg font-bold text-ink-900">Delivery Location</span>
          </h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              placeholder="Enter Your Delivery Address.."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
            <button aria-label="Search address" className="shrink-0 h-[42px] w-[46px] rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-95 transition" onClick={getLatLngByAddress}>
              <IoSearchOutline size={17} />
            </button>
            <button aria-label="Use current location" className="shrink-0 h-[42px] w-[46px] rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 hover:bg-blue-600 active:scale-95 transition" onClick={getCurrentLocation}>
              <TbCurrentLocation size={17} />
            </button>
          </div>
          <div className="rounded-2xl ring-1 ring-black/10 overflow-hidden shadow-soft relative z-0">
            <div className="h-64 w-full flex items-center justify-center">
              <MapContainer className={"w-full h-full"} center={[location?.lat, location?.lon]} zoom={16}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location} />
                <Marker position={[location?.lat, location?.lon]} draggable eventHandlers={{ dragend: onDragEnd }} />
              </MapContainer>
            </div>
          </div>
        </section>

        {/* payment method */}
        <section>
          <h2 className="flex items-center gap-2.5 mb-4">
            <span className="h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><FaCreditCard size={16} /></span>
            <span className="text-base sm:text-lg font-bold text-ink-900">Payment Method</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left cursor-pointer transition-all ${paymentMethod === "cod" ? "border-brand-500 bg-brand-50/70 ring-2 ring-brand-200 shadow-soft" : "border-gray-200 bg-white hover:border-brand-300"}`}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100">
                <MdDeliveryDining className="text-green-600 text-xl" />
              </span>
              <div>
                <p className="font-bold text-ink-900">Cash On Delivery</p>
                <p className="text-xs text-ink-500 mt-0.5">Pay when your food arrives</p>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left cursor-pointer transition-all ${paymentMethod === "online" ? "border-brand-500 bg-brand-50/70 ring-2 ring-brand-200 shadow-soft" : "border-gray-200 bg-white hover:border-brand-300"}`}
              onClick={() => setPaymentMethod("online")}
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <FaMobileScreenButton className="text-purple-700 text-lg" />
              </span>
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 -ml-7 hidden sm:inline-flex">
                <FaCreditCard className="text-blue-700 text-lg" />
              </span>
              <div>
                <p className="font-bold text-ink-900">UPI / Credit / Debit Card</p>
                <p className="text-xs text-ink-500 mt-0.5">Pay Securely Online</p>
              </div>
            </div>
          </div>
        </section>

        {/* coupons */}
        <section>
          <h2 className="flex items-center gap-2.5 mb-4">
            <span className="h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><FaTag size={15} /></span>
            <span className="text-base sm:text-lg font-bold text-ink-900">Coupons & Offers</span>
          </h2>

          {offers.length > 0 && !appliedCoupon && (
            <div className="flex overflow-x-auto no-scrollbar gap-2 mb-3 pb-1">
              {offers.map((o) => (
                <button
                  key={o.code}
                  onClick={() => setCouponCode(o.code)}
                  className={`shrink-0 text-left rounded-xl border border-dashed border-brand-300 bg-brand-50/60 px-3 py-2 hover:bg-brand-50 transition ${totalAmount < o.minOrderAmount ? "opacity-50" : ""}`}
                  title={totalAmount < o.minOrderAmount ? `Requires ₹${o.minOrderAmount} minimum` : o.description}
                >
                  <span className="block text-xs font-extrabold text-brand-700">{o.code}</span>
                  <span className="block text-[10px] text-ink-500">{o.description}</span>
                </button>
              ))}
            </div>
          )}

          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <div>
                <p className="text-sm font-extrabold text-green-700">{appliedCoupon.code} applied</p>
                <p className="text-xs text-green-600">{appliedCoupon.description} · You save ₹{discount}</p>
              </div>
              <button onClick={removeCoupon} className="text-sm font-bold text-red-500 hover:text-red-600">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon code…"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 uppercase"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="shrink-0 px-5 h-[42px] rounded-xl bg-ink-900 text-white text-sm font-bold hover:bg-ink-700 active:scale-95 transition disabled:opacity-50"
              >
                {couponLoading ? "…" : "Apply"}
              </button>
            </div>
          )}
        </section>

        {/* order summary */}
        <section>
          <h2 className="flex items-center gap-2.5 mb-4">
            <span className="h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><MdDeliveryDining size={17} /></span>
            <span className="text-base sm:text-lg font-bold text-ink-900">Order Summary</span>
          </h2>
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 sm:p-5 space-y-2.5">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm text-ink-700">
                <span>{item.name} × {item.quantity}</span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <hr className="border-gray-200 my-2" />
            <div className="flex justify-between font-semibold text-ink-900 text-sm">
              <span>Subtotal</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm text-ink-700">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? <span className="font-semibold text-green-600">Free</span> : `₹${deliveryFee}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm font-semibold text-green-600">
                <span>Coupon ({appliedCoupon.code})</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-extrabold text-brand-600 pt-1.5">
              <span>Total</span>
              <span>₹{amountWithDeliveryFee}</span>
            </div>
          </div>
        </section>

        <button
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.99] transition flex items-center justify-center disabled:opacity-60 disabled:pointer-events-none"
          onClick={handlePlaceOrder}
          disabled={placing}
        >
          {placing
            ? "Processing…"
            : paymentMethod === "cod"
              ? "Place Order"
              : `Pay ₹${amountWithDeliveryFee} & Place Order`}
        </button>
      </div>
    </div>
  )
}

export default CheckOut