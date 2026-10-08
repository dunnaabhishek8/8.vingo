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
import { isValidEmail, isValidMobile, passwordScore, strengthLabel } from "../lib/validate"
import { useToast } from "../components/ui/Toast"

const STRENGTH_COLORS = ["bg-gray-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"]

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("user")
  const navigate = useNavigate()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mobile, setMobile] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const dispatch = useDispatch()
  const toast = useToast()

  const score = passwordScore(password)

  const validate = () => {
    if (!fullName.trim() || fullName.trim().length < 2) return "Please enter your full name."
    if (!isValidEmail(email)) return "Please enter a valid email address."
    if (!isValidMobile(mobile)) return "Mobile number must be 10-13 digits."
    if (password.length < 6) return "Password must be at least 6 characters."
    return null
  }

  const handleSignUp = async () => {
    const validationError = validate()
    if (validationError) return setErr(validationError)

    setLoading(true)
    setErr("")
    try {
      const result = await api.post("/api/auth/signup", {
        fullName,
        email,
        password,
        mobile,
        role
      })
      dispatch(setUserData(result.data))
      toast.success("Account created — welcome to Vingo!")
    } catch (error) {
      setErr(error?.response?.data?.message || "Sign up failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    if (!isValidMobile(mobile)) {
      return setErr("Enter a valid mobile number before continuing with Google.")
    }
    setGoogleLoading(true)
    setErr("")
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const { data } = await api.post("/api/auth/google-auth", {
        fullName: result.user.displayName,
        email: result.user.email,
        role,
        mobile
      })
      dispatch(setUserData(data))
      toast.success("Account ready — welcome to Vingo!")
    } catch (error) {
      toast.error(error?.response?.data?.message || "Google sign up failed.")
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
            <p className="text-xs text-ink-400 mt-1">Create your account to get started</p>
          </div>
        </div>

        {/* fullName */}
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-sm font-semibold text-ink-700 mb-1.5">Full Name</label>
          <input
            type="text"
            id="fullName"
            autoComplete="name"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            placeholder="Enter your Full Name"
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
          />
        </div>

        {/* email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-semibold text-ink-700 mb-1.5">Email</label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            placeholder="Enter your Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        {/* mobile */}
        <div className="mb-4">
          <label htmlFor="mobile" className="block text-sm font-semibold text-ink-700 mb-1.5">Mobile</label>
          <input
            type="tel"
            id="mobile"
            inputMode="numeric"
            autoComplete="tel"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            placeholder="Enter your Mobile Number"
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            value={mobile}
          />
        </div>

        {/* password */}
        <div className="mb-2">
          <label htmlFor="password" className="block text-sm font-semibold text-ink-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-11 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
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
          {/* strength meter */}
          {password.length > 0 && (
            <div className="mt-2 animate-fade-in">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= score ? STRENGTH_COLORS[score] : "bg-gray-200"}`} />
                ))}
              </div>
              <p className="text-[11px] font-semibold text-ink-400 mt-1">
                Strength: <span className={score >= 3 ? "text-green-600" : score >= 2 ? "text-orange-500" : "text-red-500"}>{strengthLabel(score)}</span>
              </p>
            </div>
          )}
        </div>

        {/* role */}
        <div className="mb-6 mt-4">
          <label htmlFor="role" className="block text-sm font-semibold text-ink-700 mb-1.5">Role</label>
          <div className="grid grid-cols-3 gap-2">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button
                key={r}
                type="button"
                className={`h-10 rounded-xl text-sm font-bold capitalize transition-all ${
                  role === r
                    ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25"
                    : "bg-white border border-gray-200 text-ink-500 hover:border-brand-300 hover:text-brand-600"
                }`}
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] transition flex items-center justify-center disabled:opacity-60 disabled:pointer-events-none"
          onClick={handleSignUp}
          disabled={loading || googleLoading}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign Up"}
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
          <span>Sign up with Google</span>
        </button>

        <p className="text-center text-sm text-ink-500 mt-6">
          Already have an account?{" "}
          <span className="text-brand-600 font-bold cursor-pointer hover:text-brand-700 transition" onClick={() => navigate("/signin")}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  )
}

export default SignUp