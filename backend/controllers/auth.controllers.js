import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js"
import { sendOtpMail } from "../utils/mail.js"

// Cookie options adapt to environment:
// - production (cross-site deployments): secure + sameSite none
// - development (localhost): lax so plain HTTP works
const cookieOptions = () => ({
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true
})

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const signUp = async (req, res) => {
    try {
        let { fullName, email, password, mobile, role } = req.body
        fullName = String(fullName || "").trim()
        email = String(email || "").trim().toLowerCase()
        mobile = String(mobile || "").trim()
        role = role || "user"

        if (!fullName || fullName.length < 2) {
            return res.status(400).json({ message: "Please enter your full name." })
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address." })
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." })
        }
        if (!/^\d{10,13}$/.test(mobile)) {
            return res.status(400).json({ message: "Mobile number must be 10-13 digits." })
        }
        if (!["user", "owner", "deliveryBoy"].includes(role)) {
            return res.status(400).json({ message: "Invalid role selected." })
        }

        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(400).json({ message: "An account with this email already exists." })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            fullName,
            email,
            role,
            mobile,
            password: hashedPassword
        })

        const token = await genToken(user._id)
        res.cookie("token", token, cookieOptions())

        return res.status(201).json(user)

    } catch (error) {
        return res.status(500).json({ message: `Sign up failed. ${error.message}` })
    }
}

export const signIn = async (req, res) => {
    try {
        let { email, password } = req.body
        email = String(email || "").trim().toLowerCase()

        if (!emailRegex.test(email) || !password) {
            return res.status(400).json({ message: "Please enter a valid email and password." })
        }

        const user = await User.findOne({ email })
        if (!user || !user.password) {
            return res.status(400).json({ message: "Invalid email or password." })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." })
        }

        const token = await genToken(user._id)
        res.cookie("token", token, cookieOptions())

        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({ message: `Sign in failed. ${error.message}` })
    }
}

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        return res.status(500).json({ message: `Sign out failed. ${error.message}` })
    }
}

export const sendOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase()
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." })
    }
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "No account found with this email." })
    }
    // Cooldown: don't resend within 60 seconds
    if (user.otpExpires && user.resetOtp && (user.otpExpires - Date.now()) > 4 * 60 * 1000) {
      return res.status(429).json({ message: "OTP was just sent. Please wait a minute before requesting again." })
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString()
    user.resetOtp = otp
    user.otpExpires = Date.now() + 5 * 60 * 1000
    user.isOtpVerified = false
    await user.save()
    await sendOtpMail(email, otp)
    return res.status(200).json({ message: "OTP sent successfully to your email" })
  } catch (error) {
    return res.status(500).json({ message: `Could not send OTP. ${error.message}` })
  }
}

export const verifyOtp = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase()
        const otp = String(req.body.otp || "").trim()
        const user = await User.findOne({ email })
        if (!user || !user.resetOtp || user.resetOtp !== otp || !user.otpExpires || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP." })
        }
        user.isOtpVerified = true
        user.resetOtp = undefined
        user.otpExpires = undefined
        await user.save()
        return res.status(200).json({ message: "OTP verified successfully" })
    } catch (error) {
        return res.status(500).json({ message: `OTP verification failed. ${error.message}` })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase()
        const newPassword = String(req.body.newPassword || "")
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." })
        }
        const user = await User.findOne({ email })
        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "OTP verification required before resetting password." })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.isOtpVerified = false
        await user.save()
        return res.status(200).json({ message: "Password reset successfully" })
    } catch (error) {
        return res.status(500).json({ message: `Password reset failed. ${error.message}` })
    }
}

export const googleAuth = async (req, res) => {
    try {
        let { fullName, email, mobile, role } = req.body
        email = String(email || "").trim().toLowerCase()
        mobile = String(mobile || "").trim()
        role = role || "user"

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "A valid email is required." })
        }
        if (!/^\d{10,13}$/.test(mobile)) {
            return res.status(400).json({ message: "A valid mobile number is required." })
        }
        if (!["user", "owner", "deliveryBoy"].includes(role)) {
            return res.status(400).json({ message: "Invalid role selected." })
        }

        let user = await User.findOne({ email })
        if (!user) {
            user = await User.create({
                fullName: String(fullName || "Vingo User").trim(),
                email,
                mobile,
                role
            })
        }

        const token = await genToken(user._id)
        res.cookie("token", token, cookieOptions())

        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({ message: `Google authentication failed. ${error.message}` })
    }
}