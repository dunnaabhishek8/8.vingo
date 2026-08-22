import axios from 'axios';
import React from 'react'
import { MdPhone } from "react-icons/md";
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../redux/userSlice';
import { useState } from 'react';
import { useEffect } from 'react';
function OwnerOrderCard({ data }) {
    const [availableBoys,setAvailableBoys]=useState([])
const dispatch=useDispatch()
    const handleUpdateStatus=async (orderId,shopId,status) => {
        try {
            const result=await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`,{status},{withCredentials:true})
             dispatch(updateOrderStatus({orderId,shopId,status}))
             setAvailableBoys(result.data.availableBoys)
             console.log(result.data)
        } catch (error) {
            console.log(error)
        }
    }



    return (
        <div className='bg-white rounded-2xl shadow-soft border border-black/[0.05] p-4 sm:p-5 space-y-4'>
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
                <div>
                    <h2 className='text-lg font-bold text-ink-900'>{data.user.fullName}</h2>
                    <p className='text-sm text-ink-500'>{data.user.email}</p>
                    <p className='flex items-center gap-2 text-sm text-ink-700 mt-1.5'><span className='h-7 w-7 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center'><MdPhone size={14}/></span><span>{data.user.mobile}</span></p>
                    {data.paymentMethod=="online"?<p className='mt-1.5 text-sm text-ink-500'>Payment: <span className={data.payment?"font-semibold text-green-600":"font-semibold text-red-500"}>{data.payment?"Paid":"Pending"}</span></p>:<p className='mt-1.5 text-sm text-ink-500'>Payment Method: <span className='font-semibold text-ink-700 uppercase'>{data.paymentMethod}</span></p>}

                </div>

                <div className='flex items-start flex-col gap-1.5 text-ink-700 text-sm bg-gray-50 rounded-xl p-3 sm:max-w-[55%]'>
                    <p className='font-medium'>{data?.deliveryAddress?.text}</p>
                    <p className='text-xs text-ink-400'>Lat: {data?.deliveryAddress.latitude} , Lon {data?.deliveryAddress.longitude}</p>
                </div>
            </div>

            <div className='flex space-x-3 overflow-x-auto no-scrollbar pb-1'>
                {data.shopOrders.shopOrderItems.map((item, index) => (
                    <div key={index} className='flex-shrink-0 w-36 rounded-xl border border-black/[0.05] p-2 bg-white shadow-sm'>
                        <img src={item.item.image} alt={item.name} className='w-full h-24 object-cover rounded-lg' />
                        <p className='text-sm font-semibold mt-1.5 truncate'>{item.name}</p>
                        <p className='text-xs text-ink-500'>Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                ))}
            </div>

<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-auto pt-3 border-t border-gray-100'>
<span className='text-sm text-ink-500'>Status: <span className='inline-block rounded-full bg-brand-50 text-brand-600 px-2.5 py-0.5 text-xs font-bold capitalize'>{data.shopOrders.status}</span>
</span>

<select aria-label="Update order status" className='rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-400 transition cursor-pointer' onChange={(e)=>handleUpdateStatus(data._id,data.shopOrders.shop._id,e.target.value)}>
    <option value="">Change</option>
<option value="pending">Pending</option>
<option value="preparing">Preparing</option>
<option value="out of delivery">Out Of Delivery</option>
</select>

</div>

{data.shopOrders.status=="out of delivery" &&
<div className="mt-1 p-3 rounded-xl border border-brand-100 bg-brand-50/60 text-sm space-y-1.5">
    <p className='font-semibold text-ink-700'>{data.shopOrders.assignedDeliveryBoy?"Assigned Delivery Boy:":"Available Delivery Boys:"}</p>
   {availableBoys?.length>0?(
     availableBoys.map((b,index)=>(
        <div key={index} className='text-ink-700'><span className='font-medium'>{b.fullName}</span> · {b.mobile}</div>
     ))
   ):data.shopOrders.assignedDeliveryBoy?<div className='text-ink-700'><span className='font-medium'>{data.shopOrders.assignedDeliveryBoy.fullName}</span> · {data.shopOrders.assignedDeliveryBoy.mobile}</div>:<div className='text-ink-400'>Waiting for delivery boy to accept…</div>}
</div>}

<div className='text-right font-extrabold text-ink-900 text-base'>
 Total: ₹{data.shopOrders.subtotal}
</div>
        </div>
    )
}

export default OwnerOrderCard