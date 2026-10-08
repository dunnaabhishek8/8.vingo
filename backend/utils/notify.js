import Notification from "../models/notification.model.js"

// Persist a notification for a user AND push it live over Socket.io.
// Safe to call anywhere you have access to the io instance (req.app.get("io")).
export const pushNotification = async (io, { userId, type = "info", title, message = "", orderId = null }) => {
  try {
    if (!userId) return null
    const doc = await Notification.create({ user: userId, type, title, message, orderId })
    if (io) {
      io.to(`user:${String(userId)}`).emit("notification", {
        _id: doc._id,
        type: doc.type,
        title: doc.title,
        message: doc.message,
        orderId: doc.orderId,
        read: doc.read,
        createdAt: doc.createdAt
      })
    }
    return doc
  } catch (error) {
    // Never let a notification failure break the main flow
    console.log("[notify] error:", error.message)
    return null
  }
}