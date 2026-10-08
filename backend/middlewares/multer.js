import multer from "multer"
import crypto from "crypto"
import path from "path"

// Unique, collision-safe filenames instead of raw original names
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public")
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg"
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`)
  }
})

// Only allow images, max 5MB
const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    return cb(null, true)
  }
  return cb(new Error("Only image files are allowed"))
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
})