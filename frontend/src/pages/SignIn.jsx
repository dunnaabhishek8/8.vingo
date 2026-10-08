import React, { useState } from "react"
import { FaRegEye, FaRegEyeSlash, FaUtensils } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { useNavigate } from "react-router-dom"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "../../firebase"
import { ClipLoader } from "react-spinners"
import { useDispatch } from "react-redux"
import { setUserData } from "../redux/userSlice"
import api from "../lib/api"
import { isValidEmail } from "../lib/validate"
import { useToast } from "../components/ui/Toast"

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const dispatch = useDispatch()
  const toast = useToast()

  const handleSignIn = async () => {
    if (!isValidEmail(email)) {
      return setErr("Please enter a valid email address.")
    }
    if (!password) {
      return setErr("Please enter your password.")
    }
    setLoading(true)
    setErr("")
    try {
      const result = await api.post("/api/auth/signin", { email, password })
      dispatch(setUserData(result.data))
      toast.success(`Welcome back, ${result.data.fullName?.split(" ")[0]}!`)
    } catch (error) {
      setErr(error?.response?.data?.message || "Sign in failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const { data } = await api.post("/api/auth/google-auth", {
        email: result.user.email
      })
      dispatch(setUserData(data))
      toast.success("Signed in with Google!")
    } catch (error) {
      toast.error(error?.response?.data?.message || "Google sign in failed.")
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-brand-50 via-cream to-cream">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-card border border-black/[0.05] p-7 sm:p-9 animate-fade-up">
        <div className="flex items-center gap-3 mb-7">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
            <FaUtensils size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 leading-none">Vingo</h1>
            <p className="text-xs text-ink-400 mt-1">Welcome back! Sign in to continue</p>
          </div>
        </div>

        {/* email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-semibold text-ink-700 mb-1.5">Email</label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:ring-4 focus:ring-brand-100 ${err && !isValidEmail(email) ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-brand-400"}`}
            placeholder="Enter your Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
          />
        </div>

        {/* password */}
        <div className="mb-3">
          <label htmlFor="password" className="block text-sm font-semibold text-ink-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-11 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        <div
          className="text-right mb-5 cursor-pointer text-sm font-semibold text-brand-600 hover:text-brand-700 transition"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </div>

        <button
          className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] transition flex items-center justify-center disabled:opacity-60 disabled:pointer-events-none"
          onClick={handleSignIn}
          disabled={loading || googleLoading}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign In"}
        </button>

        {err && (
          <p className="text-sm text-red-500 text-center my-3 animate-fade-in" role="alert">
            *{err}
          </p>
        )}

        <div className="flex items-center gap-3 my-5">
          <span className="flex-1 h-px bg-gray-200"></span>
          <span className="text-xs font-medium uppercase tracking-wider text-ink-400">or</span>
          <span className="flex-1 h-px bg-gray-200"></span>
        </div>

        <button
          className="w-full h-11 rounded-xl border border-gray-200 bg-white flex items-center justify-center gap-2.5 text-sm font-semibold text-ink-700 hover:bg-gray-50 active:scale-[0.98] transition disabled:opacity-60 disabled:pointer-events-none"
          onClick={handleGoogleAuth}
          disabled={loading || googleLoading}
        >
          {googleLoading ? <ClipLoader size={18} color="#6f6878" /> : <FcGoogle size={20} />}
          <span>Sign In with Google</span>
        </button>

        <p className="text-center text-sm text-ink-500 mt-6">
          New to Vingo?{" "}
          <span className="text-brand-600 font-bold cursor-pointer hover:text-brand-700 transition" onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  )
}

export default SignIn