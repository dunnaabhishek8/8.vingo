import React from 'react'
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
function OrderPlaced() {
    const navigate=useNavigate()
  return (
    <div className='min-h-screen bg-cream flex flex-col justify-center items-center px-4 text-center'>
      <div className='h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-scale-in'>
        <FaCircleCheck className='text-green-500 text-6xl'/>
      </div>
      <h1 className='text-3xl font-extrabold tracking-tight text-ink-900 mb-2'>Order Placed!
      </h1>
      <p className='text-ink-500 max-w-md mb-8 leading-relaxed'>Thank you for your purchase. Your order is being prepared.
        You can track your order status in the "My Orders" section.
     </p>
     <button className='bg-gradient-to-r from-brand-500 to-brand-600 text-white px-7 py-3 rounded-2xl font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] transition' onClick={()=>navigate("/my-orders")}>Back to My Orders</button>
    </div>
  )
}

export default OrderPlaced