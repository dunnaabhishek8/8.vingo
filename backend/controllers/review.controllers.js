import Review from "../models/review.model.js"
import Item from "../models/item.model.js"
import Order from "../models/order.model.js"

// Recalculate an item's rating aggregate from its reviews
const refreshItemRating = async (itemId) => {
    const stats = await Review.aggregate([
        { $match: { item: itemId } },
        { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } }
    ])
    const average = stats.length > 0 ? Math.round(stats[0].average * 10) / 10 : 0
    const count = stats.length > 0 ? stats[0].count : 0
    await Item.findByIdAndUpdate(itemId, { rating: { average, count } })
}

// Create a review — only after the item was delivered in this order.
// Duplicate reviews for the same order+item are blocked by a unique DB index.
export const createReview = async (req, res) => {
    try {
        const { itemId, orderId, rating, text } = req.body

        if (!itemId || !orderId || !rating) {
            return res.status(400).json({ message: "Item, order and rating are required." })
        }
        const numericRating = Number(rating)
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5." })
        }

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: "Order not found." })
        }
        if (String(order.user) !== String(req.userId)) {
            return res.status(403).json({ message: "You can only review your own orders." })
        }

        // The item must exist inside this order AND be delivered
        let shopId = null
        let delivered = false
        for (const so of order.shopOrders) {
            const line = so.shopOrderItems.find(li => String(li.item) === String(itemId))
            if (line) {
                shopId = so.shop
                delivered = so.status === "delivered"
                break
            }
        }
        if (!shopId) {
            return res.status(400).json({ message: "This item is not part of the given order." })
        }
        if (!delivered) {
            return res.status(400).json({ message: "You can review an item only after it has been delivered." })
        }

        try {
            const review = await Review.create({
                user: req.userId,
                item: itemId,
                order: orderId,
                shop: shopId,
                rating: numericRating,
                text: String(text || "").slice(0, 500)
            })
            await review.populate("user", "fullName")
            await refreshItemRating(itemId)
            return res.status(201).json(review)
        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).json({ message: "You have already reviewed this item for this order." })
            }
            throw err
        }

    } catch (error) {
        return res.status(500).json({ message: `Could not submit review. ${error.message}` })
    }
}

export const getItemReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ item: req.params.itemId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("user", "fullName")
        return res.status(200).json(reviews)
    } catch (error) {
        return res.status(500).json({ message: `Could not load reviews. ${error.message}` })
    }
}

export const getShopReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ shop: req.params.shopId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user", "fullName")
            .populate("item", "name image")
        return res.status(200).json(reviews)
    } catch (error) {
        return res.status(500).json({ message: `Could not load reviews. ${error.message}` })
    }
}