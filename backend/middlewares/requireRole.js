import User from "../models/user.model.js"
import { httpError } from "./errorHandler.js"

// Role-based access guard. Usage: requireRole("owner") or requireRole("user","owner")
const requireRole = (...roles) => async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role")
    if (!user) {
      return next(httpError(401, "Unauthorized"))
    }
    if (!roles.includes(user.role)) {
      return next(httpError(403, "Access denied for your role"))
    }
    req.role = user.role
    return next()
  } catch (error) {
    return next(error)
  }
}

export default requireRole