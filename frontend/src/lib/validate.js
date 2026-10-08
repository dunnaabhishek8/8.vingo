// Shared client-side validation helpers

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isValidEmail = (value) => emailRegex.test(String(value || "").trim())

export const isValidMobile = (value) => /^\d{10,13}$/.test(String(value || "").trim())

// Password strength score 0–4 (weak → strong)
export const passwordScore = (pw = "") => {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

export const strengthLabel = (score) =>
  ["Too short", "Weak", "Fair", "Good", "Strong"][Math.max(0, Math.min(score, 4))]