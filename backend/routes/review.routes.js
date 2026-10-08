import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { createReview, getItemReviews, getShopReviews } from "../controllers/review.controllers.js"

const reviewRouter = express.Router()

reviewRouter.post("/", isAuth, createReview)
reviewRouter.get("/item/:itemId", isAuth, getItemReviews)
reviewRouter.get("/shop/:shopId", isAuth, getShopReviews)

export default reviewRouter