// Strips MongoDB operator keys ($prefix / dotted) from user input to prevent
// operator injection. Dependency-free replacement for express-mongo-sanitize.

const clean = (obj) => {
  if (!obj || typeof obj !== "object") return
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key]
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      clean(obj[key])
    }
  }
}

export const sanitizeBody = (req, res, next) => {
  clean(req.body)
  clean(req.params)
  return next()
}