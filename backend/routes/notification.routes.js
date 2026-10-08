import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { getMyNotifications, markNotificationsRead } from "../controllers/notification.controllers.js"

const notificationRouter = express.Router()

notificationRouter.get("/my", isAuth, getMyNotifications)
notificationRouter.post("/mark-read", isAuth, markNotificationsRead)

export default notificationRouter