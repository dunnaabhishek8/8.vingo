import axios from 'axios'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'
import { useSelector } from 'react-redux'
function TrackOrderPage() {
    const { orderId } = useParams()
    const [currentOrder, setCurrentOrder] = useState()
    const navigate = useNavigate()
    const {socket}=useSelector(state=>state.user)
    const [liveLocations,setLiveLocations]=useState({})
    const handleGetOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true })
            setCurrentOrder(result.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
socket.on('updateDeliveryLocation',({deliveryBoyId,latitude,longitude})=>{
setLiveLocations(prev=>({
  ...prev,
  [deliveryBoyId]:{lat:latitude,lon:longitude}
}))
})
    },[socket])

    useEffect(() => {
        handleGetOrder()
    }, [orderId])
    return (
        <div className='max-w-4xl mx-auto p-4 sm:p-6 pt-8 flex flex-col gap-6 bg-cream min-h-screen'>
            <div className='flex items-center gap-4 mb-1'>
                <button aria-label="Go back" className='h-11 w-11 shrink-0 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] text-brand-600 hover:bg-brand-50 transition flex items-center justify-center cursor-pointer' onClick={() => navigate("/")}>
                    <IoIosArrowRoundBack size={24} />
                </button>
                <h1 className='text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900'>Track Order</h1>
            </div>
      {currentOrder?.shopOrders?.map((shopOrder,index)=>(
        <div className='bg-white p-5 rounded-3xl shadow-soft border border-black/[0.05] space-y-4 animate-fade-up' key={index}>
         <div>
            <p className='text-lg font-extrabold tracking-tight text-brand-600 mb-2'>{shopOrder.shop.name}</p>
            <p className='font-semibold text-ink-900'><span className='text-ink-400 font-medium'>Items:</span> {shopOrder.shopOrderItems?.map(i=>i.name).join(", ")}</p>
            <p className='mt-1 text-sm text-ink-700'><span className='font-semibold'>Subtotal:</span> ₹{shopOrder.subtotal}</p>
            <p className='mt-1 text-sm text-ink-700'><span className='font-semibold'>Delivery address:</span> {currentOrder.deliveryAddress?.text}</p>
         </div>
         {shopOrder.status!="delivered"?<>
{shopOrder.assignedDeliveryBoy?
<div className='rounded-2xl bg-gray-50 border border-gray-100 p-3.5 text-sm text-ink-700 space-y-1'>
<p><span className='font-semibold'>Delivery Boy Name:</span> {shopOrder.assignedDeliveryBoy.fullName}</p>
<p><span className='font-semibold'>Contact No.:</span> {shopOrder.assignedDeliveryBoy.mobile}</p>
</div>:<p className='text-sm font-medium text-ink-400 bg-gray-50 rounded-xl p-3.5'>Delivery Boy is not assigned yet.</p>}
         </>:<p className='inline-block rounded-full bg-green-100 text-green-700 px-3.5 py-1 font-bold text-sm capitalize'>Delivered</p>}

{(shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered") && (
  <DeliveryBoyTracking data={{
      deliveryBoyLocation:liveLocations[shopOrder.assignedDeliveryBoy._id] || {
        lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
        lon: shopOrder.assignedDeliveryBoy.location.coordinates[0]
      },
      customerLocation: {
        lat: currentOrder.deliveryAddress.latitude,
        lon: currentOrder.deliveryAddress.longitude
      }
    }} />
)}



        </div>
      ))}



        </div>
    )
}

export default TrackOrderPage