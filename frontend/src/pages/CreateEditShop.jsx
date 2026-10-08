import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import { useState } from 'react';
import { useRef } from 'react';
import axios from 'axios';
import { serverUrl } from '../lib/api';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';
function CreateEditShop() {
    const navigate = useNavigate()
    const { myShopData } = useSelector(state => state.owner)
    const { currentCity,currentState,currentAddress } = useSelector(state => state.user)
    const [name,setName]=useState(myShopData?.name || "")
     const [address,setAddress]=useState(myShopData?.address || currentAddress)
     const [city,setCity]=useState(myShopData?.city || currentCity)
       const [state,setState]=useState(myShopData?.state || currentState)
       const [frontendImage,setFrontendImage]=useState(myShopData?.image || null)
       const [backendImage,setBackendImage]=useState(null)
       const [loading,setLoading]=useState(false)
       const dispatch=useDispatch()
       const handleImage=(e)=>{
        const file=e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
       }

       const handleSubmit=async (e)=>{
        e.preventDefault()
        setLoading(true)
        try {
           const formData=new FormData()
           formData.append("name",name)
           formData.append("city",city)
           formData.append("state",state)
           formData.append("address",address)
           if(backendImage){
            formData.append("image",backendImage)
           }
           const result=await axios.post(`${serverUrl}/api/shop/create-edit`,formData,{withCredentials:true})
           dispatch(setMyShopData(result.data))
          setLoading(false)
          navigate("/")
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
       }
    return (
        <div className='flex justify-center flex-col items-center p-4 sm:p-6 bg-gradient-to-b from-brand-50 via-cream to-cream min-h-screen'>
            <button aria-label="Go back" className='absolute top-5 left-5 z-10 h-11 w-11 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] text-brand-600 hover:bg-brand-50 transition flex items-center justify-center cursor-pointer' onClick={() => navigate("/")}>
                <IoIosArrowRoundBack size={24} />
            </button>

            <div className='max-w-lg w-full bg-white rounded-3xl shadow-card border border-black/[0.05] p-6 sm:p-8 animate-fade-up'>
                <div className='flex flex-col items-center mb-7'>
                    <div className='h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 mb-4'>
                        <FaUtensils size={24} />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900">
                        {myShopData ? "Edit Shop" : "Add Shop"}
                    </div>
                    <p className='text-sm text-ink-400 mt-1'>{myShopData ? "Update your restaurant details" : "Tell us about your restaurant"}</p>
                </div>
                <form className='space-y-5' onSubmit={handleSubmit}>
                    <div>
                        <label className='block text-sm font-semibold text-ink-700 mb-1.5'>Name</label>
                        <input type="text" placeholder='Enter Shop Name' className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100'
                        onChange={(e)=>setName(e.target.value)}
                        value={name}
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-ink-700 mb-1.5'>Shop Image</label>
                        <input type="file" accept='image/*' className='w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-ink-500 cursor-pointer transition hover:border-brand-300 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:text-white file:text-xs file:font-bold file:cursor-pointer' onChange={handleImage}  />
                        {frontendImage &&   <div className='mt-4 rounded-2xl overflow-hidden ring-1 ring-black/[0.06]'>
                            <img src={frontendImage} alt="Shop preview" className='w-full h-48 object-cover'/>
                        </div>}

                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                           <label className='block text-sm font-semibold text-ink-700 mb-1.5'>City</label>
                        <input type="text" placeholder='City' className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100' onChange={(e)=>setCity(e.target.value)}
                        value={city}/>
                        </div>
                        <div>
                            <label className='block text-sm font-semibold text-ink-700 mb-1.5'>State</label>
                        <input type="text" placeholder='State' className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100' onChange={(e)=>setState(e.target.value)}
                        value={state}/>
                        </div>
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-ink-700 mb-1.5'>Address</label>
                        <input type="text" placeholder='Enter Shop Address' className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100' onChange={(e)=>setAddress(e.target.value)}
                        value={address}/>
                    </div>
                    <button className='w-full h-12 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.99] transition flex items-center justify-center disabled:opacity-60' disabled={loading}>
                        {loading?<ClipLoader size={20} color='white'/>:"Save"}

                    </button>
                </form>
            </div>



        </div>
    )
}

export default CreateEditShop