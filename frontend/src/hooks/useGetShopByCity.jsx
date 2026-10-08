import React, { useEffect } from 'react'
import api from '../lib/api'
import { useDispatch, useSelector } from 'react-redux'
import { setShopsInMyCity } from '../redux/userSlice'

function useGetShopByCity() {
    const dispatch = useDispatch()
    const { currentCity } = useSelector(state => state.user)
  useEffect(() => {
    if (!currentCity) return
    const fetchShops = async () => {
      try {
        const result = await api.get(`/api/shop/get-by-city/${encodeURIComponent(currentCity)}`)
        dispatch(setShopsInMyCity(result.data))
      } catch (error) {
        console.log(error)
      }
    }
    fetchShops()
  }, [currentCity])
}

export default useGetShopByCity