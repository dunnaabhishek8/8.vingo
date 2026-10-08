// Recently viewed items — lightweight localStorage tracking (no backend needed)
const KEY = "vingo_recent_items"

export const getRecentItemIds = () => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export const addRecentItemId = (id) => {
  try {
    if (!id) return
    const list = getRecentItemIds().filter((x) => x !== id)
    list.unshift(id)
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 8)))
  } catch {
    /* storage unavailable — ignore */
  }
}