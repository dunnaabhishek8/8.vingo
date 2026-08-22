import React from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaPen } from "react-icons/fa";
import OwnerItemCard from './OwnerItemCard';
function OwnerDashboard() {
  const { myShopData } = useSelector(state => state.owner)
  const navigate = useNavigate()


  return (
    <div className='w-full min-h-screen bg-cream flex flex-col items-center pb-16'>
      <Nav />
      {!myShopData &&
        <div className='flex justify-center items-center p-4 sm:p-6 w-full'>
          <div className='w-full max-w-md bg-white rounded-3xl border-2 border-dashed border-brand-200 p-8 text-center shadow-soft animate-fade-up'>
            <div className='mx-auto mb-4 h-16 w-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center'>
              <FaUtensils className='w-8 h-8' />
            </div>
            <h2 className='text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900 mb-1.5'>Add Your Restaurant</h2>
            <p className='text-ink-500 mb-6 text-sm sm:text-base leading-relaxed'>Join our food delivery platform and reach thousands of hungry customers every day.
            </p>
            <button className='bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-95 transition' onClick={() => navigate("/create-edit-shop")}>
              Get Started
            </button>
          </div>
        </div>
      }

      {myShopData &&
        <div className='w-full flex flex-col items-center gap-6 px-4 sm:px-6'>
          <h1 className='text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900 flex items-center gap-3 mt-8 text-center'><span className='h-11 w-11 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center'><FaUtensils className='w-5 h-5' /></span>Welcome to {myShopData.name}</h1>

          <div className='bg-white rounded-3xl shadow-card border border-black/[0.05] overflow-hidden w-full max-w-3xl relative animate-fade-up'>
            <button aria-label="Edit shop" className='absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/95 backdrop-blur shadow-soft text-brand-600 hover:text-brand-700 hover:scale-105 transition flex items-center justify-center' onClick={()=>navigate("/create-edit-shop")}>
<FaPen size={15}/>
            </button>
             <img src={myShopData.image} alt={myShopData.name} className='w-full h-52 sm:h-64 object-cover'/>
             <div className='p-5 sm:p-6'>
              <h1 className='text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900'>{myShopData.name}</h1>
              <p className='mt-1.5 text-sm font-semibold text-brand-600'>{myShopData.city},{myShopData.state}</p>
              <p className='text-sm text-ink-500 mt-0.5'>{myShopData.address}</p>
            </div>
          </div>

          {myShopData.items.length==0 &&
            <div className='flex justify-center items-center p-4 sm:p-6 w-full'>
          <div className='w-full max-w-md bg-white rounded-3xl border-2 border-dashed border-brand-200 p-8 text-center shadow-soft'>
            <div className='mx-auto mb-4 h-16 w-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center'>
              <FaUtensils className='w-8 h-8' />
            </div>
            <h2 className='text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900 mb-1.5'>Add Your Food Item</h2>
            <p className='text-ink-500 mb-6 text-sm sm:text-base leading-relaxed'>Share your delicious creations with our customers by adding them to the menu.
            </p>
            <button className='bg-gradient-to-r from-brand-500 to-brand-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-95 transition' onClick={() => navigate("/add-item")}>
            Add Food
            </button>
          </div>
        </div>
            }

            {myShopData.items.length>0 && <div className='flex flex-col items-center gap-4 w-full max-w-3xl '>
              {myShopData.items.map((item,index)=>(
                <OwnerItemCard data={item} key={index}/>
              ))}
              </div>}

        </div>}



    </div>
  )
}

export default OwnerDashboard