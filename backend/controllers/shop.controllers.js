import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop = async (req, res) => {
    try {
       const { name, city, state, address } = req.body
       if (!name || !city || !state || !address) {
           return res.status(400).json({ message: "Name, city, state and address are required." })
       }

       let image;
       if (req.file) {
           image = await uploadOnCloudinary(req.file.path)
       }

       let shop = await Shop.findOne({ owner: req.userId })
       if (!shop) {
           if (!image) {
               return res.status(400).json({ message: "Please add a shop image to get started." })
           }
           shop = await Shop.create({
               name, city, state, address, image, owner: req.userId
           })
       } else {
           const update = { name, city, state, address }
           if (image) update.image = image
           shop = await Shop.findByIdAndUpdate(shop._id, update, { new: true })
       }

       await shop.populate("owner items")
       return res.status(201).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `Could not save shop. ${error.message}` })
    }
}

export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId }).populate("owner").populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        // Always respond — null means "no shop yet" (fixes previously hanging request)
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `Could not load your shop. ${error.message}` })
    }
}

export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params
        if (!city) {
            return res.status(400).json({ message: "City is required." })
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${String(city).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }
        }).populate('items')
        return res.status(200).json(shops)
    } catch (error) {
        return res.status(500).json({ message: `Could not load shops. ${error.message}` })
    }
}