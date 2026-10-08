import Coupon from "../models/coupon.model.js"
import Order from "../models/order.model.js"

// Validate + price a coupon without consuming it (used by the Apply button)
export const applyCoupon = async (req, res) => {
    try {
        const { code, amount } = req.body
        const subtotal = Number(amount)
        if (!code || Number.isNaN(subtotal) || subtotal <= 0) {
            return res.status(400).json({ message: "Coupon code and order amount are required." })
        }

        const coupon = await Coupon.findOne({ code: String(code).trim().toUpperCase() })
        if (!coupon || !coupon.isActive) {
            return res.status(400).json({ message: "Invalid or inactive coupon code." })
        }
        if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
            return res.status(400).json({ message: "This coupon has expired." })
        }
        if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: "This coupon has reached its usage limit." })
        }
        if (subtotal < (coupon.minOrderAmount || 0)) {
            return res.status(400).json({ message: `Add items worth ₹${Math.ceil(coupon.minOrderAmount - subtotal)} more to use this coupon.` })
        }
        if (coupon.firstOrderOnly) {
            const pastOrders = await Order.countDocuments({ user: req.userId })
            if (pastOrders > 0) {
                return res.status(400).json({ message: "This coupon is only valid on your first order." })
            }
        }

        let discount = 0
        if (coupon.type === "percent") {
            discount = Math.round((subtotal * coupon.value) / 100)
            if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
        } else {
            discount = coupon.value
        }
        discount = Math.min(discount, subtotal)

        return res.status(200).json({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discount,
            finalAmount: subtotal - discount,
            description: coupon.type === "percent"
                ? `${coupon.value}% off${coupon.maxDiscount ? ` up to ₹${coupon.maxDiscount}` : ""}`
                : `Flat ₹${coupon.value} off`
        })

    } catch (error) {
        return res.status(500).json({ message: `Could not apply coupon. ${error.message}` })
    }
}

// Active, public coupons shown as "Available offers" in checkout
export const getActiveCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({
            isActive: true,
            expiresAt: { $gt: new Date() },
            $or: [
                { usageLimit: null },
                { $expr: { $lt: ["$usedCount", "$usageLimit"] } }
            ]
        }).select("code type value minOrderAmount maxDiscount firstOrderOnly expiresAt")

        const formatted = coupons.map(c => ({
            code: c.code,
            description: c.type === "percent"
                ? `${c.value}% off${c.maxDiscount ? ` up to ₹${c.maxDiscount}` : ""}`
                : `Flat ₹${c.value} off`,
            minOrderAmount: c.minOrderAmount,
            firstOrderOnly: c.firstOrderOnly,
            expiresAt: c.expiresAt
        }))

        return res.status(200).json(formatted)
    } catch (error) {
        return res.status(500).json({ message: `Could not load offers. ${error.message}` })
    }
}

// Shop owners can create platform coupons for promotions
export const createCoupon = async (req, res) => {
    try {
        const { code, type, value, minOrderAmount, maxDiscount, expiresAt, usageLimit, firstOrderOnly } = req.body

        if (!code || !type || !value || !expiresAt) {
            return res.status(400).json({ message: "Code, type, value and expiry date are required." })
        }
        if (!["percent", "flat"].includes(type)) {
            return res.status(400).json({ message: "Type must be percent or flat." })
        }
        if (Number(value) <= 0) {
            return res.status(400).json({ message: "Value must be greater than zero." })
        }
        if (type === "percent" && Number(value) > 100) {
            return res.status(400).json({ message: "Percent discount cannot exceed 100." })
        }
        if (new Date(expiresAt) < new Date()) {
            return res.status(400).json({ message: "Expiry date must be in the future." })
        }

        const normalizedCode = String(code).trim().toUpperCase()
        const existing = await Coupon.findOne({ code: normalizedCode })
        if (existing) {
            return res.status(400).json({ message: "A coupon with this code already exists." })
        }

        const coupon = await Coupon.create({
            code: normalizedCode,
            type,
            value: Number(value),
            minOrderAmount: Number(minOrderAmount) || 0,
            maxDiscount: maxDiscount ? Number(maxDiscount) : null,
            expiresAt: new Date(expiresAt),
            usageLimit: usageLimit ? Number(usageLimit) : null,
            firstOrderOnly: Boolean(firstOrderOnly)
        })

        return res.status(201).json(coupon)
    } catch (error) {
        return res.status(500).json({ message: `Could not create coupon. ${error.message}` })
    }
}