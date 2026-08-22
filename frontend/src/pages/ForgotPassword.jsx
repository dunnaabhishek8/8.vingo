import axios from 'axios';
import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { ClipLoader } from 'react-spinners';
function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email,setEmail]=useState("")
  const [otp,setOtp]=useState("")
  const [newPassword,setNewPassword]=useState("")
  const [confirmPassword,setConfirmPassword]=useState("")
  const [err,setErr]=useState("")
  const navigate=useNavigate()
const [loading,setLoading]=useState(false)
  const handleSendOtp=async () => {
    setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/auth/send-otp`,{email},{withCredentials:true})
      console.log(result)
      setErr("")
      setStep(2)
      setLoading(false)
    } catch (error) {
       setErr(error.response.data.message)
       setLoading(false)
    }
  }
  const handleVerifyOtp=async () => {
      setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/auth/verify-otp`,{email,otp},{withCredentials:true})
      console.log(result)
      setErr("")
      setStep(3)
        setLoading(false)
    } catch (error) {
        setErr(error?.response?.data?.message)
          setLoading(false)
    }
  }
  const handleResetPassword=async () => {
    if(newPassword!=confirmPassword){
      return null
    }
    setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/auth/reset-password`,{email,newPassword},{withCredentials:true})
      setErr("")
      console.log(result)
        setLoading(false)
      navigate("/signin")
    } catch (error) {
     setErr(error?.response?.data?.message)
       setLoading(false)
    }
  }
  return (
    <div className='flex w-full items-center justify-center min-h-screen p-4 bg-gradient-to-br from-brand-50 via-cream to-cream'>
      <div className='bg-white rounded-3xl shadow-card border border-black/[0.05] w-full max-w-md p-7 sm:p-9 animate-fade-up'>
        <div className='flex items-center gap-3 mb-5'>
          <button aria-label="Back to sign in" className='h-10 w-10 shrink-0 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 transition flex items-center justify-center' onClick={()=>navigate("/signin")}>
            <IoIosArrowRoundBack size={22}/>
          </button>
          <h1 className='text-xl sm:text-2xl font-extrabold tracking-tight text-ink-900'>Forgot Password</h1>
        </div>

        {/* step indicator */}
        <div className='flex items-center justify-center gap-1.5 mb-6'>
          {[1,2,3].map(s=>(
            <span key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step>=s?"w-7 bg-brand-500":"w-3.5 bg-gray-200"}`}></span>
          ))}
        </div>

        {step == 1
          &&
          <div className='animate-fade-in'>
 <div className='mb-6'>
                    <label htmlFor="email" className='block text-sm font-semibold text-ink-700 mb-1.5'>Email</label>
                    <input type="email" id="email" className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100' placeholder='Enter your Email' onChange={(e)=>setEmail(e.target.value)} value={email} required/>
                </div>
                <button className='w-full h-11 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] transition flex items-center justify-center disabled:opacity-60' onClick={handleSendOtp} disabled={loading}>
                {loading?<ClipLoader size={20} color='white'/>:"Send OTP"}
            </button>
                 {err && <p className='text-sm text-red-500 text-center my-3 animate-fade-in'>*{err}</p>}
          </div>}

         {step == 2
          &&
          <div className='animate-fade-in'>
 <div className='mb-6'>
                    <label htmlFor="otp" className='block text-sm font-semibold text-ink-700 mb-1.5'>OTP</label>
                    <input type="text" id="otp" inputMode="numeric" className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 tracking-[0.4em] text-center font-bold' placeholder='••••••' onChange={(e)=>setOtp(e.target.value)} value={otp} required/>
                </div>
                <button className='w-full h-11 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] transition flex items-center justify-center disabled:opacity-60' onClick={handleVerifyOtp} disabled={loading}>
                {loading?<ClipLoader size={20} color='white'/>:"Verify"}
            </button>
                {err && <p className='text-sm text-red-500 text-center my-3 animate-fade-in'>*{err}</p>}
          </div>}
          {step == 3
          &&
          <div className='animate-fade-in'>
 <div className='mb-5'>
                    <label htmlFor="newPassword" className='block text-sm font-semibold text-ink-700 mb-1.5'>New Password</label>
                    <input type="password" id="newPassword" className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100' placeholder='Enter New Password' onChange={(e)=>setNewPassword(e.target.value)} value={newPassword}/>
                </div>
                <div className='mb-6'>
                    <label htmlFor="ConfirmPassword" className='block text-sm font-semibold text-ink-700 mb-1.5'>Confirm Password</label>
                    <input type="password" id="ConfirmPassword" className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100' placeholder='Confirm Password' onChange={(e)=>setConfirmPassword(e.target.value)} value={confirmPassword} required/>
                </div>
                <button className='w-full h-11 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] transition flex items-center justify-center disabled:opacity-60' onClick={handleResetPassword} disabled={loading}>
                {loading?<ClipLoader size={20} color='white'/>:"Reset Password"}
            </button>
                {err && <p className='text-sm text-red-500 text-center my-3 animate-fade-in'>*{err}</p>}
          </div>}
      </div>
    </div>
  )
}

export default ForgotPassword