// Centralized async wrapper + error handlers

// Wrap async controllers so thrown errors reach errorHandler
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

// 404 for unknown API routes
export const notFound = (req, res) => {
  return res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` })
}

// Final error middleware — never leaks stack traces to the client
export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500
  if (status >= 500) {
    console.error("[API ERROR]", err.message)
  }
  const message =
    status >= 500 && process.env.NODE_ENV === "production"
      ? "Something went wrong on our side. Please try again."
      : err.message || "Internal server error"
  return res.status(status).json({ success: false, message })
}

// Helper to create operational errors with a status code
export const httpError = (statusCode, message) => {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}