import { configureStore } from "@reduxjs/toolkit";
import userSlice, { hydrateCart } from "./userSlice"
import ownerSlice from "./ownerSlice"
import mapSlice from "./mapSlice"

export const store = configureStore({
  reducer: {
    user: userSlice,
    owner: ownerSlice,
    map: mapSlice
  }
})

// ---------- Persistent cart (survives page refresh) ----------
const CART_KEY = "vingo_cart_v1"

try {
  const saved = JSON.parse(localStorage.getItem(CART_KEY))
  if (saved && Array.isArray(saved.cartItems) && saved.cartItems.length > 0) {
    store.dispatch(hydrateCart(saved))
  }
} catch {
  /* corrupted storage — start fresh */
}

let persistTimer
store.subscribe(() => {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    try {
      const { cartItems, totalAmount } = store.getState().user
      localStorage.setItem(CART_KEY, JSON.stringify({ cartItems, totalAmount }))
    } catch {
      /* storage unavailable */
    }
  }, 250)
})