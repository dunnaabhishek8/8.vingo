import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";

function UserOrderCard({ data }) {
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState({});

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleRating = async (itemId, rating) => {
    if (!itemId) return;

    try {
      await axios.post(
        `${serverUrl}/api/item/rating`,
        { itemId, rating },
        { withCredentials: true }
      );

      setSelectedRating((prev) => ({
        ...prev,
        [itemId]: rating,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/[0.05] p-4 sm:p-5 space-y-4">
      <div className="flex justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <p className="font-extrabold text-ink-900">
            Order #{data?._id?.slice(-6)}
          </p>

          <p className="text-sm text-ink-400 mt-0.5">
            {formatDate(data.createdAt)}
          </p>
        </div>

        <div className="text-right space-y-1.5">
          {data.paymentMethod === "cod" ? (
            <p className="text-xs font-bold uppercase tracking-wide text-ink-500">
              {data.paymentMethod}
            </p>
          ) : (
            <p className="text-xs font-bold uppercase tracking-wide text-ink-500">
              Payment: <span className={data.payment ? "text-green-600" : "text-red-500"}>{data.payment ? "Paid" : "Pending"}</span>
            </p>
          )}

          <span className="inline-block rounded-full bg-brand-50 text-brand-600 px-2.5 py-0.5 text-xs font-bold capitalize">
            {data.shopOrders?.[0]?.status || "Pending"}
          </span>
        </div>
      </div>

      {data.shopOrders?.map((shopOrder, index) => (
        <div
          className="rounded-2xl border border-brand-100 bg-brand-50/40 p-3.5 space-y-3"
          key={index}
        >
          <p className="font-bold text-ink-900">
            {shopOrder.shop?.name || "Restaurant unavailable"}
          </p>

          <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-1">
            {shopOrder.shopOrderItems?.map((item, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-36 rounded-xl border border-black/[0.05] p-2 bg-white shadow-sm"
              >
                <img
                  src={
                    item.item?.image ||
                    item.image ||
                    "https://via.placeholder.com/150"
                  }
                  alt={item.name}
                  className="w-full h-24 object-cover rounded-lg"
                />

                <p className="text-sm font-semibold mt-1.5 truncate">
                  {item.name}
                </p>

                <p className="text-xs text-ink-500">
                  Qty: {item.quantity} × ₹{item.price}
                </p>

                {shopOrder.status === "delivered" && item.item && (
                  <div className="flex space-x-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        aria-label={`Rate ${star} star`}
                        className={`text-xl leading-none transition-transform hover:scale-110 ${
                          (selectedRating[item.item?._id] || 0) >= star
                            ? "text-amber-400"
                            : "text-gray-300 hover:text-amber-300"
                        }`}
                        onClick={() =>
                          handleRating(item.item?._id, star)
                        }
                      >
                        ★
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-brand-100 pt-2.5">
            <p className="font-bold text-ink-900">
              Subtotal: ₹{shopOrder.subtotal}
            </p>

            <span className="inline-block rounded-full bg-white text-brand-600 border border-brand-100 px-2.5 py-0.5 text-xs font-bold capitalize">
              {shopOrder.status}
            </span>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center border-t border-gray-100 pt-3">
        <p className="font-extrabold text-ink-900 text-lg">
          Total: ₹{data.totalAmount}
        </p>

        <button
          className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 active:scale-95 transition"
          onClick={() => navigate(`/track-order/${data._id}`)}
        >
          Track Order
        </button>
      </div>
    </div>
  );
}

export default UserOrderCard;