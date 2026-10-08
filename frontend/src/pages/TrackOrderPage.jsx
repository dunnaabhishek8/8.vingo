import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { IoIosArrowRoundBack } from "react-icons/io"
import DeliveryBoyTracking from "../components/DeliveryBoyTracking"
import OrderTimeline from "../components/OrderTimeline"
import { useSelector } from "react-redux"
import api from "../lib/api"
import ErrorState from "../components/ui/ErrorState"

// Haversine distance in km between two lat/lon points
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function TrackOrderPage() {
  const { orderId } = useParams()
  const [currentOrder, setCurrentOrder] = useState(null)
  const [failed, setFailed] = useState(false)
  const navigate = useNavigate()
  const { socket } = useSelector((state) => state.user)
  const [liveLocations, setLiveLocations] = useState({})

  const handleGetOrder = async () => {
    setFailed(false)
    try {
      const result = await api.get(`/api/order/get-order-by-id/${orderId}`)
      setCurrentOrder(result.data)
    } catch (error) {
      setFailed(true)
    }
  }

  // Live delivery-partner location over Socket.io (with proper cleanup)
  useEffect(() => {
    if (!socket) return
    const handler = ({ deliveryBoyId, latitude, longitude }) => {
      setLiveLocations((prev) => ({
        ...prev,
        [deliveryBoyId]: { lat: latitude, lon: longitude }
      }))
    }
    socket.on("updateDeliveryLocation", handler)
    return () => socket.off("updateDeliveryLocation", handler)
  }, [socket])

  useEffect(() => {
    handleGetOrder()
    window.scrollTo(0, 0)
  }, [orderId])

  // ETA estimate: straight-line distance ÷ avg scooter speed (25 km/h) + buffer
  const getEta = (shopOrder) => {
    if (!shopOrder?.assignedDeliveryBoy || shopOrder.status === "delivered") return null
    const boy = liveLocations[shopOrder.assignedDeliveryBoy._id]
    const boyPos = boy || {
      lat: shopOrder.assignedDeliveryBoy.location?.coordinates?.[1],
      lon: shopOrder.assignedDeliveryBoy.location?.coordinates?.[0]
    }
    if (!boyPos?.lat || !currentOrder?.deliveryAddress?.latitude) return null
    const km = haversineKm(
      boyPos.lat, boyPos.lon,
      currentOrder.deliveryAddress.latitude, currentOrder.deliveryAddress.longitude
    )
    const minutes = Math.max(1, Math.ceil((km / 25) * 60) + 2)
    return minutes <= 45 ? minutes : null
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pt-8 pb-16 flex flex-col gap-6 bg-cream min-h-screen">
      <div className="flex items-center gap-4 mb-1">
        <button
          aria-label="Go back"
          className="h-11 w-11 shrink-0 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] text-brand-600 hover:bg-brand-50 transition flex items-center justify-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <IoIosArrowRoundBack size={24} />
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900">Track Order</h1>
      </div>

      {failed ? (
        <ErrorState message="We couldn't load this order." onRetry={handleGetOrder} />
      ) : !currentOrder ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-black/[0.05] p-5 space-y-3">
              <div className="h-5 w-1/3 bg-gray-200/70 rounded" />
              <div className="h-4 w-2/3 bg-gray-200/70 rounded" />
              <div className="h-40 w-full bg-gray-200/70 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : (
        currentOrder.shopOrders?.map((shopOrder, index) => {
          const eta = getEta(shopOrder)
          return (
            <div className="bg-white p-5 rounded-3xl shadow-soft border border-black/[0.05] space-y-4 animate-fade-up" key={index}>
              {/* header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-extrabold tracking-tight text-brand-600">{shopOrder.shop?.name}</p>
                  <p className="mt-1 text-sm text-ink-700">
                    <span className="text-ink-400 font-medium">Items:</span>{" "}
                    {shopOrder.shopOrderItems?.map((i) => i.name).join(", ")}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-700"><span className="font-semibold">Subtotal:</span> ₹{shopOrder.subtotal}</p>
                  <p className="mt-0.5 text-sm text-ink-700"><span className="font-semibold">Delivery address:</span> {currentOrder.deliveryAddress?.text}</p>
                </div>
                {eta && (
                  <span className="shrink-0 inline-flex flex-col items-center rounded-2xl bg-brand-50 border border-brand-100 px-4 py-2.5 animate-fade-in">
                    <span className="text-xl font-extrabold text-brand-600 leading-none">{eta} min</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mt-1">ETA</span>
                  </span>
                )}
              </div>

              {/* timeline */}
              <OrderTimeline status={shopOrder.status} />

              {/* delivery partner info */}
              {shopOrder.status !== "delivered" && shopOrder.status !== "cancelled" && (
                <>
                  {shopOrder.assignedDeliveryBoy ? (
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3.5 text-sm text-ink-700 space-y-1">
                      <p><span className="font-semibold">Delivery Partner:</span> {shopOrder.assignedDeliveryBoy.fullName}</p>
                      <p><span className="font-semibold">Contact No.:</span> {shopOrder.assignedDeliveryBoy.mobile}</p>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-ink-400 bg-gray-50 rounded-xl p-3.5">
                      A delivery partner will be assigned soon.
                    </p>
                  )}
                </>
              )}

              {shopOrder.status === "cancelled" && (
                <p className="inline-block rounded-full bg-red-50 text-red-500 px-3.5 py-1 font-bold text-sm capitalize">
                  This order was cancelled
                </p>
              )}
              {shopOrder.status === "delivered" && (
                <p className="inline-block rounded-full bg-green-100 text-green-700 px-3.5 py-1 font-bold text-sm capitalize">
                  Delivered · Rate your food in My Orders
                </p>
              )}

              {/* live map */}
              {shopOrder.assignedDeliveryBoy && shopOrder.status === "out of delivery" && (
                <DeliveryBoyTracking
                  data={{
                    deliveryBoyLocation:
                      liveLocations[shopOrder.assignedDeliveryBoy._id] || {
                        lat: shopOrder.assignedDeliveryBoy.location?.coordinates?.[1],
                        lon: shopOrder.assignedDeliveryBoy.location?.coordinates?.[0]
                      },
                    customerLocation: {
                      lat: currentOrder.deliveryAddress.latitude,
                      lon: currentOrder.deliveryAddress.longitude
                    }
                  }}
                />
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export default TrackOrderPage