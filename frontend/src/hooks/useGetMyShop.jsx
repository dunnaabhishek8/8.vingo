import React, { useEffect } from 'react'
import api from '../lib/api'
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../redux/ownerSlice'

function useGetMyshop() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
  useEffect(() => {
    if (!userData || userData.role !== "owner") return
    const fetchShop = async () => {
      try {
        const result = await api.get('/api/shop/get-my')
        dispatch(setMyShopData(result.data))
      } catch (error) {
        console.log(error)
      }
    }
    fetchShop()
  }, [userData])
}

export default useGetMyshop