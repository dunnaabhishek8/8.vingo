import User from "./models/user.model.js"
import DeliveryAssignment from "./models/deliveryAssignment.model.js"

export const socketHandler = (io) => {
    io.on('connection', (socket) => {

        // Each authenticated user joins their own room so we can target
        // events precisely instead of broadcasting to everyone.
        socket.on('identity', async ({ userId }) => {
            try {
                if (!userId) return
                socket.join(`user:${String(userId)}`)
                await User.findByIdAndUpdate(userId, {
                    socketId: socket.id,
                    isOnline: true
                }, { new: true })
            } catch (error) {
                console.log("[socket identity]", error.message)
            }
        })

        // Delivery partner streams GPS. Emit only to the people who need it:
        // the partner themself + customers with an active delivery from this partner.
        socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
            try {
                const user = await User.findByIdAndUpdate(userId, {
                    location: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    isOnline: true,
                    socketId: socket.id
                })

                if (!user) return

                const payload = {
                    deliveryBoyId: String(userId),
                    latitude,
                    longitude
                }

                // Partner's own room (their dashboard listens for echo)
                io.to(`user:${String(userId)}`).emit('updateDeliveryLocation', payload)

                // Customers tracking this partner right now
                const activeAssignments = await DeliveryAssignment.find({
                    assignedTo: userId,
                    status: "assigned"
                }).populate("order", "user").limit(10)

                const customerIds = new Set()
                activeAssignments.forEach(a => {
                    if (a.order?.user) customerIds.add(String(a.order.user))
                })
                customerIds.forEach(customerId => {
                    io.to(`user:${customerId}`).emit('updateDeliveryLocation', payload)
                })

            } catch (error) {
                console.log('[updateDeliveryLocation]', error.message)
            }
        })

        socket.on('disconnect', async () => {
            try {
                await User.findOneAndUpdate({ socketId: socket.id }, {
                    socketId: null,
                    isOnline: false
                })
            } catch (error) {
                console.log("[socket disconnect]", error.message)
            }
        })
    })
}