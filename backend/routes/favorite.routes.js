import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { getMyFavorites, toggleFavorite } from "../controllers/favorite.controllers.js"

const favoriteRouter = express.Router()

favoriteRouter.post("/toggle/:itemId", isAuth, toggleFavorite)
favoriteRouter.get("/my", isAuth, getMyFavorites)

export default favoriteRouter