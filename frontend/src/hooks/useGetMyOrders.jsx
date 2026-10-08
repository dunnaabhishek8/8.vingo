import React, { useEffect } from 'react'
import api from '../lib/api'
import { useDispatch, useSelector } from 'react-redux'
import { setMyOrders } from '../redux/userSlice'

function useGetMyOrders() {
    const dispatch = useDispatch()
    const { userData } = useSelector(state => state.user)
  useEffect(() => {
    if (!userData) return
    const fetchOrders = async () => {
      try {
        const result = await api.get('/api/order/my-orders')
        dispatch(setMyOrders(result.data))
      } catch (error) {
        console.log(error)
      }
    }
    fetchOrders()
  }, [userData])
}

export default useGetMyOrders