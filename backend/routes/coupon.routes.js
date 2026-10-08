import express from "express"
import isAuth from "../middlewares/isAuth.js"
import requireRole from "../middlewares/requireRole.js"
import { applyCoupon, createCoupon, getActiveCoupons } from "../controllers/coupon.controllers.js"

const couponRouter = express.Router()

couponRouter.post("/apply", isAuth, applyCoupon)
couponRouter.get("/active", isAuth, getActiveCoupons)
couponRouter.post("/create", isAuth, requireRole("owner"), createCoupon)

export default couponRouter