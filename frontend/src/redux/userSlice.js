import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
  currentCity: null,
  currentState: null,
  currentAddress: null,
  shopInMyCity: null,
  itemsInMyCity: null,
  cartItems: [],
  totalAmount: 0,
  myOrders: null, // null = loading, [] = loaded & empty
  searchItems: null,
  socket: null,
  favorites: []
}

const recalcTotal = (state) => {
  state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload
    },
    setShopsInMyCity: (state, action) => {
      state.shopInMyCity = action.payload
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload
    },
    setSocket: (state, action) => {
      state.socket = action.payload
    },

    // ---------- cart ----------
    addToCart: (state, action) => {
      const cartItem = action.payload
      const existingItem = state.cartItems.find(i => i.id == cartItem.id)
      if (existingItem) {
        existingItem.quantity += cartItem.quantity
      } else {
        state.cartItems.push(cartItem)
      }
      recalcTotal(state)
    },

    hydrateCart: (state, action) => {
      // Restore persisted cart after a page refresh
      if (Array.isArray(action.payload?.cartItems)) {
        state.cartItems = action.payload.cartItems
        recalcTotal(state)
      }
    },

    clearCart: (state) => {
      state.cartItems = []
      state.totalAmount = 0
    },

    // Sync cart with fresh server prices/availability at checkout
    setCartFromServer: (state, action) => {
      const lines = Array.isArray(action.payload) ? action.payload : []
      state.cartItems = lines
        .filter(l => l.exists !== false && l.isAvailable !== false)
        .map(({ exists, changed, isAvailable, ...rest }) => rest)
      recalcTotal(state)
    },

    setTotalAmount: (state, action) => {
      state.totalAmount = action.payload
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.cartItems.find(i => i.id == id)
      if (item) {
        item.quantity = quantity
      }
      recalcTotal(state)
    },

    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter(i => i.id !== action.payload)
      recalcTotal(state)
    },

    // ---------- orders ----------
    setMyOrders: (state, action) => {
      state.myOrders = action.payload
    },
    addMyOrder: (state, action) => {
      if (!Array.isArray(state.myOrders)) state.myOrders = []
      state.myOrders = [action.payload, ...state.myOrders]
    },
    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload
      const order = state.myOrders?.find(o => o._id == orderId)
      if (order) {
        if (order.shopOrders && order.shopOrders.shop && order.shopOrders.shop._id == shopId) {
          order.shopOrders.status = status
        }
      }
    },
    updateRealtimeOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload
      const order = state.myOrders?.find(o => o._id == orderId)
      if (order) {
        const shopOrder = order.shopOrders?.find?.(so => so.shop?._id == shopId)
        if (shopOrder) {
          shopOrder.status = status
        }
      }
    },
    cancelOrderLocal: (state, action) => {
      const orderId = action.payload
      const order = state.myOrders?.find(o => String(o._id) === String(orderId))
      if (!order) return
      if (Array.isArray(order.shopOrders)) {
        order.shopOrders.forEach(so => { so.status = "cancelled" })
      } else if (order.shopOrders) {
        order.shopOrders.status = "cancelled"
      }
    },

    setSearchItems: (state, action) => {
      state.searchItems = action.payload
    },

    // ---------- favorites ----------
    setFavorites: (state, action) => {
      state.favorites = Array.isArray(action.payload) ? action.payload : []
    },
    // Accepts a full item object (to add) or an id (to remove)
    toggleFavoriteLocal: (state, action) => {
      const payload = action.payload
      const id = typeof payload === "object" ? payload._id : payload
      const idx = state.favorites.findIndex(f => String(f._id) === String(id))
      if (idx >= 0) {
        state.favorites.splice(idx, 1)
      } else if (typeof payload === "object") {
        state.favorites.unshift(payload)
      }
    }
  }
})

export const {
  setUserData, setCurrentAddress, setCurrentCity, setCurrentState,
  setShopsInMyCity, setItemsInMyCity, addToCart, updateQuantity,
  removeCartItem, setMyOrders, addMyOrder, updateOrderStatus,
  setSearchItems, setTotalAmount, setSocket, updateRealtimeOrderStatus,
  hydrateCart, clearCart, setCartFromServer, cancelOrderLocal,
  setFavorites, toggleFavoriteLocal
} = userSlice.actions

export default userSlice.reducer