import DeliveryAssignment from "../models/deliveryAssignment.model.js"
import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js"
import Item from "../models/item.model.js"
import Coupon from "../models/coupon.model.js"
import { sendDeliveryOtpMail } from "../utils/mail.js"
import { pushNotification } from "../utils/notify.js"
import RazorPay from "razorpay"
import dotenv from "dotenv"

dotenv.config()
const instance = new RazorPay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const DELIVERY_FEE = 40
const FREE_DELIVERY_ABOVE = 500
const ASSIGNMENT_TIMEOUT_MS = 10 * 60 * 1000 // broadcasts expire after 10 minutes

// ---------- helpers ----------

const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// Validates a coupon against an amount and returns { discount } or throws-friendly error string
const evaluateCoupon = async (code, amount, userId) => {
    const coupon = await Coupon.findOne({ code: String(code || "").trim().toUpperCase() })
    if (!coupon || !coupon.isActive) {
        return { error: "Invalid or inactive coupon code." }
    }
    if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
        return { error: "This coupon has expired." }
    }
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
        return { error: "This coupon has reached its usage limit." }
    }
    if (amount < (coupon.minOrderAmount || 0)) {
        return { error: `Add items worth ₹${coupon.minOrderAmount - amount} more to use this coupon.` }
    }
    if (coupon.firstOrderOnly) {
        const pastOrders = await Order.countDocuments({ user: userId })
        if (pastOrders > 0) {
            return { error: "This coupon is only valid on your first order." }
        }
    }
    let discount = 0
    if (coupon.type === "percent") {
        discount = Math.round((amount * coupon.value) / 100)
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    } else {
        discount = coupon.value
    }
    discount = Math.min(discount, amount)
    return { discount, coupon }
}

// ---------- place order ----------

export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress, couponCode } = req.body

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ message: "Your cart is empty." })
        }
        if (!deliveryAddress || !deliveryAddress.text || deliveryAddress.latitude === undefined || deliveryAddress.longitude === undefined) {
            return res.status(400).json({ message: "Please provide a complete delivery address." })
        }

        // SECURITY: recompute everything from the database — never trust client prices
        const ids = cartItems.map(i => i.id)
        const dbItems = await Item.find({ _id: { $in: ids } }).populate("shop", "name owner")
        const itemMap = new Map(dbItems.map(i => [String(i._id), i]))

        const missing = cartItems.filter(ci => !itemMap.has(String(ci.id)))
        if (missing.length > 0) {
            return res.status(400).json({ message: "Some items in your cart are no longer available. Please refresh your cart." })
        }
        const unavailable = cartItems.filter(ci => itemMap.get(String(ci.id))?.isAvailable === false)
        if (unavailable.length > 0) {
            const names = unavailable.map(ci => itemMap.get(String(ci.id)).name).join(", ")
            return res.status(400).json({ message: `Currently unavailable: ${names}. Please remove them from your cart.` })
        }

        // Group validated items by shop using DB prices
        const groupByShop = {}
        for (const ci of cartItems) {
            const dbItem = itemMap.get(String(ci.id))
            const shopId = String(dbItem.shop._id)
            if (!groupByShop[shopId]) groupByShop[shopId] = []
            groupByShop[shopId].push({
                item: dbItem._id,
                name: dbItem.name,
                price: dbItem.price,
                quantity: Math.max(1, Number(ci.quantity) || 1)
            })
        }

        const shopOrders = Object.keys(groupByShop).map(shopId => {
            const items = groupByShop[shopId]
            const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
            return {
                shop: shopId,
                owner: dbItems.find(d => String(d.shop._id) === shopId)?.shop.owner,
                subtotal,
                shopOrderItems: items
            }
        })

        const subtotal = shopOrders.reduce((sum, so) => sum + so.subtotal, 0)
        const deliveryFee = subtotal > FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE

        // Coupon validation (server-side)
        let discountAmount = 0
        let appliedCode = ""
        if (couponCode) {
            const result = await evaluateCoupon(couponCode, subtotal, req.userId)
            if (result.error) {
                return res.status(400).json({ message: result.error })
            }
            discountAmount = result.discount
            appliedCode = result.coupon.code
        }

        const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount)

        if (paymentMethod === "online") {
            const razorOrder = await instance.orders.create({
                amount: Math.round(totalAmount * 100),
                currency: 'INR',
                receipt: `receipt_${Date.now()}`
            })
            const newOrder = await Order.create({
                user: req.userId,
                paymentMethod,
                deliveryAddress,
                subtotal,
                deliveryFee,
                discountAmount,
                couponCode: appliedCode,
                totalAmount,
                shopOrders,
                razorpayOrderId: razorOrder.id,
                payment: false
            })

            return res.status(200).json({
                razorOrder,
                orderId: newOrder._id,
                breakdown: { subtotal, deliveryFee, discountAmount, totalAmount }
            })
        }

        // Cash on delivery
        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            subtotal,
            deliveryFee,
            discountAmount,
            couponCode: appliedCode,
            totalAmount,
            shopOrders
        })

        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")
        await newOrder.populate("shopOrders.shop", "name")
        await newOrder.populate("shopOrders.owner", "fullName socketId")
        await newOrder.populate("user", "fullName email mobile")

        const io = req.app.get('io')

        if (io) {
            for (const shopOrder of newOrder.shopOrders) {
                io.to(`user:${String(shopOrder.owner?._id || shopOrder.owner)}`).emit('newOrder', {
                    _id: newOrder._id,
                    paymentMethod: newOrder.paymentMethod,
                    user: newOrder.user,
                    shopOrders: shopOrder,
                    createdAt: newOrder.createdAt,
                    deliveryAddress: newOrder.deliveryAddress,
                    payment: newOrder.payment
                })
                await pushNotification(io, {
                    userId: shopOrder.owner?._id || shopOrder.owner,
                    type: "order",
                    title: "New order received 🎉",
                    message: `${newOrder.user.fullName} placed an order of ₹${shopOrder.subtotal}.`,
                    orderId: newOrder._id
                })
            }
        }

        return res.status(201).json(newOrder)

    } catch (error) {
        console.error("[PLACE ORDER ERROR]", error.message)
        return res.status(500).json({ message: `Could not place order. ${error.message}` })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, orderId } = req.body
        const payment = await instance.payments.fetch(razorpay_payment_id)
        if (!payment || payment.status !== "captured") {
            return res.status(400).json({ message: "Payment was not captured." })
        }
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: "Order not found." })
        }
        // Ownership check
        if (String(order.user) !== String(req.userId)) {
            return res.status(403).json({ message: "You can only verify payments for your own orders." })
        }

        order.payment = true
        order.razorpayPaymentId = razorpay_payment_id
        await order.save()

        // Consume coupon usage now that payment succeeded
        if (order.couponCode) {
            await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } })
        }

        await order.populate("shopOrders.shopOrderItems.item", "name image price")
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.owner", "fullName socketId")
        await order.populate("user", "fullName email mobile")

        const io = req.app.get('io')

        if (io) {
            for (const shopOrder of order.shopOrders) {
                io.to(`user:${String(shopOrder.owner?._id || shopOrder.owner)}`).emit('newOrder', {
                    _id: order._id,
                    paymentMethod: order.paymentMethod,
                    user: order.user,
                    shopOrders: shopOrder,
                    createdAt: order.createdAt,
                    deliveryAddress: order.deliveryAddress,
                    payment: order.payment
                })
                await pushNotification(io, {
                    userId: shopOrder.owner?._id || shopOrder.owner,
                    type: "order",
                    title: "New paid order received 💳",
                    message: `${order.user.fullName} placed a paid order of ₹${shopOrder.subtotal}.`,
                    orderId: order._id
                })
            }
        }

        return res.status(200).json(order)

    } catch (error) {
        return res.status(500).json({ message: `Payment verification failed. ${error.message}` })
    }
}

// ---------- cart validation (checkout integrity) ----------

export const validateCart = async (req, res) => {
    try {
        const { cartItems } = req.body
        if (!cartItems || !Array.isArray(cartItems)) {
            return res.status(400).json({ message: "Invalid cart payload." })
        }
        const ids = cartItems.map(i => i.id)
        const dbItems = await Item.find({ _id: { $in: ids } }).select("name price isAvailable image shop foodType")
        const itemMap = new Map(dbItems.map(i => [String(i._id), i]))

        const lines = cartItems.map(ci => {
            const dbItem = itemMap.get(String(ci.id))
            if (!dbItem) {
                return { ...ci, exists: false, changed: true }
            }
            return {
                id: dbItem._id,
                name: dbItem.name,
                price: dbItem.price,
                quantity: ci.quantity,
                image: dbItem.image,
                shop: dbItem.shop,
                foodType: dbItem.foodType,
                isAvailable: dbItem.isAvailable,
                exists: true,
                changed: dbItem.price !== Number(ci.price) || dbItem.name !== ci.name
            }
        })

        return res.status(200).json({ items: lines })
    } catch (error) {
        return res.status(500).json({ message: `Could not validate cart. ${error.message}` })
    }
}

// ---------- my orders ----------

export const getMyOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        if (user.role === "user") {
            const orders = await Order.find({ user: req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "fullName email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")

            return res.status(200).json(orders)
        }

        if (user.role === "owner") {
            const orders = await Order.find({ "shopOrders.owner": req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("user", "fullName email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")

            const filteredOrders = orders.map(order => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                user: order.user,
                shopOrders: order.shopOrders.find(o => String(o.owner) === String(req.userId)),
                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress,
                payment: order.payment,
                subtotal: order.subtotal,
                deliveryFee: order.deliveryFee,
                discountAmount: order.discountAmount,
                couponCode: order.couponCode,
                totalAmount: order.totalAmount
            }))

            return res.status(200).json(filteredOrders)
        }

        // Delivery partner: their assigned deliveries (history)
        if (user.role === "deliveryBoy") {
            const orders = await Order.find({ "shopOrders.assignedDeliveryBoy": req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .lean()

            const formatted = []
            for (const order of orders) {
                const so = order.shopOrders.find(
                    s => s.assignedDeliveryBoy && String(s.assignedDeliveryBoy) === String(req.userId)
                )
                if (!so) continue
                formatted.push({
                    _id: order._id,
                    createdAt: order.createdAt,
                    paymentMethod: order.paymentMethod,
                    payment: order.payment,
                    deliveryAddress: order.deliveryAddress,
                    shopOrders: {
                        _id: so._id,
                        status: so.status,
                        subtotal: so.subtotal,
                        deliveredAt: so.deliveredAt,
                        cancelledAt: so.cancelledAt,
                        shop: so.shop,
                        shopOrderItems: so.shopOrderItems
                    }
                })
            }

            return res.status(200).json(formatted)
        }

        return res.status(403).json({ message: "Access denied for your role." })

    } catch (error) {
        return res.status(500).json({ message: `Could not load orders. ${error.message}` })
    }
}

// ---------- cancel order (customer) ----------

export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId)
        if (!order) {
            return res.status(404).json({ message: "Order not found." })
        }
        if (String(order.user) !== String(req.userId)) {
            return res.status(403).json({ message: "You can only cancel your own orders." })
        }

        const cancellable = ["pending", "preparing"]
        const notCancellable = order.shopOrders.filter(so => !cancellable.includes(so.status))
        if (notCancellable.length > 0) {
            return res.status(400).json({ message: "This order can no longer be cancelled. It is already being prepared for delivery." })
        }

        const io = req.app.get('io')

        for (const shopOrder of order.shopOrders) {
            shopOrder.status = "cancelled"
            shopOrder.cancelledAt = Date.now()

            // Release any broadcast/assignment tied to this shop order
            if (shopOrder.assignment) {
                await DeliveryAssignment.updateOne(
                    { _id: shopOrder.assignment, status: { $in: ["brodcasted"] } },
                    { status: "cancelled" }
                )
            }
            await pushNotification(io, {
                userId: shopOrder.owner,
                type: "order",
                title: "Order cancelled",
                message: `The customer cancelled their order of ₹${shopOrder.subtotal}.`,
                orderId: order._id
            })
        }

        order.cancelledAt = Date.now()
        await order.save()

        await order.populate("shopOrders.shopOrderItems.item", "name image price")
        await order.populate("shopOrders.shop", "name")

        return res.status(200).json(order)

    } catch (error) {
        return res.status(500).json({ message: `Could not cancel order. ${error.message}` })
    }
}

// ---------- owner analytics ----------

export const getOwnerStats = async (req, res) => {
    try {
        const orders = await Order.find({ "shopOrders.owner": req.userId })
            .select("shopOrders createdAt paymentMethod")
            .lean()

        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0)
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

        let totalRevenue = 0, todayRevenue = 0, weekRevenue = 0, monthRevenue = 0
        let pending = 0, completed = 0, cancelled = 0, active = 0
        const itemCounts = {}
        const dayBuckets = {}

        for (const order of orders) {
            for (const so of order.shopOrders) {
                if (String(so.owner) !== String(req.userId)) continue

                switch (so.status) {
                    case "delivered":
                        completed++
                        totalRevenue += so.subtotal || 0
                        if (so.deliveredAt) {
                            if (so.deliveredAt >= startOfDay) todayRevenue += so.subtotal || 0
                            if (so.deliveredAt.getTime() >= weekAgo) weekRevenue += so.subtotal || 0
                            if (so.deliveredAt.getTime() >= monthAgo) monthRevenue += so.subtotal || 0
                        }
                        break
                    case "cancelled": cancelled++; break
                    case "pending":
                    case "preparing":
                    case "out of delivery": active++; pending++; break
                    default: break
                }

                for (const line of (so.shopOrderItems || [])) {
                    const key = line.name || "Unknown"
                    itemCounts[key] = (itemCounts[key] || 0) + (line.quantity || 1)
                }
            }
        }

        // Weekly revenue chart (last 7 days, oldest → newest)
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        const weekly = []
        for (let d = 6; d >= 0; d--) {
            const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0)
            dayStart.setDate(dayStart.getDate() - d)
            const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1)
            let revenue = 0
            for (const order of orders) {
                for (const so of order.shopOrders) {
                    if (String(so.owner) !== String(req.userId)) continue
                    if (so.status === "delivered" && so.deliveredAt &&
                        so.deliveredAt >= dayStart && so.deliveredAt < dayEnd) {
                        revenue += so.subtotal || 0
                    }
                }
            }
            weekly.push({ day: dayNames[dayStart.getDay()], revenue })
        }

        const topItems = Object.entries(itemCounts)
            .map(([name, qty]) => ({ name, qty }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5)

        const totalOrders = completed + cancelled + active
        const completionRate = totalOrders > 0 ? Math.round((completed / totalOrders) * 100) : 0

        return res.status(200).json({
            totalRevenue, todayRevenue, weekRevenue, monthRevenue,
            pending, completed, cancelled, active, totalOrders,
            completionRate, topItems, weekly
        })

    } catch (error) {
        return res.status(500).json({ message: `Could not load stats. ${error.message}` })
    }
}

// ---------- owner: update status + smart delivery broadcast ----------

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params
        const { status } = req.body
        const allowed = ["pending", "preparing", "out of delivery"]
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Invalid status value." })
        }

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: "Order not found." })
        }

        const shopOrder = order.shopOrders.find(o => String(o.shop) === String(shopId))
        if (!shopOrder) {
            return res.status(404).json({ message: "Shop order not found." })
        }
        // Authorization: only the owning shop can update
        if (String(shopOrder.owner) !== String(req.userId)) {
            return res.status(403).json({ message: "You can only update orders for your own shop." })
        }
        if (["delivered", "cancelled"].includes(shopOrder.status)) {
            return res.status(400).json({ message: `This order is already ${shopOrder.status}.` })
        }

        shopOrder.status = status
        let deliveryBoysPayload = []

        if (status === "out of delivery" && !shopOrder.assignment) {
            const { longitude, latitude } = order.deliveryAddress
            const nearByDeliveryBoys = await User.find({
                role: "deliveryBoy",
                location: {
                    $near: {
                        $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
                        $maxDistance: 5000
                    }
                }
            })

            const nearByIds = nearByDeliveryBoys.map(b => b._id)
            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearByIds },
                status: { $nin: ["brodcasted", "completed", "cancelled"] }
            }).distinct("assignedTo")

            const busyIdSet = new Set(busyIds.map(id => String(id)))
            const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)))
            const candidates = availableBoys.map(b => b._id)

            if (candidates.length === 0) {
                await order.save()
                return res.json({
                    message: "Status updated, but no delivery partners are nearby right now.",
                    shopOrder,
                    assignedDeliveryBoy: null,
                    availableBoys: [],
                    assignment: null
                })
            }

            const deliveryAssignment = await DeliveryAssignment.create({
                order: order._id,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                brodcastedTo: candidates,
                status: "brodcasted"
            })

            shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo
            shopOrder.assignment = deliveryAssignment._id
            deliveryBoysPayload = availableBoys.map(b => ({
                id: b._id,
                fullName: b.fullName,
                longitude: b.location.coordinates?.[0],
                latitude: b.location.coordinates?.[1],
                mobile: b.mobile
            }))

            await deliveryAssignment.populate('order')
            await deliveryAssignment.populate('shop')
            const io = req.app.get('io')
            if (io) {
                for (const boy of availableBoys) {
                    const targetShopOrder = deliveryAssignment.order.shopOrders.find(
                        so => String(so._id) === String(deliveryAssignment.shopOrderId)
                    )
                    io.to(`user:${String(boy._id)}`).emit('newAssignment', {
                        sentTo: boy._id,
                        assignmentId: deliveryAssignment._id,
                        orderId: deliveryAssignment.order._id,
                        shopName: deliveryAssignment.shop.name,
                        deliveryAddress: deliveryAssignment.order.deliveryAddress,
                        items: targetShopOrder?.shopOrderItems || [],
                        subtotal: targetShopOrder?.subtotal
                    })
                    await pushNotification(io, {
                        userId: boy._id,
                        type: "delivery",
                        title: "New delivery request 🛵",
                        message: `Pickup from ${deliveryAssignment.shop.name} · ₹${targetShopOrder?.subtotal || 0}`,
                        orderId: deliveryAssignment.order._id
                    })
                }
            }
        }

        await order.save()

        const updatedShopOrder = order.shopOrders.find(o => String(o.shop) === String(shopId))
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile")
        await order.populate("user", "socketId")

        const io = req.app.get('io')
        if (io) {
            io.to(`user:${String(order.user._id)}`).emit('update-status', {
                orderId: order._id,
                shopId: updatedShopOrder.shop._id,
                status: updatedShopOrder.status,
                userId: order.user._id
            })

            const messages = {
                "preparing": { title: "Your food is being prepared 👨‍🍳", message: `${updatedShopOrder.shop.name} started preparing your order.` },
                "out of delivery": { title: "Out for delivery 🛵", message: `Your order from ${updatedShopOrder.shop.name} is on its way!` }
            }
            const msg = messages[status]
            if (msg) {
                await pushNotification(io, {
                    userId: order.user._id,
                    type: "order",
                    title: msg.title,
                    message: msg.message,
                    orderId: order._id
                })
            }
        }

        return res.status(200).json({
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
            availableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder?.assignment?._id
        })

    } catch (error) {
        return res.status(500).json({ message: `Could not update status. ${error.message}` })
    }
}

// ---------- delivery partner flows ----------

export const getDeliveryBoyAssignment = async (req, res) => {
    try {
        const deliveryBoyId = req.userId

        // Expire stale broadcasts (older than timeout) and release them back to the owner
        const cutoff = new Date(Date.now() - ASSIGNMENT_TIMEOUT_MS)
        const stale = await DeliveryAssignment.find({ status: "brodcasted", createdAt: { $lt: cutoff } })
            .limit(50)
        for (const a of stale) {
            a.status = "cancelled"
            await a.save()
            await Order.updateOne(
                { _id: a.order, "shopOrders._id": a.shopOrderId },
                { $set: { "shopOrders.$.assignment": null, "shopOrders.$.assignedDeliveryBoy": null } }
            )
        }

        const assignments = await DeliveryAssignment.find({
            brodcastedTo: deliveryBoyId,
            status: "brodcasted"
        })
            .populate("order")
            .populate("shop")

        const formatted = assignments
            .filter(a => a.order)
            .map(a => {
                const targetShopOrder = a.order.shopOrders.find(so => String(so._id) === String(a.shopOrderId))
                return {
                    assignmentId: a._id,
                    orderId: a.order._id,
                    shopName: a.shop?.name,
                    deliveryAddress: a.order.deliveryAddress,
                    items: targetShopOrder?.shopOrderItems || [],
                    subtotal: targetShopOrder?.subtotal
                }
            })

        return res.status(200).json(formatted)
    } catch (error) {
        return res.status(500).json({ message: `Could not load assignments. ${error.message}` })
    }
}

export const acceptOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params
        const assignment = await DeliveryAssignment.findById(assignmentId)
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found." })
        }
        if (assignment.status !== "brodcasted") {
            return res.status(400).json({ message: "This assignment is no longer available." })
        }

        // Prevent conflicting assignments
        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: { $nin: ["brodcasted", "completed", "cancelled"] }
        })
        if (alreadyAssigned) {
            return res.status(400).json({ message: "Finish your current delivery before accepting another." })
        }

        assignment.assignedTo = req.userId
        assignment.status = 'assigned'
        assignment.acceptedAt = new Date()
        await assignment.save()

        const order = await Order.findById(assignment.order)
        if (!order) {
            return res.status(404).json({ message: "Order not found." })
        }

        const shopOrder = order.shopOrders.id(assignment.shopOrderId)
        if (!shopOrder) {
            return res.status(404).json({ message: "Shop order not found." })
        }
        shopOrder.assignedDeliveryBoy = req.userId
        await order.save()

        const deliveryBoy = await User.findById(req.userId).select("fullName mobile")
        const io = req.app.get('io')

        await pushNotification(io, {
            userId: shopOrder.owner,
            type: "delivery",
            title: "Delivery partner assigned ✅",
            message: `${deliveryBoy.fullName} (${deliveryBoy.mobile}) accepted the delivery.`,
            orderId: order._id
        })
        await pushNotification(io, {
            userId: order.user,
            type: "order",
            title: "Delivery partner assigned 🛵",
            message: `${deliveryBoy.fullName} will deliver your order.`,
            orderId: order._id
        })

        return res.status(200).json({ message: 'Order accepted' })
    } catch (error) {
        return res.status(500).json({ message: `Could not accept order. ${error.message}` })
    }
}

export const getCurrentOrder = async (req, res) => {
    try {
        const assignment = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: "assigned"
        })
            .populate("shop", "name")
            .populate("assignedTo", "fullName email mobile location")
            .populate({
                path: "order",
                populate: [{ path: "user", select: "fullName email location mobile" }]
            })

        if (!assignment || !assignment.order) {
            return res.status(200).json(null)
        }

        const shopOrder = assignment.order.shopOrders.find(so => String(so._id) === String(assignment.shopOrderId))
        if (!shopOrder) {
            return res.status(200).json(null)
        }

        let deliveryBoyLocation = { lat: null, lon: null }
        if (assignment.assignedTo?.location?.coordinates?.length === 2) {
            deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1]
            deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0]
        }

        let customerLocation = { lat: null, lon: null }
        if (assignment.order.deliveryAddress) {
            customerLocation.lat = assignment.order.deliveryAddress.latitude
            customerLocation.lon = assignment.order.deliveryAddress.longitude
        }

        return res.status(200).json({
            _id: assignment.order._id,
            user: assignment.order.user,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation
        })

    } catch (error) {
        return res.status(500).json({ message: `Could not load current order. ${error.message}` })
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params
        const order = await Order.findById(orderId)
            .populate("user")
            .populate({
                path: "shopOrders.shop",
                model: "Shop"
            })
            .populate({
                path: "shopOrders.assignedDeliveryBoy",
                model: "User"
            })
            .populate({
                path: "shopOrders.shopOrderItems.item",
                model: "Item"
            })
            .lean()

        if (!order) {
            return res.status(404).json({ message: "Order not found." })
        }

        // Authorization: customer, involved owner, or assigned delivery partner only
        const me = await User.findById(req.userId).select("role").lean()
        const isCustomer = String(order.user?._id) === String(req.userId)
        const isOwner = me?.role === "owner" && order.shopOrders.some(so => String(so.owner) === String(req.userId))
        const isPartner = me?.role === "deliveryBoy" && order.shopOrders.some(so =>
            so.assignedDeliveryBoy && String(so.assignedDeliveryBoy._id || so.assignedDeliveryBoy) === String(req.userId)
        )
        if (!isCustomer && !isOwner && !isPartner) {
            return res.status(403).json({ message: "You don't have access to this order." })
        }

        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `Could not load order. ${error.message}` })
    }
}

export const sendDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body
        const order = await Order.findById(orderId).populate("user")
        if (!order) {
            return res.status(404).json({ message: "Order not found." })
        }
        const shopOrder = order.shopOrders.id(shopOrderId)
        if (!shopOrder) {
            return res.status(404).json({ message: "Shop order not found." })
        }
        // Only the assigned delivery partner can trigger OTP
        if (String(shopOrder.assignedDeliveryBoy) !== String(req.userId)) {
            return res.status(403).json({ message: "Only the assigned delivery partner can do this." })
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        shopOrder.deliveryOtp = otp
        shopOrder.otpExpires = Date.now() + 5 * 60 * 1000
        await order.save()
        await sendDeliveryOtpMail(order.user, otp)
        return res.status(200).json({ message: `OTP sent successfully to ${order.user?.fullName}` })
    } catch (error) {
        console.error("[SEND DELIVERY OTP ERROR]", error.message)
        return res.status(500).json({ message: `Could not send OTP. ${error.message}` })
    }
}

export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId, otp } = req.body
        const order = await Order.findById(orderId).populate("user")
        if (!order) {
            return res.status(404).json({ message: "Order not found." })
        }
        const shopOrder = order.shopOrders.id(shopOrderId)
        if (!shopOrder) {
            return res.status(404).json({ message: "Shop order not found." })
        }
        if (String(shopOrder.assignedDeliveryBoy) !== String(req.userId)) {
            return res.status(403).json({ message: "Only the assigned delivery partner can verify this OTP." })
        }
        if (shopOrder.deliveryOtp !== String(otp) || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP." })
        }

        shopOrder.status = "delivered"
        shopOrder.deliveredAt = Date.now()
        shopOrder.deliveryOtp = null
        shopOrder.otpExpires = null
        await order.save()

        // Mark assignment completed (keep record instead of deleting)
        await DeliveryAssignment.updateOne(
            { shopOrderId: shopOrder._id, order: order._id },
            { status: "completed" }
        )

        const io = req.app.get('io')
        await pushNotification(io, {
            userId: order.user,
            type: "order",
            title: "Order delivered 🎉",
            message: "Enjoy your meal! Don't forget to rate your food.",
            orderId: order._id
        })
        await pushNotification(io, {
            userId: shopOrder.owner,
            type: "order",
            title: "Order completed ✅",
            message: `Delivery confirmed for ₹${shopOrder.subtotal}.`,
            orderId: order._id
        })

        return res.status(200).json({ message: "Order Delivered Successfully!" })

    } catch (error) {
        return res.status(500).json({ message: `Could not verify OTP. ${error.message}` })
    }
}

export const getTodayDeliveries = async (req, res) => {
    try {
        const deliveryBoyId = req.userId
        const startsOfDay = new Date()
        startsOfDay.setHours(0, 0, 0, 0)

        const orders = await Order.find({
            "shopOrders.assignedDeliveryBoy": deliveryBoyId,
            "shopOrders.status": "delivered",
            "shopOrders.deliveredAt": { $gte: startsOfDay }
        }).lean()

        let todaysDeliveries = []

        orders.forEach(order => {
            order.shopOrders.forEach(shopOrder => {
                if (String(shopOrder.assignedDeliveryBoy) === String(deliveryBoyId) &&
                    shopOrder.status === "delivered" &&
                    shopOrder.deliveredAt &&
                    shopOrder.deliveredAt >= startsOfDay
                ) {
                    todaysDeliveries.push(shopOrder)
                }
            })
        })

        let stats = {}
        todaysDeliveries.forEach(shopOrder => {
            const hour = new Date(shopOrder.deliveredAt).getHours()
            stats[hour] = (stats[hour] || 0) + 1
        })

        let formattedStats = Object.keys(stats).map(hour => ({
            hour: parseInt(hour),
            count: stats[hour]
        }))

        formattedStats.sort((a, b) => a.hour - b.hour)

        return res.status(200).json(formattedStats)

    } catch (error) {
        return res.status(500).json({ message: `Could not load deliveries. ${error.message}` })
    }
}