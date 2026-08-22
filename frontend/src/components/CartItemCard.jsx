import React from 'react'
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';
function CartItemCard({data}) {
    const dispatch=useDispatch()
    const handleIncrease=(id,currentQty)=>{
       dispatch(updateQuantity({id,quantity:currentQty+1}))
    }
      const handleDecrease=(id,currentQty)=>{
        if(currentQty>1){
  dispatch(updateQuantity({id,quantity:currentQty-1}))
        }

    }
  return (
    <div className='flex items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl shadow-soft border border-black/[0.05]'>
      <div className='flex items-center gap-4 min-w-0'>
        <img src={data.image} alt="" className='w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl ring-1 ring-black/[0.06] shrink-0'/>
        <div className='min-w-0'>
            <h1 className='font-bold text-ink-900 truncate'>{data.name}</h1>
            <p className='text-sm text-ink-500'>₹{data.price} × {data.quantity}</p>
            <p className="font-extrabold text-ink-900">₹{data.price*data.quantity}</p>
        </div>
      </div>
      <div className='flex items-center gap-2 shrink-0'>
        <div className='flex items-center rounded-full border border-gray-200 overflow-hidden bg-white'>
          <button aria-label="Decrease" className='p-2.5 text-ink-700 hover:bg-gray-50 transition' onClick={()=>handleDecrease(data.id,data.quantity)}>
          <FaMinus size={11}/>
          </button>
          <span className='w-6 text-center text-sm font-bold'>{data.quantity}</span>
          <button aria-label="Increase" className='p-2.5 text-ink-700 hover:bg-gray-50 transition'  onClick={()=>handleIncrease(data.id,data.quantity)}>
          <FaPlus size={11}/>
          </button>
        </div>
        <button aria-label="Remove item" className="p-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition"
 onClick={()=>dispatch(removeCartItem(data.id))}>
<CiTrash size={17}/>
        </button>
      </div>
    </div>
  )
}

export default CartItemCard