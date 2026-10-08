import Favorite from "../models/favorite.model.js"

// Toggle favorite state for an item; returns the new state
export const toggleFavorite = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const existing = await Favorite.findOne({ user: req.userId, item: itemId })

        if (existing) {
            await Favorite.deleteOne({ _id: existing._id })
            return res.status(200).json({ favorited: false })
        }

        await Favorite.create({ user: req.userId, item: itemId })
        return res.status(200).json({ favorited: true })
    } catch (error) {
        return res.status(500).json({ message: `Could not update favorites. ${error.message}` })
    }
}

export const getMyFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ user: req.userId })
            .sort({ createdAt: -1 })
            .populate({
                path: "item",
                populate: { path: "shop", select: "name" }
            })
        const items = favorites.map(f => f.item).filter(Boolean)
        return res.status(200).json(items)
    } catch (error) {
        return res.status(500).json({ message: `Could not load favorites. ${error.message}` })
    }
}