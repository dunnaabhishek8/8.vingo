import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { FaCircleCheck, FaCircleExclamation, FaCircleInfo } from "react-icons/fa6"
import { RxCross2 } from "react-icons/rx"

const ToastCtx = createContext(null)
let idCounter = 0

const ICONS = {
  success: <FaCircleCheck className="text-green-500" />,
  error: <FaCircleExclamation className="text-red-500" />,
  info: <FaCircleInfo className="text-brand-500" />
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const push = useCallback(({ type = "info", message, duration = 3500 }) => {
    const id = ++idCounter
    setToasts((prev) => [...prev.slice(-3), { id, type, message }])
    timers.current[id] = setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  // Global network-error listener (fired by lib/api interceptor)
  useEffect(() => {
    const onNetworkError = () =>
      push({ type: "error", message: "You appear to be offline. Please check your connection." })
    window.addEventListener("app:network-error", onNetworkError)
    return () => window.removeEventListener("app:network-error", onNetworkError)
  }, [push])

  const toast = useMemo(() => {
    const fn = (message, type = "info") => push({ type, message })
    fn.success = (message) => push({ type: "success", message })
    fn.error = (message) => push({ type: "error", message })
    fn.info = (message) => push({ type: "info", message })
    return fn
  }, [push])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[10001] flex flex-col gap-2 w-[min(92vw,360px)] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 bg-white rounded-xl shadow-pop border p-3.5 animate-scale-in ${
              t.type === "error" ? "border-red-100" : t.type === "success" ? "border-green-100" : "border-black/[0.06]"
            }`}
          >
            <span className="mt-0.5 shrink-0">{ICONS[t.type] || ICONS.info}</span>
            <p className="flex-1 text-sm font-medium text-ink-900">{t.message}</p>
            <button aria-label="Dismiss" onClick={() => dismiss(t.id)} className="text-ink-400 hover:text-ink-700 shrink-0">
              <RxCross2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)