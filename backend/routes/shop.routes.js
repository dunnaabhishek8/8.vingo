import express from "express"
import { createEditShop, getMyShop, getShopByCity } from "../controllers/shop.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import requireRole from "../middlewares/requireRole.js"
import { upload } from "../middlewares/multer.js"


const shopRouter = express.Router()

shopRouter.post("/create-edit", isAuth, requireRole("owner"), upload.single("image"), createEditShop)
shopRouter.get("/get-my", isAuth, requireRole("owner"), getMyShop)
shopRouter.get("/get-by-city/:city", isAuth, getShopByCity)

export default shopRouter