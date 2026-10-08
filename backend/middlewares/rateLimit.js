// Tiny dependency-free in-memory rate limiter.
// Suitable for single-instance deployments (protects OTP endpoints etc.)

const buckets = new Map()

// Periodically clean expired buckets so the map doesn't grow forever
setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets.entries()) {
    if (now > bucket.reset) buckets.delete(key)
  }
}, 60 * 1000).unref?.()

export const rateLimit = ({ windowMs = 10 * 60 * 1000, max = 5, keyGen } = {}) =>
  (req, res, next) => {
    try {
      const key = keyGen ? keyGen(req) : req.ip || "unknown"
      const now = Date.now()
      let bucket = buckets.get(key)
      if (!bucket || now > bucket.reset) {
        bucket = { count: 0, reset: now + windowMs }
        buckets.set(key, bucket)
      }
      bucket.count += 1
      if (bucket.count > max) {
        return res.status(429).json({ success: false, message: "Too many attempts. Please try again later." })
      }
      return next()
    } catch (error) {
      return next(error)
    }
  }