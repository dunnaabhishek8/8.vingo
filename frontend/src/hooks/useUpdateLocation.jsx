import React, { useEffect } from 'react'
import api from '../lib/api'
import { useSelector } from 'react-redux'

function useUpdateLocation() {
    const { userData } = useSelector(state => state.user)

    useEffect(() => {
        if (!userData) return
        const updateLocation = async (lat, lon) => {
            try {
                await api.post('/api/user/update-location', { lat, lon })
            } catch (error) {
                console.log(error)
            }
        }

        const watchId = navigator.geolocation.watchPosition((pos) => {
            updateLocation(pos.coords.latitude, pos.coords.longitude)
        })

        return () => navigator.geolocation.clearWatch(watchId)
    }, [userData])
}

export default useUpdateLocation