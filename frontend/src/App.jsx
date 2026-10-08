import React, { Suspense, lazy, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import useGetCity from './hooks/useGetCity'
import useGetMyshop from './hooks/useGetMyShop'
import useGetShopByCity from './hooks/useGetShopByCity'
import useGetItemsByCity from './hooks/useGetItemsByCity'
import useGetMyOrders from './hooks/useGetMyOrders'
import useUpdateLocation from './hooks/useUpdateLocation'
import { setSocket } from './redux/userSlice'
import { io } from 'socket.io-client'
import { serverUrl } from './lib/api'
import { ToastProvider } from './components/ui/Toast'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy-loaded pages — smaller initial bundle, faster first paint
const SignUp = lazy(() => import('./pages/SignUp'))
const SignIn = lazy(() => import('./pages/SignIn'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const CreateEditShop = lazy(() => import('./pages/CreateEditShop'))
const AddItem = lazy(() => import('./pages/AddItem'))
const EditItem = lazy(() => import('./pages/EditItem'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckOut = lazy(() => import('./pages/CheckOut'))
const OrderPlaced = lazy(() => import('./pages/OrderPlaced'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'))
const Shop = lazy(() => import('./pages/Shop'))
const ItemDetail = lazy(() => import('./pages/ItemDetail'))
const Favorites = lazy(() => import('./pages/Favorites'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Full-screen loader shown while a lazy page chunk downloads
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="h-10 w-10 rounded-full border-[3px] border-brand-100 border-t-brand-500 animate-spin" />
        <span className="text-xs font-semibold text-ink-400">Loading…</span>
      </div>
    </div>
  )
}

// Reset scroll position on every route change
function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  useGetCurrentUser()
  useUpdateLocation()
  useGetCity()
  useGetMyshop()
  useGetShopByCity()
  useGetItemsByCity()
  useGetMyOrders()

  useEffect(() => {
    const socketInstance = io(serverUrl, { withCredentials: true })
    dispatch(setSocket(socketInstance))
    socketInstance.on('connect', () => {
      if (userData) {
        socketInstance.emit('identity', { userId: userData._id })
      }
    })
    return () => {
      socketInstance.disconnect()
    }
  }, [userData?._id])

  return (
    <ErrorBoundary>
      <ToastProvider>
        <ScrollToTopOnRouteChange />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to={"/"} />} />
            <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to={"/"} />} />
            <Route path='/forgot-password' element={!userData ? <ForgotPassword /> : <Navigate to={"/"} />} />
            <Route path='/' element={userData ? <Home /> : <Navigate to={"/signin"} />} />
            <Route path='/create-edit-shop' element={userData ? <CreateEditShop /> : <Navigate to={"/signin"} />} />
            <Route path='/add-item' element={userData ? <AddItem /> : <Navigate to={"/signin"} />} />
            <Route path='/edit-item/:itemId' element={userData ? <EditItem /> : <Navigate to={"/signin"} />} />
            <Route path='/cart' element={userData ? <CartPage /> : <Navigate to={"/signin"} />} />
            <Route path='/checkout' element={userData ? <CheckOut /> : <Navigate to={"/signin"} />} />
            <Route path='/order-placed' element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />} />
            <Route path='/my-orders' element={userData ? <MyOrders /> : <Navigate to={"/signin"} />} />
            <Route path='/track-order/:orderId' element={userData ? <TrackOrderPage /> : <Navigate to={"/signin"} />} />
            <Route path='/shop/:shopId' element={userData ? <Shop /> : <Navigate to={"/signin"} />} />
            <Route path='/item/:itemId' element={userData ? <ItemDetail /> : <Navigate to={"/signin"} />} />
            <Route path='/favorites' element={userData ? <Favorites /> : <Navigate to={"/signin"} />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App