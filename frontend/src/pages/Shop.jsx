import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useNavigate, useParams } from 'react-router-dom'
import { FaStore } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { FaUtensils } from "react-icons/fa";
import FoodCard from '../components/FoodCard';
import { FaArrowLeft } from "react-icons/fa";
function Shop() {
    const {shopId}=useParams()
    const [items,setItems]=useState([])
    const [shop,setShop]=useState([])
    const navigate=useNavigate()
    const handleShop=async () => {
        try {
           const result=await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`,{withCredentials:true})
           setShop(result.data.shop)
           setItems(result.data.items)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
handleShop()
    },[shopId])
  return (
    <div className='min-h-screen bg-cream'>
        <button aria-label="Go back" className='fixed top-5 left-5 z-20 flex items-center gap-2 bg-black/45 hover:bg-black/60 backdrop-blur text-white px-4 py-2.5 rounded-full shadow-lg transition cursor-pointer' onClick={()=>navigate("/")}>
        <FaArrowLeft size={14}/>
<span className='text-sm font-semibold'>Back</span>
        </button>
      {shop && <div className='relative w-full h-64 md:h-80 lg:h-96'>
          <img src={shop.image} alt={shop.name} className='w-full h-full object-cover'/>
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 flex flex-col justify-end items-center text-center px-4 pb-10 md:pb-14'>
          <span className='inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-white text-xs font-bold uppercase tracking-wider mb-3'>
            <FaStore size={13}/> Restaurant
          </span>
          <h1 className='text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg'>{shop.name}</h1>
          <div className='flex items-center gap-[10px] mt-3'>
          <FaLocationDot size={18} className="text-brand-400"/>
             <p className='text-base md:text-lg font-medium text-white/85'>{shop.address}</p>
             </div>
          </div>

        </div>}

<div className='max-w-7xl mx-auto px-4 sm:px-6 py-10'>
<h2 className='flex items-center justify-center gap-3 mb-9'>
  <span className='h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center'><FaUtensils size={17}/></span>
  <span className='text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900'>Our Menu</span>
</h2>

{items.length>0?(
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'>
        {items.map((item)=>(
            <FoodCard data={item} key={item._id}/>
        ))}
    </div>
):<div className='max-w-md mx-auto rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center'>
    <div className='mx-auto mb-4 h-16 w-16 rounded-2xl bg-gray-50 text-ink-400 flex items-center justify-center'>
      <FaUtensils size={24}/>
    </div>
    <p className='text-ink-500 font-medium'>No Items Available</p>
  </div>}
</div>



    </div>
  )
}

export default Shop