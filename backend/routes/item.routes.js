import express from "express"

import isAuth from "../middlewares/isAuth.js"
import requireRole from "../middlewares/requireRole.js"
import {
    addItem,
    deleteItem,
    editItem,
    getItemByCity,
    getItemById,
    getItemsByShop,
    getRecommendations,
    searchItems,
    toggleAvailability
} from "../controllers/item.controllers.js"
import { upload } from "../middlewares/multer.js"


const itemRouter = express.Router()

itemRouter.post("/add-item", isAuth, requireRole("owner"), upload.single("image"), addItem)
itemRouter.post("/edit-item/:itemId", isAuth, requireRole("owner"), upload.single("image"), editItem)
itemRouter.post("/toggle-availability/:itemId", isAuth, requireRole("owner"), toggleAvailability)
itemRouter.delete("/delete/:itemId", isAuth, requireRole("owner"), deleteItem)
itemRouter.get("/get-by-id/:itemId", isAuth, getItemById)
itemRouter.get("/get-by-city/:city", isAuth, getItemByCity)
itemRouter.get("/get-by-shop/:shopId", isAuth, getItemsByShop)
itemRouter.get("/search-items", isAuth, searchItems)
itemRouter.get("/recommendations/:city", isAuth, getRecommendations)

export default itemRouter