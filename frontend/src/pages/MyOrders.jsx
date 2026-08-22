import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { setMyOrders, updateOrderStatus, updateRealtimeOrderStatus } from '../redux/userSlice';


function MyOrders() {
  const { userData, myOrders,socket} = useSelector(state => state.user)
  const navigate = useNavigate()
const dispatch=useDispatch()
  useEffect(()=>{
socket?.on('newOrder',(data)=>{
if(data.shopOrders?.owner._id==userData._id){
dispatch(setMyOrders([data,...myOrders]))
}
})

socket?.on('update-status',({orderId,shopId,status,userId})=>{
if(userId==userData._id){
  dispatch(updateRealtimeOrderStatus({orderId,shopId,status}))
}
})

return ()=>{
  socket?.off('newOrder')
  socket?.off('update-status')
}
  },[socket])



  return (
    <div className='w-full min-h-screen bg-cream flex justify-center px-4 py-8'>
      <div className='w-full max-w-[800px]'>

        <div className='flex items-center gap-4 mb-6'>
          <button aria-label="Go back" className='h-11 w-11 shrink-0 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] text-brand-600 hover:bg-brand-50 transition flex items-center justify-center cursor-pointer' onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={24} />
          </button>
          <h1 className='text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900'>My Orders</h1>
        </div>

        {myOrders && myOrders.length>0 ?
        <div className='space-y-5'>
          {myOrders.map((order,index)=>(
            userData.role=="user" ?
            (
              <UserOrderCard data={order} key={index}/>
            )
            :
            userData.role=="owner"? (
              <OwnerOrderCard data={order} key={index}/>
            )
            :
            null
          ))}
        </div>
        :
        <div className='rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center animate-fade-up'>
          <div className='mx-auto mb-4 h-16 w-16 rounded-2xl bg-gray-50 text-ink-400 flex items-center justify-center'>
            <TbReceipt2 size={26}/>
          </div>
          <p className='text-ink-500 font-medium'>No orders yet</p>
        </div>}
      </div>
    </div>
  )
}

export default MyOrders