import express from "express"
import isAuth from "../middlewares/isAuth.js"
import requireRole from "../middlewares/requireRole.js"
import {
    acceptOrder,
    cancelOrder,
    getCurrentOrder,
    getDeliveryBoyAssignment,
    getMyOrders,
    getOrderById,
    getOwnerStats,
    getTodayDeliveries,
    placeOrder,
    sendDeliveryOtp,
    updateOrderStatus,
    validateCart,
    verifyDeliveryOtp,
    verifyPayment
} from "../controllers/order.controllers.js"



const orderRouter = express.Router()

// Customer
orderRouter.post("/place-order", isAuth, requireRole("user"), placeOrder)
orderRouter.post("/verify-payment", isAuth, requireRole("user"), verifyPayment)
orderRouter.post("/validate-cart", isAuth, requireRole("user"), validateCart)
orderRouter.post("/cancel/:orderId", isAuth, requireRole("user"), cancelOrder)
orderRouter.get("/my-orders", isAuth, getMyOrders)
orderRouter.get('/get-order-by-id/:orderId', isAuth, getOrderById)

// Owner
orderRouter.post("/update-status/:orderId/:shopId", isAuth, requireRole("owner"), updateOrderStatus)
orderRouter.get('/owner-stats', isAuth, requireRole("owner"), getOwnerStats)

// Delivery partner
orderRouter.get("/get-assignments", isAuth, requireRole("deliveryBoy"), getDeliveryBoyAssignment)
orderRouter.get("/accept-order/:assignmentId", isAuth, requireRole("deliveryBoy"), acceptOrder)
orderRouter.get("/get-current-order", isAuth, requireRole("deliveryBoy"), getCurrentOrder)
orderRouter.post("/send-delivery-otp", isAuth, requireRole("deliveryBoy"), sendDeliveryOtp)
orderRouter.post("/verify-delivery-otp", isAuth, requireRole("deliveryBoy"), verifyDeliveryOtp)
orderRouter.get('/get-today-deliveries', isAuth, requireRole("deliveryBoy"), getTodayDeliveries)

export default orderRouter