import Notification from "../models/notification.model.js"

export const getMyNotifications = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1)
        const limit = Math.min(50, parseInt(req.query.limit) || 20)

        const [notifications, unreadCount, total] = await Promise.all([
            Notification.find({ user: req.userId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Notification.countDocuments({ user: req.userId, read: false }),
            Notification.countDocuments({ user: req.userId })
        ])

        return res.status(200).json({ notifications, unreadCount, total, page })
    } catch (error) {
        return res.status(500).json({ message: `Could not load notifications. ${error.message}` })
    }
}

export const markNotificationsRead = async (req, res) => {
    try {
        const { ids, all } = req.body
        if (all) {
            await Notification.updateMany({ user: req.userId, read: false }, { read: true })
        } else if (Array.isArray(ids) && ids.length > 0) {
            await Notification.updateMany(
                { user: req.userId, _id: { $in: ids } },
                { read: true }
            )
        } else {
            return res.status(400).json({ message: "Provide notification ids or all=true." })
        }
        return res.status(200).json({ message: "Marked as read" })
    } catch (error) {
        return res.status(500).json({ message: `Could not update notifications. ${error.message}` })
    }
}