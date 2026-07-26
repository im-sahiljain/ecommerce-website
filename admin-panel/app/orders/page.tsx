"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { adminFetch } from "../../config/auth";

interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  userIdentifier: string;
  customerName: string;
  shippingAddress: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
  trackingNumber?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = () => {
    adminFetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, status: string) => {
    await adminFetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Orders & Fulfillment Management
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Track incoming customer orders and update dispatch & delivery
            statuses.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
            <p className="text-slate-500 font-bold text-xs">
              No orders recorded yet.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-800">
                      {order.orderNumber}
                    </span>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-full text-[11px]">
                      {order.userIdentifier}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                  <span className="font-bold text-slate-600 text-xs">
                    Status:
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-pink-300"
                  >
                    <option value="Pending">🟡 Pending</option>
                    <option value="Processing">🔵 Processing</option>
                    <option value="Shipped">🚀 Shipped</option>
                    <option value="Delivered">🟢 Delivered</option>
                    <option value="Cancelled">🔴 Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-500 font-semibold">Customer:</p>
                  <p className="font-bold text-slate-800">
                    {order.customerName} ({order.phone || "N/A"})
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold">
                    Shipping Address:
                  </p>
                  <p className="font-bold text-slate-800">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-700">
                  Order Items ({order.items?.length || 0}):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200"
                    >
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1">
                          {item.productName}
                        </p>
                        <p className="text-slate-500">
                          {item.quantity} x ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">
                  Tracking Code:{" "}
                  <strong className="text-slate-800">
                    {order.trackingNumber || "TRK-88492019"}
                  </strong>
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  Total: ₹{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
