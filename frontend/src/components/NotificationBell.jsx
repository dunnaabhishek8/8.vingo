import React, { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import api from "../lib/api"
import { IoNotifications, IoNotificationsOutline } from "react-icons/io5"
import { RxCross2 } from "react-icons/rx"
import { FaCircleCheck, FaBowlFood, FaMotorcycle, FaTag } from "react-icons/fa6"

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const TYPE_ICON = {
  order: <FaBowlFood size={14} />,
  delivery: <FaMotorcycle size={14} />,
  success: <FaCircleCheck size={14} />,
  info: <FaTag size={14} />
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const navigate = useNavigate()
  const socket = useSelector((state) => state.user.socket)

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/api/notification/my")
      setItems(data.notifications || [])
      setUnread(data.unreadCount || 0)
    } catch {
      /* silent — bell is non-critical */
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Live updates over Socket.io
  useEffect(() => {
    if (!socket) return
    const handler = (n) => {
      setItems((prev) => [n, ...prev].slice(0, 30))
      setUnread((u) => u + 1)
    }
    socket.on("notification", handler)
    return () => socket.off("notification", handler)
  }, [socket])

  const markAllRead = async () => {
    try {
      await api.post("/api/notification/mark-read", { all: true })
      setUnread(0)
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      /* ignore */
    }
  }

  const openNotification = async (n) => {
    setOpen(false)
    if (!n.read) {
      try {
        await api.post("/api/notification/mark-read", { ids: [n._id] })
        setUnread((u) => Math.max(0, u - 1))
        setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)))
      } catch {
        /* ignore */
      }
    }
    if (n.orderId) navigate("/my-orders")
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-[9997]" onClick={() => setOpen(false)} />}

      <button
        aria-label="Notifications"
        onClick={() => setOpen((p) => !p)}
        className="relative h-10 w-10 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] flex items-center justify-center text-ink-700 hover:text-brand-600 hover:bg-brand-50 transition"
      >
        {unread > 0 ? <IoNotifications size={19} /> : <IoNotificationsOutline size={19} />}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed top-[88px] right-4 md:right-[70px] z-[9999] w-[min(92vw,350px)] bg-white rounded-2xl shadow-pop border border-black/[0.06] overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-extrabold tracking-tight text-ink-900 text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs font-bold text-brand-600 hover:text-brand-700">
                  Mark all read
                </button>
              )}
              <button aria-label="Close notifications" onClick={() => setOpen(false)} className="text-ink-400 hover:text-ink-700">
                <RxCross2 size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-gray-50 text-ink-400 flex items-center justify-center">
                  <IoNotificationsOutline size={22} />
                </div>
                <p className="text-sm text-ink-400 font-medium">No notifications yet</p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => openNotification(n)}
                  className={`w-full text-left flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition ${
                    n.read ? "" : "bg-brand-50/40"
                  }`}
                >
                  <span className={`mt-0.5 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${n.read ? "bg-gray-100 text-ink-500" : "bg-brand-100 text-brand-600"}`}>
                    {TYPE_ICON[n.type] || TYPE_ICON.info}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-ink-900 truncate">{n.title}</span>
                    <span className="block text-xs text-ink-500 line-clamp-2">{n.message}</span>
                    <span className="block text-[10px] text-ink-400 mt-0.5">{timeAgo(n.createdAt)}</span>
                  </span>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </>
  )
}