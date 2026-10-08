import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

// ---------- Owner item management ----------

export const addItem = async (req, res) => {
    try {
        const { name, category, foodType, price, description } = req.body
        if (!name || !category || !foodType || price === undefined || price === "") {
            return res.status(400).json({ message: "Name, category, food type and price are required." })
        }
        const numericPrice = Number(price)
        if (Number.isNaN(numericPrice) || numericPrice < 0) {
            return res.status(400).json({ message: "Price must be a positive number." })
        }

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }
        const shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            return res.status(400).json({ message: "Create your shop before adding items." })
        }

        const item = await Item.create({
            name,
            category,
            foodType,
            price: numericPrice,
            description: String(description || "").slice(0, 500),
            image,
            shop: shop._id
        })

        shop.items.push(item._id)
        await shop.save()
        await shop.populate("owner")
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(201).json(shop)

    } catch (error) {
        return res.status(500).json({ message: `Could not add item. ${error.message}` })
    }
}

export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const { name, category, foodType, price, description } = req.body

        // Ownership check: item must belong to the requesting owner's shop
        const existingItem = await Item.findById(itemId)
        if (!existingItem) {
            return res.status(404).json({ message: "Item not found." })
        }
        const myShop = await Shop.findOne({ owner: req.userId })
        if (!myShop || String(existingItem.shop) !== String(myShop._id)) {
            return res.status(403).json({ message: "You can only edit items from your own shop." })
        }

        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }

        const update = {}
        if (name !== undefined) update.name = name
        if (category !== undefined) update.category = category
        if (foodType !== undefined) update.foodType = foodType
        if (price !== undefined && price !== "") {
            const numericPrice = Number(price)
            if (Number.isNaN(numericPrice) || numericPrice < 0) {
                return res.status(400).json({ message: "Price must be a positive number." })
            }
            update.price = numericPrice
        }
        if (description !== undefined) update.description = String(description || "").slice(0, 500)
        if (image) update.image = image

        await Item.findByIdAndUpdate(itemId, update, { new: true })

        const shop = await Shop.findOne({ owner: req.userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(200).json(shop)

    } catch (error) {
        return res.status(500).json({ message: `Could not edit item. ${error.message}` })
    }
}

export const toggleAvailability = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findById(itemId)
        if (!item) {
            return res.status(404).json({ message: "Item not found." })
        }
        const myShop = await Shop.findOne({ owner: req.userId })
        if (!myShop || String(item.shop) !== String(myShop._id)) {
            return res.status(403).json({ message: "You can only manage your own items." })
        }
        item.isAvailable = !item.isAvailable
        await item.save()
        const shop = await Shop.findOne({ owner: req.userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `Could not update availability. ${error.message}` })
    }
}

export const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findById(itemId).populate("shop", "name city address")
        if (!item) {
            return res.status(404).json({ message: "Item not found." })
        }
        return res.status(200).json(item)
    } catch (error) {
        return res.status(500).json({ message: `Could not fetch item. ${error.message}` })
    }
}

export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findById(itemId)
        if (!item) {
            return res.status(404).json({ message: "Item not found." })
        }
        const myShop = await Shop.findOne({ owner: req.userId })
        if (!myShop || String(item.shop) !== String(myShop._id)) {
            return res.status(403).json({ message: "You can only delete items from your own shop." })
        }

        await Item.findByIdAndDelete(itemId)
        myShop.items = myShop.items.filter(i => String(i) !== String(item._id))
        await myShop.save()
        await myShop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(200).json(myShop)

    } catch (error) {
        return res.status(500).json({ message: `Could not delete item. ${error.message}` })
    }
}

// ---------- Discovery ----------

export const getItemByCity = async (req, res) => {
    try {
        const { city } = req.params
        if (!city) {
            return res.status(400).json({ message: "City is required." })
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }
        }).select("_id")
        const shopIds = shops.map((shop) => shop._id)
        const items = await Item.find({ shop: { $in: shopIds }, isAvailable: true })
            .populate("shop", "name")
        return res.status(200).json(items)

    } catch (error) {
        return res.status(500).json({ message: `Could not fetch items. ${error.message}` })
    }
}

export const getItemsByShop = async (req, res) => {
    try {
        const { shopId } = req.params
        const shop = await Shop.findById(shopId).populate({
            path: "items",
            options: { sort: { createdAt: -1 } }
        })
        if (!shop) {
            return res.status(404).json({ message: "Shop not found." })
        }
        return res.status(200).json({
            shop,
            items: shop.items
        })
    } catch (error) {
        return res.status(500).json({ message: `Could not fetch shop items. ${error.message}` })
    }
}

// Advanced search with filters, sorting and pagination.
// Query params: query, city, category, foodType, minPrice, maxPrice, minRating,
//               sort=rating|price_asc|price_desc|popular|newest, page, limit
export const searchItems = async (req, res) => {
    try {
        const { query, city } = req.query
        if (!query || !city) {
            return res.status(400).json({ message: "Search text and city are required." })
        }

        const page = Math.max(1, parseInt(req.query.page) || 1)
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12))
        const skip = (page - 1) * limit

        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${String(city).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }
        }).select("_id")
        const shopIds = shops.map(s => s._id)

        const filter = {
            shop: { $in: shopIds },
            isAvailable: true,
            $or: [
                { name: { $regex: String(query), $options: "i" } },
                { category: { $regex: String(query), $options: "i" } }
            ]
        }

        if (req.query.category) filter.category = req.query.category
        if (req.query.foodType && ["veg", "non veg"].includes(req.query.foodType)) {
            filter.foodType = req.query.foodType
        }
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {}
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice) || 0
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice) || 999999
        }
        if (req.query.minRating) {
            filter["rating.average"] = { $gte: Number(req.query.minRating) || 0 }
        }

        let sortOption = { createdAt: -1 }
        switch (req.query.sort) {
            case "rating": sortOption = { "rating.average": -1, "rating.count": -1 }; break
            case "price_asc": sortOption = { price: 1 }; break
            case "price_desc": sortOption = { price: -1 }; break
            case "newest": sortOption = { createdAt: -1 }; break
            default: break // popular keeps newest; popularity ranking handled by recommendations endpoint
        }

        const [items, total] = await Promise.all([
            Item.find(filter).sort(sortOption).skip(skip).limit(limit).populate("shop", "name"),
            Item.countDocuments(filter)
        ])

        return res.status(200).json({
            items,
            total,
            page,
            pages: Math.ceil(total / limit)
        })

    } catch (error) {
        return res.status(500).json({ message: `Search failed. ${error.message}` })
    }
}

// Rule-based recommendations for a city:
//  - topRated: highest rated items with at least one review
//  - popular: most ordered items (aggregated from delivered orders)
export const getRecommendations = async (req, res) => {
    try {
        const { city } = req.params
        if (!city) {
            return res.status(400).json({ message: "City is required." })
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${String(city).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }
        }).select("_id")
        const shopIds = shops.map(s => s._id)

        const topRated = await Item.find({
            shop: { $in: shopIds },
            isAvailable: true,
            "rating.count": { $gt: 0 }
        })
            .sort({ "rating.average": -1, "rating.count": -1 })
            .limit(8)
            .populate("shop", "name")

        const popularAgg = await Order.aggregate([
            { $unwind: "$shopOrders" },
            { $match: { "shopOrders.shop": { $in: shopIds }, "shopOrders.status": "delivered" } },
            { $unwind: "$shopOrders.shopOrderItems" },
            {
                $group: {
                    _id: "$shopOrders.shopOrderItems.item",
                    orderCount: { $sum: "$shopOrders.shopOrderItems.quantity" }
                }
            },
            { $sort: { orderCount: -1 } },
            { $limit: 8 }
        ])
        const popularIds = popularAgg.map(p => p._id).filter(Boolean)
        let popular = []
        if (popularIds.length > 0) {
            const popularDocs = await Item.find({ _id: { $in: popularIds }, isAvailable: true }).populate("shop", "name")
            // preserve aggregate ordering
            popular = popularIds
                .map(id => popularDocs.find(d => String(d._id) === String(id)))
                .filter(Boolean)
        }

        return res.status(200).json({ topRated, popular })

    } catch (error) {
        return res.status(500).json({ message: `Could not load recommendations. ${error.message}` })
    }
}