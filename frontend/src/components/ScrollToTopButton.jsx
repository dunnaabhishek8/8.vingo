import React, { useEffect, useState } from "react"
import { FaArrowUpLong } from "react-icons/fa6"

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 left-5 z-[9990] h-11 w-11 rounded-full bg-white shadow-card ring-1 ring-black/[0.06] text-brand-600 hover:bg-brand-50 hover:-translate-y-0.5 transition-all flex items-center justify-center animate-scale-in"
    >
      <FaArrowUpLong size={16} />
    </button>
  )
}