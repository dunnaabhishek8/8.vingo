import React, { useEffect } from 'react'
import api from '../lib/api'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../redux/userSlice'

function useGetItemsByCity() {
    const dispatch = useDispatch()
    const { currentCity } = useSelector(state => state.user)
  useEffect(() => {
    if (!currentCity) return
    let cancelled = false
    const fetchItems = async () => {
      try {
        const result = await api.get(`/api/item/get-by-city/${encodeURIComponent(currentCity)}`)
        if (!cancelled) dispatch(setItemsInMyCity(result.data))
      } catch (error) {
        console.log(error)
      }
    }
    fetchItems()
    return () => { cancelled = true }
  }, [currentCity])
}

export default useGetItemsByCity