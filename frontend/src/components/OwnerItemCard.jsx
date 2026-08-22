import axios from 'axios';
import React from 'react'
import { FaPen } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';
function OwnerItemCard({data}) {
    const navigate=useNavigate()
    const dispatch=useDispatch()
    const handleDelete=async () => {
      try {
        const result=await axios.get(`${serverUrl}/api/item/delete/${data._id}`,{withCredentials:true})
        dispatch(setMyShopData(result.data))
      } catch (error) {
        console.log(error)
      }
    }
  return (
    <div className='flex bg-white rounded-2xl shadow-soft border border-black/[0.05] overflow-hidden w-full hover:shadow-card transition-shadow duration-300'>
      <div className='w-28 sm:w-36 shrink-0'>
        <img src={data.image} alt={data.name} className='w-full h-full object-cover'/>
      </div>
      <div className='flex flex-col justify-between p-4 flex-1 min-w-0'>
          <div>
            <h2 className='text-base font-bold text-ink-900 truncate'>{data.name}</h2>
            <div className='flex flex-wrap items-center gap-1.5 mt-1.5'>
              <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-ink-700'>{data.category}</span>
              <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-ink-700 capitalize'>{data.foodType}</span>
            </div>
          </div>
          <div className='flex items-center justify-between mt-3'>
            <div className='text-brand-600 font-extrabold text-lg'>₹{data.price}</div>
          <div className='flex items-center gap-1.5'>
            <button aria-label="Edit item" className='p-2 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 transition' onClick={()=>navigate(`/edit-item/${data._id}`)}>
              <FaPen size={14}/>
            </button>
            <button aria-label="Delete item" className='p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition' onClick={handleDelete}>
              <FaTrashAlt size={14}/>
            </button>
          </div>

          </div>
      </div>
    </div>
  )
}

export default OwnerItemCard