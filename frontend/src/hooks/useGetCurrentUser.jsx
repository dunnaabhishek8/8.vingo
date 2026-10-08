import React, { useEffect } from 'react'
import api from '../lib/api'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function useGetCurrentUser() {
    const dispatch = useDispatch()
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await api.get('/api/user/current')
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
      }
    }
    fetchUser()
  }, [])
}

export default useGetCurrentUser