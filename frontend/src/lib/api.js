import axios from "axios"

// Single source of truth for the backend URL.
// Optionally override with VITE_API_URL in frontend/.env — falls back to localhost.
export const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"

const api = axios.create({
  baseURL: serverUrl,
  withCredentials: true
})

// Network-level failures (server unreachable / offline) raise a global event
// that the ToastProvider listens to, so users always get feedback.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      window.dispatchEvent(new CustomEvent("app:network-error"))
    }
    return Promise.reject(error)
  }
)

export default api