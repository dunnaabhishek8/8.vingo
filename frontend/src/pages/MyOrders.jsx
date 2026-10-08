import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { IoIosArrowRoundBack } from "react-icons/io"
import { TbReceipt2 } from "react-icons/tb"
import { useNavigate } from "react-router-dom"
import UserOrderCard from "../components/UserOrderCard"
import OwnerOrderCard from "../components/OwnerOrderCard"
import DeliveryOrderCard from "../components/DeliveryOrderCard"
import { setMyOrders, updateRealtimeOrderStatus } from "../redux/userSlice"
import api from "../lib/api"
import { RowsSkeleton } from "../components/ui/Skeletons"
import EmptyState from "../components/ui/EmptyState"

const STATUS_FILTERS = ["all", "pending", "preparing", "out of delivery", "delivered", "cancelled"]

function MyOrders() {
  const { userData, myOrders, socket } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [statusFilter, setStatusFilter] = useState("all")

  // Real-time order events
  useEffect(() => {
    if (!socket || !userData) return

    const onNewOrder = (data) => {
      if (userData.role === "owner" && data.shopOrders?.owner?._id === userData._id) {
        dispatch(setMyOrders((myOrders || []).length >= 0 ? [data, ...(myOrders || [])] : [data]))
      }
    }
    const onStatusUpdate = ({ orderId, shopId, status, userId }) => {
      if (userId === userData._id) {
        dispatch(updateRealtimeOrderStatus({ orderId, shopId, status }))
      }
    }

    socket.on("newOrder", onNewOrder)
    socket.on("update-status", onStatusUpdate)

    return () => {
      socket.off("newOrder", onNewOrder)
      socket.off("update-status", onStatusUpdate)
    }
  }, [socket, userData])

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(myOrders)) return null
    if (statusFilter === "all") return myOrders
    return myOrders.filter((order) => {
      if (Array.isArray(order.shopOrders)) {
        return order.shopOrders.some((so) => so.status === statusFilter)
      }
      return order.shopOrders?.status === statusFilter
    })
  }, [myOrders, statusFilter])

  const isLoading = myOrders === null
  const isOwner = userData?.role === "owner"
  const isDeliveryPartner = userData?.role === "deliveryBoy"

  return (
    <div className="w-full min-h-screen bg-cream flex justify-center px-4 py-8">
      <div className="w-full max-w-[800px]">
        <div className="flex items-center gap-4 mb-6">
          <button
            aria-label="Go back"
            className="h-11 w-11 shrink-0 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] text-brand-600 hover:bg-brand-50 transition flex items-center justify-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <IoIosArrowRoundBack size={24} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900">My Orders</h1>
        </div>

        {/* status filter */}
        {!isLoading && Array.isArray(myOrders) && myOrders.length > 0 && (
          <div className="w-full flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`shrink-0 px-4 h-9 rounded-full text-sm font-bold capitalize transition ${
                  statusFilter === s
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
                    : "bg-white border border-gray-200 text-ink-600 hover:border-brand-300 hover:text-brand-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <RowsSkeleton count={3} />
        ) : filteredOrders && filteredOrders.length > 0 ? (
          <div className="space-y-5">
            {filteredOrders.map((order, index) =>
              userData.role === "user" ? (
                <UserOrderCard data={order} key={index} />
              ) : isOwner ? (
                <OwnerOrderCard data={order} key={index} />
              ) : isDeliveryPartner ? (
                <DeliveryOrderCard data={order} key={index} />
              ) : null
            )}
          </div>
        ) : (
          <EmptyState
            icon={<TbReceipt2 size={26} />}
            title={statusFilter === "all" ? (isDeliveryPartner ? "No deliveries yet" : "No orders yet") : `No ${statusFilter} orders`}
            subtitle={
              statusFilter === "all"
                ? (isDeliveryPartner
                    ? "When you accept a delivery request it will appear here."
                    : "When you place your first order it will show up here.")
                : "Try a different filter to see more of your orders."
            }
            action={
              statusFilter === "all" ? (
                <button
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 transition"
                >
                  Order Food
                </button>
              ) : (
                <button
                  onClick={() => setStatusFilter("all")}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-50 text-brand-600 hover:bg-brand-100 transition"
                >
                  Show All Orders
                </button>
              )
            }
          />
        )}
      </div>
    </div>
  )
}

export default MyOrders