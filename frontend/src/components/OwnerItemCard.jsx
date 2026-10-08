import axios from "axios";
import React, { useState } from "react"
import { FaPen, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../lib/api";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import ConfirmDialog from "./ui/ConfirmDialog";
import { useToast } from "./ui/Toast";

function OwnerItemCard({ data }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const toast = useToast()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [available, setAvailable] = useState(data.isAvailable !== false)

    const handleDelete = async () => {
        setDeleting(true)
        try {
            const result = await axios.delete(`${serverUrl}/api/item/delete/${data._id}`, { withCredentials: true })
            dispatch(setMyShopData(result.data))
            toast.success(`"${data.name}" deleted.`)
        } catch (error) {
            toast.error(error?.response?.data?.message || "Could not delete item.")
        } finally {
            setDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const handleToggleAvailability = async () => {
        const next = !available
        setAvailable(next) // optimistic
        try {
            const result = await axios.post(
                `${serverUrl}/api/item/toggle-availability/${data._id}`,
                {},
                { withCredentials: true }
            )
            dispatch(setMyShopData(result.data))
            toast.info(next ? `"${data.name}" is now available.` : `"${data.name}" marked as sold out.`)
        } catch (error) {
            setAvailable(!next) // revert
            toast.error(error?.response?.data?.message || "Could not update availability.")
        }
    }

    return (
        <>
            <div className={`flex bg-white rounded-2xl shadow-soft border border-black/[0.05] overflow-hidden w-full hover:shadow-card transition-shadow duration-300 ${!available ? "opacity-75" : ""}`}>
                <div className='w-28 sm:w-36 shrink-0 relative'>
                    <img src={data.image} alt={data.name} loading="lazy" className={`w-full h-full object-cover ${!available ? "grayscale" : ""}`} />
                    {!available && (
                        <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] font-bold uppercase tracking-wide text-center py-1">
                            Sold Out
                        </span>
                    )}
                </div>
                <div className='flex flex-col justify-between p-4 flex-1 min-w-0'>
                    <div>
                        <h2 className='text-base font-bold text-ink-900 truncate'>{data.name}</h2>
                        <div className='flex flex-wrap items-center gap-1.5 mt-1.5'>
                            <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-ink-700'>{data.category}</span>
                            <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-ink-700 capitalize'>{data.foodType}</span>
                        </div>
                    </div>
                    <div className='flex items-center justify-between mt-3'>
                        <div className='text-brand-600 font-extrabold text-lg'>₹{data.price}</div>
                        <div className='flex items-center gap-1.5'>
                            {/* availability switch */}
                            <button
                                role="switch"
                                aria-checked={available}
                                aria-label={available ? "Mark as sold out" : "Mark as available"}
                                onClick={handleToggleAvailability}
                                className={`relative h-6 w-11 rounded-full transition-colors ${available ? "bg-green-500" : "bg-gray-300"}`}
                            >
                                <span
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${available ? "left-[22px]" : "left-0.5"}`}
                                />
                            </button>
                            <button aria-label="Edit item" className='p-2 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 transition' onClick={() => navigate(`/edit-item/${data._id}`)}>
                                <FaPen size={14} />
                            </button>
                            <button aria-label="Delete item" className='p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition' onClick={() => setShowDeleteConfirm(true)}>
                                <FaTrashAlt size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={showDeleteConfirm}
                title={`Delete "${data.name}"?`}
                message="This removes the item from your menu permanently."
                confirmText="Delete Item"
                danger
                busy={deleting}
                onConfirm={handleDelete}
                onClose={() => setShowDeleteConfirm(false)}
            />
        </>
    )
}

export default OwnerItemCard