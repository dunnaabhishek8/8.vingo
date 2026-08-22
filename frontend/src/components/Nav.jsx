import React, { useEffect, useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { serverUrl } from '../App';
import { setSearchItems, setUserData } from '../redux/userSlice';
import { FaPlus } from "react-icons/fa6";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
function Nav() {
    const { userData, currentCity ,cartItems} = useSelector(state => state.user)
        const { myShopData} = useSelector(state => state.owner)
    const [showInfo, setShowInfo] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [query,setQuery]=useState("")
    const dispatch = useDispatch()
    const navigate=useNavigate()
    const handleLogOut = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null))
        } catch (error) {
            console.log(error)
        }
    }

    const handleSearchItems=async () => {
      try {
        const result=await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,{withCredentials:true})
    dispatch(setSearchItems(result.data))
      } catch (error) {
        console.log(error)
      }
    }

    useEffect(()=>{
        if(query){
handleSearchItems()
        }else{
              dispatch(setSearchItems(null))
        }

    },[query])
    return (
        <>
            {/* click-away layer to close the profile dropdown */}
            {showInfo && <div className='fixed inset-0 z-[9998]' onClick={() => setShowInfo(false)} />}

            <header className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-4 sm:px-6 fixed top-0 z-[9999] bg-white/85 backdrop-blur-xl border-b border-black/[0.06]'>

                {/* mobile search sheet */}
                {showSearch && userData.role == "user" &&
                    <div className='md:hidden fixed top-[88px] left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white rounded-2xl shadow-pop border border-black/[0.06] p-2 flex items-center gap-2 animate-scale-in z-[9999]'>
                        <div className='flex items-center gap-2 pl-3 pr-3 py-2 border-r border-gray-200 shrink-0'>
                            <FaLocationDot size={18} className="text-brand-500" />
                            <span className='max-w-[90px] truncate text-sm font-medium text-ink-700'>{currentCity}</span>
                        </div>
                        <div className='flex items-center gap-2 flex-1 px-2'>
                            <IoIosSearch size={20} className='text-brand-500 shrink-0' />
                            <input type="text" placeholder='Search delicious food...' className='w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none py-2' onChange={(e)=>setQuery(e.target.value)} value={query}/>
                        </div>
                    </div>}

                <h1 onClick={()=>navigate("/")} className='text-[28px] leading-none font-extrabold tracking-tight bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 bg-clip-text text-transparent select-none cursor-pointer'>Vingo</h1>

                {/* desktop search bar */}
                {userData.role == "user" &&
                    <div className='md:w-[60%] lg:w-[42%] h-[52px] bg-gray-50/90 border border-black/[0.06] rounded-full items-center gap-3 hidden md:flex px-2 focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100 transition'>
                        <div className='flex items-center gap-2 pl-4 pr-3 self-stretch border-r border-gray-200'>
                            <FaLocationDot size={18} className="text-brand-500" />
                            <span className='max-w-[110px] truncate text-sm font-medium text-ink-700'>{currentCity}</span>
                        </div>
                        <div className='flex items-center gap-2 flex-1 pr-3'>
                            <IoIosSearch size={20} className='text-brand-500 shrink-0' />
                            <input type="text" placeholder='Search delicious food...' className='w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none' onChange={(e)=>setQuery(e.target.value)} value={query}/>
                        </div>
                    </div>}

                <div className='flex items-center gap-3 sm:gap-4'>
                    {userData.role == "user" && (showSearch
                        ? <button aria-label="Close search" className='md:hidden h-10 w-10 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] flex items-center justify-center text-brand-600 hover:bg-brand-50 transition' onClick={() => setShowSearch(false)}><RxCross2 size={20}/></button>
                        : <button aria-label="Open search" className='md:hidden h-10 w-10 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] flex items-center justify-center text-brand-600 hover:bg-brand-50 transition' onClick={() => setShowSearch(true)}><IoIosSearch size={20}/></button>)
                    }
                    {userData.role == "owner"? <>
                     {myShopData && <>
                         <button className='hidden md:flex items-center gap-2 h-10 px-4 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-95 transition' onClick={()=>navigate("/add-item")}>
                            <FaPlus size={15} />
                            <span>Add Food Item</span>
                        </button>
                          <button aria-label="Add food item" className='md:hidden h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 flex items-center justify-center active:scale-95 transition' onClick={()=>navigate("/add-item")}>
                            <FaPlus size={17} />
                        </button></>}

                        <button className='hidden md:flex items-center gap-2 h-10 px-4 rounded-full bg-brand-50 text-brand-600 text-sm font-semibold hover:bg-brand-100 transition' onClick={()=>navigate("/my-orders")}>
                          <TbReceipt2 size={18}/>
                          <span>My Orders</span>
                        </button>
                        <button aria-label="My orders" className='md:hidden h-10 w-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-100 transition' onClick={()=>navigate("/my-orders")}>
                          <TbReceipt2 size={18}/>
                        </button>
                    </>: (
                        <>
                     {userData.role=="user" &&
                        <button aria-label="Cart" className='relative h-10 w-10 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] flex items-center justify-center text-brand-600 hover:text-brand-700 hover:bg-brand-50 transition' onClick={()=>navigate("/cart")}>
                            <FiShoppingCart size={19} />
                            {cartItems.length > 0 &&
                                <span className='absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white'>{cartItems.length}</span>}
                        </button>}

                        <button className='hidden md:block h-10 px-4 rounded-full bg-brand-50 text-brand-600 text-sm font-semibold hover:bg-brand-100 transition' onClick={()=>navigate("/my-orders")}>
                            My Orders
                        </button>
                        </>
                    )}

                    <button aria-label="Profile menu" className='h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-base font-bold uppercase shadow-lg shadow-brand-500/30 ring-2 ring-white/70 flex items-center justify-center active:scale-95 transition' onClick={() => setShowInfo(prev => !prev)}>
                        {userData?.fullName?.trim().charAt(0)}
                    </button>

                    {showInfo &&
                        <div className={`fixed top-[88px] right-4
                            ${userData.role=="deliveryBoy"?"md:right-[20%] lg:right-[40%]":"md:right-[10%] lg:right-[25%]"} w-[210px] bg-white rounded-2xl shadow-pop border border-black/[0.06] p-2 flex flex-col z-[9999] animate-scale-in`}>
                            <div className='px-3 py-2.5 border-b border-gray-100 mb-1'>
                                <div className='text-[15px] font-bold text-ink-900 truncate'>{userData.fullName}</div>
                                <div className='text-xs text-ink-400 capitalize mt-0.5'>{userData.role}</div>
                            </div>
                            {userData.role=="user" && <button className='md:hidden text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-ink-700 hover:bg-gray-50 transition' onClick={()=>navigate("/my-orders")}>My Orders</button>}
                            <button className='text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-600 hover:bg-brand-50 transition' onClick={handleLogOut}>Log Out</button>
                        </div>}

                </div>
            </header>
        </>
    )
}


export default Nav