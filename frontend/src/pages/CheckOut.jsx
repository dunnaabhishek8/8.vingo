import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";
import axios from 'axios';
import { FaMobileScreenButton } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { addMyOrder, setTotalAmount } from '../redux/userSlice';
function RecenterMap({ location }) {
  if (location.lat && location.lon) {
    const map = useMap()
    map.setView([location.lat, location.lon], 16, { animate: true })
  }
  return null

}

function CheckOut() {
  const { location, address } = useSelector(state => state.map)
    const { cartItems ,totalAmount,userData} = useSelector(state => state.user)
  const [addressInput, setAddressInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const navigate=useNavigate()
  const dispatch = useDispatch()
  const apiKey = import.meta.env.VITE_GEOAPIKEY
  const deliveryFee=totalAmount>500?0:40
  const AmountWithDeliveryFee=totalAmount+deliveryFee





  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat, lon: lng }))
    getAddressByLatLng(lat, lng)
  }
  const getCurrentLocation = () => {
      const latitude=userData.location.coordinates[1]
      const longitude=userData.location.coordinates[0]
      dispatch(setLocation({ lat: latitude, lon: longitude }))
      getAddressByLatLng(latitude, longitude)


  }

  const getAddressByLatLng = async (lat, lng) => {
    try {

      const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`)
      dispatch(setAddress(result?.data?.results[0].address_line2))
    } catch (error) {
      console.log(error)
    }
  }

  const getLatLngByAddress = async () => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`)
      const { lat, lon } = result.data.features[0].properties
      dispatch(setLocation({ lat, lon }))
    } catch (error) {
      console.log(error)
    }
  }

  const handlePlaceOrder=async () => {
    try {
      const result=await axios.post(`${serverUrl}/api/order/place-order`,{
        paymentMethod,
        deliveryAddress:{
          text:addressInput,
          latitude:location.lat,
          longitude:location.lon
        },
        totalAmount:AmountWithDeliveryFee,
        cartItems
      },{withCredentials:true})

      if(paymentMethod=="cod"){
      dispatch(addMyOrder(result.data))
      navigate("/order-placed")
      }else{
        const orderId=result.data.orderId
        const razorOrder=result.data.razorOrder
          openRazorpayWindow(orderId,razorOrder)
       }

    } catch (error) {
      console.log(error)
    }
  }

const openRazorpayWindow=(orderId,razorOrder)=>{

  const options={
 key:import.meta.env.VITE_RAZORPAY_KEY_ID,
 amount:razorOrder.amount,
 currency:'INR',
 name:"Vingo",
 description:"Food Delivery Website",
 order_id:razorOrder.id,
 handler:async function (response) {
  try {
    const result=await axios.post(`${serverUrl}/api/order/verify-payment`,{
      razorpay_payment_id:response.razorpay_payment_id,
      orderId
    }
    ,{withCredentials:true})
        dispatch(addMyOrder(result.data))
      navigate("/order-placed")
  } catch (error) {
    console.log(error)
  }
 }
  }

  const rzp=new window.Razorpay(options)
  rzp.open()


}


  useEffect(() => {
    setAddressInput(address)
  }, [address])
  return (
    <div className='min-h-screen bg-cream flex items-center justify-center p-4 sm:p-6 py-24'>
      <button aria-label="Go back" className='fixed top-5 left-5 z-[20] h-11 w-11 rounded-full bg-white shadow-card ring-1 ring-black/[0.06] text-brand-600 hover:bg-brand-50 transition flex items-center justify-center cursor-pointer' onClick={() => navigate("/")}>
        <IoIosArrowRoundBack size={24} />
      </button>
      <div className='w-full max-w-[900px] bg-white rounded-3xl shadow-card border border-black/[0.05] p-5 sm:p-8 space-y-8 animate-fade-up'>
        <h1 className='text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900'>Checkout</h1>

        <section>
          <h2 className='flex items-center gap-2.5 mb-4'>
            <span className='h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center'><IoLocationSharp size={18}/></span>
            <span className='text-base sm:text-lg font-bold text-ink-900'>Delivery Location</span>
          </h2>
          <div className='flex gap-2 mb-3'>
            <input type="text" className='flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-ink-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100' placeholder='Enter Your Delivery Address..' value={addressInput} onChange={(e) => setAddressInput(e.target.value)} />
            <button aria-label="Search address" className='shrink-0 h-[42px] w-[46px] rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-95 transition' onClick={getLatLngByAddress}><IoSearchOutline size={17} /></button>
            <button aria-label="Use current location" className='shrink-0 h-[42px] w-[46px] rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 hover:bg-blue-600 active:scale-95 transition' onClick={getCurrentLocation}><TbCurrentLocation size={17} /></button>
          </div>
          <div className='rounded-2xl ring-1 ring-black/10 overflow-hidden shadow-soft relative z-0'>
            <div className='h-64 w-full flex items-center justify-center'>
              <MapContainer
                className={"w-full h-full"}
                center={[location?.lat, location?.lon]}
                zoom={16}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location} />
                <Marker position={[location?.lat, location?.lon]} draggable eventHandlers={{ dragend: onDragEnd }} />


              </MapContainer>
            </div>
          </div>
        </section>

        <section>
          <h2 className='flex items-center gap-2.5 mb-4'>
            <span className='h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center'><FaCreditCard size={16}/></span>
            <span className='text-base sm:text-lg font-bold text-ink-900'>Payment Method</span>
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className={`flex items-center gap-3 rounded-2xl border p-4 text-left cursor-pointer transition-all ${paymentMethod === "cod" ? "border-brand-500 bg-brand-50/70 ring-2 ring-brand-200 shadow-soft" : "border-gray-200 bg-white hover:border-brand-300"
              }`} onClick={() => setPaymentMethod("cod")}>

              <span className='inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100'>
                <MdDeliveryDining className='text-green-600 text-xl' />
              </span>
              <div >
                <p className='font-bold text-ink-900'>Cash On Delivery</p>
                <p className='text-xs text-ink-500 mt-0.5'>Pay when your food arrives</p>
              </div>

            </div>
            <div className={`flex items-center gap-3 rounded-2xl border p-4 text-left cursor-pointer transition-all ${paymentMethod === "online" ? "border-brand-500 bg-brand-50/70 ring-2 ring-brand-200 shadow-soft" : "border-gray-200 bg-white hover:border-brand-300"
              }`} onClick={() => setPaymentMethod("online")}>

              <span className='inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100'>
                <FaMobileScreenButton className='text-purple-700 text-lg' />
              </span>
              <span className='inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 -ml-7 hidden sm:inline-flex'>
                <FaCreditCard className='text-blue-700 text-lg' />
              </span>
              <div>
                <p className='font-bold text-ink-900'>UPI / Credit / Debit Card</p>
                <p className='text-xs text-ink-500 mt-0.5'>Pay Securely Online</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className='flex items-center gap-2.5 mb-4'>
            <span className='h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center'><MdDeliveryDining size={17}/></span>
            <span className='text-base sm:text-lg font-bold text-ink-900'>Order Summary</span>
          </h2>
<div className='rounded-2xl bg-gray-50 border border-gray-100 p-4 sm:p-5 space-y-2.5'>
{cartItems.map((item,index)=>(
  <div key={index} className='flex justify-between text-sm text-ink-700'>
<span>{item.name} × {item.quantity}</span>
<span className='font-medium'>₹{item.price*item.quantity}</span>
  </div>

))}
 <hr className='border-gray-200 my-2'/>
<div className='flex justify-between font-semibold text-ink-900 text-sm'>
  <span>Subtotal</span>
  <span>₹{totalAmount}</span>
</div>
<div className='flex justify-between text-sm text-ink-700'>
  <span>Delivery Fee</span>
  <span>{deliveryFee==0?<span className="font-semibold text-green-600">Free</span>:`₹${deliveryFee}`}</span>
</div>
<div className='flex justify-between text-lg font-extrabold text-brand-600 pt-1.5'>
    <span>Total</span>
  <span>₹{AmountWithDeliveryFee}</span>
</div>
</div>
        </section>
        <button className='w-full h-12 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-700 active:scale-[0.99] transition' onClick={handlePlaceOrder}> {paymentMethod=="cod"?"Place Order":"Pay & Place Order"}</button>

      </div>
    </div>
  )
}

export default CheckOut