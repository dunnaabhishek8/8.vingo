import React from 'react'
import { useState } from 'react';
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from "react-spinners"
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
function SignUp() {
    const [showPassword, setShowPassword] = useState(false)
    const [role, setRole] = useState("user")
    const navigate=useNavigate()
    const [fullName,setFullName]=useState("")
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [mobile,setMobile]=useState("")
    const [err,setErr]=useState("")
    const [loading,setLoading]=useState(false)
    const dispatch=useDispatch()
     const handleSignUp=async () => {
        setLoading(true)
        try {
            const result=await axios.post(`${serverUrl}/api/auth/signup`,{
                fullName,email,password,mobile,role
            },{withCredentials:true})
            dispatch(setUserData(result.data))
            setErr("")
            setLoading(false)
        } catch (error) {
            setErr(error?.response?.data?.message)
             setLoading(false)
        }
     }

     const handleGoogleAuth=async () => {
        if(!mobile){
          return setErr("mobile no is required")
        }
        const provider=new GoogleAuthProvider()
        const result=await signInWithPopup(auth,provider)
  try {
    const {data}=await axios.post(`${serverUrl}/api/auth/google-auth`,{
        fullName:result.user.displayName,
        email:result.user.email,
        role,
        mobile
    },{withCredentials:true})
   dispatch(setUserData(data))
  } catch (error) {
    console.log(error)
  }
     }
    return (
        <div className='min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-brand-50 via-cream to-cream'>
            <div className='w-full max-w-md bg-white rounded-3xl shadow-card border border-black/[0.05] p-7 sm:p-9 animate-fade-up'>
                <div className='flex items-center gap-3 mb-7'>
                    <div className='h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30'>
                        <FaUtensils size={20}/>
                    </div>
                    <div>
                        <h1 className='text-2xl font-extrabold tracking-tight text-ink-900 leading-none'>Vingo</h1>
                        <p className='text-xs text-ink-400 mt-1'>Create your account to get started</p>
                    </div>
                </div>

                {/* fullName */}

                <div className='mb-4'>
                    <label htmlFor="fullName" className='block text-sm font-semibold text-ink-700 mb-1.5'>Full Name</label>
                    <input type="text" id="fullName" className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100' placeholder='Enter your Full Name' onChange={(e)=>setFullName(e.target.value)} value={fullName} required/>
                </div>
                {/* email */}

                <div className='mb-4'>
                    <label htmlFor="email" className='block text-sm font-semibold text-ink-700 mb-1.5'>Email</label>
                    <input type="email" id="email" className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100' placeholder='Enter your Email' onChange={(e)=>setEmail(e.target.value)} value={email} required/>
                </div>
                {/* mobile*/}

                <div className='mb-4'>
                    <label htmlFor="mobile" className='block text-sm font-semibold text-ink-700 mb-1.5'>Mobile</label>
                    <input type="tel" id="mobile" inputMode="numeric" className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100' placeholder='Enter your Mobile Number' onChange={(e)=>setMobile(e.target.value)} value={mobile} required/>
                </div>
                {/* password*/}

                <div className='mb-4'>
                    <label htmlFor="password" className='block text-sm font-semibold text-ink-700 mb-1.5'>Password</label>
                    <div className='relative'>
                        <input type={`${showPassword ? "text" : "password"}`} id="password" className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-11 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100' placeholder='Enter your password' onChange={(e)=>setPassword(e.target.value)} value={password} required/>

                        <button type="button" aria-label="Toggle password visibility" className='absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition' onClick={() => setShowPassword(prev => !prev)}>{!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}</button>
                    </div>
                </div>
                {/* role*/}

                <div className='mb-6'>
                    <label htmlFor="role" className='block text-sm font-semibold text-ink-700 mb-1.5'>Role</label>
                    <div className='grid grid-cols-3 gap-2'>
                        {["user", "owner", "deliveryBoy"].map((r) => (
                            <button
                                key={r}
                                type="button"
                                className={`h-10 rounded-xl text-sm font-bold capitalize transition-all ${role==r?"bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25":"bg-white border border-gray-200 text-ink-500 hover:border-brand-300 hover:text-brand-600"}`}
                                onClick={()=>setRole(r)}
                                >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

            <button className='w-full h-11 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] transition flex items-center justify-center disabled:opacity-60' onClick={handleSignUp} disabled={loading}>
                {loading?<ClipLoader size={20} color='white'/>:"Sign Up"}

            </button>
            {err && <p className='text-sm text-red-500 text-center my-3 animate-fade-in'>*{err}</p>}


            <div className='flex items-center gap-3 my-5'>
              <span className='flex-1 h-px bg-gray-200'></span>
              <span className='text-xs font-medium uppercase tracking-wider text-ink-400'>or</span>
              <span className='flex-1 h-px bg-gray-200'></span>
            </div>

            <button className='w-full h-11 rounded-xl border border-gray-200 bg-white flex items-center justify-center gap-2.5 text-sm font-semibold text-ink-700 hover:bg-gray-50 active:scale-[0.98] transition' onClick={handleGoogleAuth}>
<FcGoogle size={20}/>
<span>Sign up with Google</span>
            </button>
            <p className='text-center text-sm text-ink-500 mt-6'>Already have an account?  <span className='text-brand-600 font-bold cursor-pointer hover:text-brand-700 transition' onClick={()=>navigate("/signin")}>Sign In</span></p>
            </div>
        </div>
    )
}

export default SignUp