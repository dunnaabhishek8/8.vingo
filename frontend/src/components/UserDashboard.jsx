import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaCircleChevronLeft } from "react-icons/fa6";
import { FaCircleChevronRight } from "react-icons/fa6";
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';

function UserDashboard() {
  const {currentCity,shopInMyCity,itemsInMyCity,searchItems}=useSelector(state=>state.user)
  const cateScrollRef=useRef()
  const shopScrollRef=useRef()
  const navigate=useNavigate()
  const [showLeftCateButton,setShowLeftCateButton]=useState(false)
  const [showRightCateButton,setShowRightCateButton]=useState(false)
   const [showLeftShopButton,setShowLeftShopButton]=useState(false)
  const [showRightShopButton,setShowRightShopButton]=useState(false)
  const [updatedItemsList,setUpdatedItemsList]=useState([])

const handleFilterByCategory=(category)=>{
if(category=="All"){
  setUpdatedItemsList(itemsInMyCity)
}else{
  const filteredList=itemsInMyCity?.filter(i=>i.category===category)
  setUpdatedItemsList(filteredList)
}

}

useEffect(()=>{
setUpdatedItemsList(itemsInMyCity)
},[itemsInMyCity])


  const updateButton=(ref,setLeftButton,setRightButton)=>{
const element=ref.current
if(element){
setLeftButton(element.scrollLeft>0)
setRightButton(element.scrollLeft+element.clientWidth<element.scrollWidth)

}
  }
  const scrollHandler=(ref,direction)=>{
    if(ref.current){
      ref.current.scrollBy({
        left:direction=="left"?-200:200,
        behavior:"smooth"
      })
    }
  }




  useEffect(()=>{
    if(cateScrollRef.current){
      updateButton(cateScrollRef,setShowLeftCateButton,setShowRightCateButton)
      updateButton(shopScrollRef,setShowLeftShopButton,setShowRightShopButton)
      cateScrollRef.current.addEventListener('scroll',()=>{
        updateButton(cateScrollRef,setShowLeftCateButton,setShowRightCateButton)
      })
      shopScrollRef.current.addEventListener('scroll',()=>{
         updateButton(shopScrollRef,setShowLeftShopButton,setShowRightShopButton)
      })

    }

    return ()=>{cateScrollRef?.current?.removeEventListener("scroll",()=>{
        updateButton(cateScrollRef,setShowLeftCateButton,setShowRightCateButton)
      })
         shopScrollRef?.current?.removeEventListener("scroll",()=>{
        updateButton(shopScrollRef,setShowLeftShopButton,setShowRightShopButton)
      })}

  },[categories])


  return (
    <div className='w-screen min-h-screen flex flex-col gap-10 items-center bg-cream pb-20'>
      <Nav />

      {searchItems && searchItems.length>0 && (
        <div className='w-full max-w-6xl px-4 sm:px-6 flex flex-col gap-5 items-start'>
          <div className='w-full bg-white shadow-soft rounded-3xl border border-black/[0.05] p-5 sm:p-6 animate-fade-up'>
            <h1 className='text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900 border-b border-gray-100 pb-3 mb-5'>
              Search Results
            </h1>
            <div className='w-full flex flex-wrap gap-5 justify-center'>
              {searchItems.map((item)=>(
                <FoodCard data={item} key={item._id}/>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl px-4 sm:px-6 flex flex-col gap-5 items-start">
        <h1 className='text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900'>Inspiration for your first order</h1>
        <div className='w-full relative'>
          {showLeftCateButton &&  <button aria-label="Scroll left" className='absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-card ring-1 ring-black/[0.06] text-ink-700 hover:text-brand-600 hover:scale-105 transition flex items-center justify-center' onClick={()=>scrollHandler(cateScrollRef,"left")}><FaCircleChevronLeft size={18}/>
          </button>}


          <div className='w-full flex overflow-x-auto no-scrollbar gap-4 pb-1 scroll-smooth' ref={cateScrollRef}>
            {categories.map((cate, index) => (
              <CategoryCard name={cate.category} image={cate.image} key={index} onClick={()=>handleFilterByCategory(cate.category)}/>
            ))}
          </div>
          {showRightCateButton &&  <button aria-label="Scroll right" className='absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-card ring-1 ring-black/[0.06] text-ink-700 hover:text-brand-600 hover:scale-105 transition flex items-center justify-center' onClick={()=>scrollHandler(cateScrollRef,"right")}>
<FaCircleChevronRight size={18}/>
          </button>}

        </div>
      </div>

      <div className='w-full max-w-6xl px-4 sm:px-6 flex flex-col gap-5 items-start'>
       <h1 className='text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900'>Best Shop in {currentCity}</h1>
       <div className='w-full relative'>
          {showLeftShopButton &&  <button aria-label="Scroll left" className='absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-card ring-1 ring-black/[0.06] text-ink-700 hover:text-brand-600 hover:scale-105 transition flex items-center justify-center' onClick={()=>scrollHandler(shopScrollRef,"left")}><FaCircleChevronLeft size={18}/>
          </button>}


          <div className='w-full flex overflow-x-auto no-scrollbar gap-4 pb-1 scroll-smooth' ref={shopScrollRef}>
            {shopInMyCity?.map((shop, index) => (
              <CategoryCard name={shop.name} image={shop.image} key={index} onClick={()=>navigate(`/shop/${shop._id}`)}/>
            ))}
          </div>
          {showRightShopButton &&  <button aria-label="Scroll right" className='absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white shadow-card ring-1 ring-black/[0.06] text-ink-700 hover:text-brand-600 hover:scale-105 transition flex items-center justify-center' onClick={()=>scrollHandler(shopScrollRef,"right")}>
<FaCircleChevronRight size={18}/>
          </button>}

        </div>
      </div>

      <div className='w-full max-w-6xl px-4 sm:px-6 flex flex-col gap-5 items-start'>
       <h1 className='text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900'>
        Suggested Food Items
       </h1>

<div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 justify-items-center'>
{updatedItemsList?.map((item,index)=>(
  <FoodCard key={index} data={item}/>
))}
</div>


      </div>


    </div>
  )
}

export default UserDashboard