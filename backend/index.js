import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js"

import itemRouter from "./routes/item.routes.js"
import shopRouter from "./routes/shop.routes.js"
import orderRouter from "./routes/order.routes.js"
import couponRouter from "./routes/coupon.routes.js"
import reviewRouter from "./routes/review.routes.js"
import notificationRouter from "./routes/notification.routes.js"
import favoriteRouter from "./routes/favorite.routes.js"
import http from "http"
import { Server } from "socket.io"
import { socketHandler } from "./socket.js"
import { notFound, errorHandler } from "./middlewares/errorHandler.js"
import { sanitizeBody } from "./middlewares/sanitize.js"


const app = express()

const server = http.createServer(app)

// Client origin comes from env (CLIENT_URL) with a localhost fallback —
// no .env changes required; set CLIENT_URL when you deploy.
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"

const io = new Server(server, {
    cors: {
        origin: clientUrl,
        credentials: true,
        methods: ['POST', 'GET']
    }
})

app.set("io", io)

const port = process.env.PORT || 5000
app.use(cors({
    origin: clientUrl,
    credentials: true
}))
app.use(express.json({ limit: "1mb" }))
app.use(cookieParser())

// Basic security headers (dependency-free)
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.setHeader("X-Frame-Options", "DENY")
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")
    next()
})

// Strip MongoDB operator keys from user input
app.use(sanitizeBody)

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/shop", shopRouter)
app.use("/api/item", itemRouter)
app.use("/api/order", orderRouter)
app.use("/api/coupon", couponRouter)
app.use("/api/review", reviewRouter)
app.use("/api/notification", notificationRouter)
app.use("/api/favorite", favoriteRouter)

// 404 + centralized error handler (must be last)
app.use(notFound)
app.use(errorHandler)

socketHandler(io);
server.listen(port, () => {
    connectDb()
    console.log(`server started at ${port}`)
})