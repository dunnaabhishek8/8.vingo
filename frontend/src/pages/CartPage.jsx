import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';
function CartPage() {
    const navigate = useNavigate()
    const { cartItems, totalAmount } = useSelector(state => state.user)
    return (
        <div className='min-h-screen bg-cream flex justify-center p-4 sm:p-6'>
            <div className='w-full max-w-[800px]'>
                <div className='flex items-center gap-4 mb-6'>
                    <button aria-label="Go back" className='h-11 w-11 shrink-0 rounded-full bg-white shadow-soft ring-1 ring-black/[0.06] text-brand-600 hover:bg-brand-50 transition flex items-center justify-center cursor-pointer' onClick={() => navigate("/")}>
                        <IoIosArrowRoundBack size={24} />
                    </button>
                    <h1 className='text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900'>Your Cart</h1>
                </div>
                {cartItems?.length == 0 ? (
                    <div className='rounded-3xl border-2 border-dashed border-gray-200 bg-white p-12 text-center animate-fade-up'>
                        <div className='mx-auto mb-4 h-16 w-16 rounded-2xl bg-gray-50 text-ink-400 flex items-center justify-center'>
                            <FiShoppingCart size={26}/>
                        </div>
                        <p className='text-ink-500 font-medium'>Your Cart is Empty</p>
                    </div>
                ) : (<>
                    <div className='space-y-3'>
                        {cartItems?.map((item, index) => (
                            <CartItemCard data={item} key={index} />
                        ))}
                    </div>
                    <div className='mt-6 bg-white p-5 rounded-2xl shadow-soft border border-black/[0.05] flex justify-between items-center'>

                        <h1 className='font-semibold text-ink-500'>Total Amount</h1>
                        <span className='text-2xl font-extrabold text-brand-600'>₹{totalAmount}</span>
                    </div>
                    <div className='mt-5 flex justify-end' >
                        <button className='bg-gradient-to-r from-brand-500 to-brand-600 text-white px-7 py-3 rounded-2xl font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] transition cursor-pointer' onClick={()=>navigate("/checkout")}>Proceed to CheckOut</button>
                    </div>
                </>
                )}
            </div>
        </div>
    )
}

export default CartPage