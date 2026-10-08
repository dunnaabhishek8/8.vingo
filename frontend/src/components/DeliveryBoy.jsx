import React from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../lib/api'
import { useEffect } from 'react'
import { useState } from 'react'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function DeliveryBoy() {
  const {userData,socket}=useSelector(state=>state.user)
  const [currentOrder,setCurrentOrder]=useState()
  const [showOtpBox,setShowOtpBox]=useState(false)
  const [availableAssignments,setAvailableAssignments]=useState(null)
  const [otp,setOtp]=useState("")
  const [todayDeliveries,setTodayDeliveries]=useState([])
const [deliveryBoyLocation,setDeliveryBoyLocation]=useState(null)
const [loading,setLoading]=useState(false)
const [message,setMessage]=useState("")



  useEffect(()=>{
if(!socket || userData.role!=="deliveryBoy") return
let watchId
if(navigator.geolocation){
watchId=navigator.geolocation.watchPosition((position)=>{
    const latitude=position.coords.latitude
    const longitude=position.coords.longitude
    setDeliveryBoyLocation({lat:latitude,lon:longitude})
    socket.emit('updateLocation',{
      latitude,
      longitude,
      userId:userData._id
    })
  }),
  (error)=>{
    console.log(error)
  },
  {
    enableHighAccuracy:true
  }
}

return ()=>{
  if(watchId)navigator.geolocation.clearWatch(watchId)
}

  },[socket,userData])


const ratePerDelivery=50
const totalEarning=todayDeliveries.reduce((sum,d)=>sum + d.count*ratePerDelivery,0)



  const getAssignments=async () => {
    try {
      const result=await axios.get(`${serverUrl}/api/order/get-assignments`,{withCredentials:true})

      setAvailableAssignments(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder=async () => {
     try {
      const result=await axios.get(`${serverUrl}/api/order/get-current-order`,{withCredentials:true})
    setCurrentOrder(result.data)
    } catch (error) {
      console.log(error)
    }
  }


  const acceptOrder=async (assignmentId) => {
    try {
      const result=await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`,{withCredentials:true})
    console.log(result.data)
    await getCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
  if (!socket) return

  socket.on('updateDeliveryLocation', (data) => {
    console.log("Received from backend:", data)

    // update only your own location
    if (data.deliveryBoyId === userData._id) {
      setDeliveryBoyLocation({
        lat: data.latitude,
        lon: data.longitude
      })
    }
  })

  return () => {
    socket.off('updateDeliveryLocation')
  }
}, [socket, userData])

  useEffect(()=>{
    socket.on('newAssignment',(data)=>{
      setAvailableAssignments(prev=>([...prev,data]))
    })
    return ()=>{
      socket.off('newAssignment')
    }
  },[socket])

  const sendOtp=async () => {
    setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/order/send-delivery-otp`,{
        orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id
      },{withCredentials:true})
      setLoading(false)
       setShowOtpBox(true)
    console.log(result.data)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }
   const verifyOtp=async () => {
    setMessage("")
    try {
      const result=await axios.post(`${serverUrl}/api/order/verify-delivery-otp`,{
        orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id,otp
      },{withCredentials:true})
    console.log(result.data)
    setMessage(result.data.message)
    location.reload()
    } catch (error) {
      console.log(error)
    }
  }


   const handleTodayDeliveries=async () => {

    try {
      const result=await axios.get(`${serverUrl}/api/order/get-today-deliveries`,{withCredentials:true})
    console.log(result.data)
   setTodayDeliveries(result.data)
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(()=>{
getAssignments()
getCurrentOrder()
handleTodayDeliveries()
  },[userData])
  return (
    <div className='w-screen min-h-screen flex flex-col gap-6 items-center bg-cream pb-16'>
      <Nav/>
      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center px-4'>

    <div className='w-full rounded-3xl bg-gradient-to-r from-brand-500 to-brand-600 text-white p-5 sm:p-6 shadow-lg shadow-brand-500/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-up'>
      <div>
        <h1 className='text-xl font-extrabold tracking-tight'>Welcome, {userData.fullName}</h1>
        <p className='text-white/80 text-sm mt-0.5'>You're on duty — live location sharing is active.</p>
      </div>
      <div className='flex flex-wrap gap-2 text-xs font-semibold'>
        <span className='rounded-full bg-white/15 backdrop-blur px-3 py-1.5'>Lat: {deliveryBoyLocation?.lat}</span>
        <span className='rounded-full bg-white/15 backdrop-blur px-3 py-1.5'>Lon: {deliveryBoyLocation?.lon}</span>
      </div>
    </div>

<div className='w-full bg-white rounded-3xl shadow-soft border border-black/[0.05] p-5'>
  <h1 className='text-base font-extrabold tracking-tight text-ink-900 mb-4 flex items-center gap-2'><span className='h-4 w-1 rounded-full bg-brand-500'></span>Today's Deliveries</h1>

  <ResponsiveContainer width="100%" height={200}>
   <BarChart data={todayDeliveries}>
  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0eae6"/>
  <XAxis dataKey="hour" tickFormatter={(h)=>`${h}:00`} tick={{fontSize:12,fill:"#948d9c"}} axisLine={false} tickLine={false}/>
    <YAxis allowDecimals={false} tick={{fontSize:12,fill:"#948d9c"}} axisLine={false} tickLine={false}/>
    <Tooltip formatter={(value)=>[value,"orders"]} labelFormatter={label=>`${label}:00`}/>
      <Bar dataKey="count" fill='#ff4d2d' radius={[6,6,0,0]}/>
   </BarChart>
  </ResponsiveContainer>

  <div className='mt-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-green-100 p-4 flex items-center justify-between'>
    <span className='text-sm font-semibold text-ink-700'>Today's Earning</span>
    <span className='text-2xl font-extrabold text-green-600'>₹{totalEarning}</span>
  </div>
</div>


{!currentOrder && <div className='w-full bg-white rounded-3xl shadow-soft border border-black/[0.05] p-5'>
<h1 className='text-base font-extrabold tracking-tight text-ink-900 mb-4 flex items-center gap-2'><span className='h-4 w-1 rounded-full bg-brand-500'></span>Available Orders</h1>

<div className='space-y-3'>
{availableAssignments?.length>0
?
(
availableAssignments.map((a,index)=>(
  <div className='rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-brand-200 transition-colors' key={index}>
   <div className='min-w-0'>
    <p className='font-bold text-ink-900'>{a?.shopName}</p>
    <p className='text-sm text-ink-500 mt-0.5'><span className='font-semibold'>Delivery Address:</span> {a?.deliveryAddress.text}</p>
<p className='text-xs text-ink-400 mt-0.5'>{a.items.length} items | ₹{a.subtotal}</p>
   </div>
   <button className='shrink-0 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-95 transition' onClick={()=>acceptOrder(a.assignmentId)}>Accept</button>

  </div>
))
):<p className='text-sm text-ink-400 bg-gray-50 rounded-xl p-4 text-center'>No Available Orders</p>}
</div>
</div>}

{currentOrder && <div className='w-full bg-white rounded-3xl shadow-soft border border-black/[0.05] p-5'>
<h2 className='text-base font-extrabold tracking-tight text-ink-900 mb-4 flex items-center gap-2'><span className='h-4 w-1 rounded-full bg-brand-500'></span>Current Order</h2>
<div className='rounded-2xl border border-gray-100 p-4 mb-3 bg-gray-50/60'>
  <p className='font-bold text-ink-900'>{currentOrder?.shopOrder.shop.name}</p>
  <p className='text-sm text-ink-500 mt-0.5'>{currentOrder.deliveryAddress.text}</p>
 <p className='text-xs text-ink-400 mt-0.5'>{currentOrder.shopOrder.shopOrderItems.length} items | ₹{currentOrder.shopOrder.subtotal}</p>
</div>

 <DeliveryBoyTracking data={{
  deliveryBoyLocation:deliveryBoyLocation || {
        lat: userData.location.coordinates[1],
        lon: userData.location.coordinates[0]
      },
      customerLocation: {
        lat: currentOrder.deliveryAddress.latitude,
        lon: currentOrder.deliveryAddress.longitude
      }}} />
{!showOtpBox ? <button className='mt-4 w-full h-11 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 hover:from-green-600 hover:to-green-700 active:scale-[0.98] transition flex items-center justify-center disabled:opacity-60' onClick={sendOtp} disabled={loading}>
{loading?<ClipLoader size={20} color='white'/> :"Mark As Delivered"}
 </button>:<div className='mt-4 p-4 rounded-2xl border border-gray-100 bg-gray-50 animate-fade-in'>
<p className='text-sm font-semibold text-ink-700 mb-2'>Enter OTP sent to <span className='text-brand-600'>{currentOrder.user.fullName}</span></p>
<input type="text" inputMode="numeric" className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 transition' placeholder='Enter OTP' onChange={(e)=>setOtp(e.target.value)} value={otp}/>
{message && <p className='text-center text-green-600 font-bold text-lg my-3 animate-scale-in'>{message}</p>}

<button className="mt-3 w-full h-11 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] transition" onClick={verifyOtp}>Submit OTP</button>
  </div>}

  </div>}


      </div>
    </div>
  )
}

export default DeliveryBoy