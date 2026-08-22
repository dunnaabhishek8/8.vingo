import React, { useState } from 'react'
import { FaLeaf } from "react-icons/fa";
import { FaDrumstickBite } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';

function FoodCard({data}) {
const [quantity,setQuantity]=useState(0)
const dispatch=useDispatch()
const {cartItems}=useSelector(state=>state.user)

const handleIncrease=()=>{
    const newQty=quantity+1
    setQuantity(newQty)
}
const handleDecrease=()=>{
    if(quantity>0){
const newQty=quantity-1
    setQuantity(newQty)
    }

}

  return (
    <div className='group w-[250px] rounded-2xl bg-white border border-black/[0.05] shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col'>
      <div className='relative w-full h-[170px] overflow-hidden'>
        <img src={data.image} alt={data.name} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'/>

        <div className='absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full px-2 py-1 shadow-sm flex items-center gap-1.5'>
          {data.foodType=="veg"
            ? <FaLeaf className='text-green-600 text-xs'/>
            : <FaDrumstickBite className='text-red-500 text-xs'/>}
          <span className='text-[10px] font-bold uppercase tracking-wide text-ink-700'>{data.foodType}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-1.5">
        <h1 className='font-bold text-ink-900 text-[15px] leading-snug line-clamp-1'>{data.name}</h1>

        <div className='flex items-center gap-1.5'>
          <span className='inline-flex items-center gap-1 rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-bold text-green-700'>
            <FaStar className='text-[10px]'/>
            {Number(data.rating?.average || 0).toFixed(1)}
          </span>
          <span className='text-xs text-ink-400'>({data.rating?.count || 0})</span>
        </div>
      </div>

      <div className='flex items-center justify-between px-4 pb-4 mt-auto'>
        <span className='font-extrabold text-ink-900 text-lg'>
          ₹{data.price}
        </span>

        <div className='flex items-center rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden'>
          <button aria-label="Decrease quantity" disabled={quantity===0} className='px-2.5 py-2 text-ink-700 hover:bg-gray-50 disabled:opacity-40 transition' onClick={handleDecrease}>
            <FaMinus size={11}/>
          </button>
          <span className='w-6 text-center text-sm font-bold'>{quantity}</span>
          <button aria-label="Increase quantity" className='px-2.5 py-2 text-ink-700 hover:bg-gray-50 transition' onClick={handleIncrease}>
            <FaPlus size={11}/>
          </button>
          <button aria-label="Add to cart" className={`${cartItems.some(i=>i.id==data._id)?"bg-ink-900":"bg-brand-500"} text-white px-3 py-2.5 transition-colors hover:opacity-90`}  onClick={()=>{
    quantity>0?dispatch(addToCart({
          id:data._id,
          name:data.name,
          price:data.price,
          image:data.image,
          shop:data.shop,
          quantity,
          foodType:data.foodType
})):null}}>
            <FaShoppingCart size={15}/>
          </button>
        </div>
      </div>

    </div>
  )
}

export default FoodCard