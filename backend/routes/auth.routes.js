import express from "express"
import { googleAuth, resetPassword, sendOtp, signIn, signOut, signUp, verifyOtp } from "../controllers/auth.controllers.js"
import { rateLimit } from "../middlewares/rateLimit.js"

const authRouter = express.Router()

// OTP endpoints are rate-limited per email+IP to prevent mail abuse
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    keyGen: (req) => `${req.ip}:${req.body?.email || "unknown"}`
})

authRouter.post("/signup", signUp)
authRouter.post("/signin", signIn)
authRouter.get("/signout", signOut)
authRouter.post("/send-otp", otpLimiter, sendOtp)
authRouter.post("/verify-otp", verifyOtp)
authRouter.post("/reset-password", resetPassword)
authRouter.post("/google-auth", googleAuth)

export default authRouter