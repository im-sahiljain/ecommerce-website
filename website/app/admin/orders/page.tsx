"use client";

import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, MessageCircle, AlertCircle } from "lucide-react";
import { adminFetch } from "@/config/adminAuth";

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
  status:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "WhatsApp Initiated";
  createdAt: string;
  trackingNumber?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

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

  const filteredOrders =
    selectedFilter === "All"
      ? orders
      : orders.filter((o) => o.status === selectedFilter);

  const getStatusCount = (statusName: string) => {
    if (statusName === "All") return orders.length;
    return orders.filter((o) => o.status === statusName).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            Orders & Fulfillment Management
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Track incoming customer orders, confirm WhatsApp inquiries, and update dispatch & delivery statuses.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        {[
          "All",
          "WhatsApp Initiated",
          "Pending",
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled",
        ].map((tab) => {
          const count = getStatusCount(tab);
          const isActive = selectedFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-3.5 py-2 rounded-xl border transition whitespace-nowrap flex items-center space-x-1.5 ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{tab}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  isActive
                    ? "bg-pink-500 text-white"
                    : tab === "WhatsApp Initiated" && count > 0
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
            <p className="text-slate-500 font-bold text-xs">
              No orders found for status "{selectedFilter}".
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isWhatsAppUnconfirmed = order.status === "WhatsApp Initiated";

            return (
              <div
                key={order.id}
                className={`bg-white p-6 rounded-2xl border shadow-xs space-y-4 transition ${
                  isWhatsAppUnconfirmed
                    ? "border-emerald-300 ring-2 ring-emerald-500/10"
                    : "border-slate-200/80"
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b text-xs gap-3">
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-extrabold text-sm text-slate-800">
                        {order.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-full text-[11px]">
                        {order.userIdentifier}
                      </span>
                      {isWhatsAppUnconfirmed && (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-full text-[11px] flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp Initiated</span>
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Placed on {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-600 text-xs">
                      Status:
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className={`px-3 py-1.5 border rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-pink-300 ${
                        isWhatsAppUnconfirmed
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                          : "bg-slate-50 border-slate-300"
                      }`}
                    >
                      <option value="WhatsApp Initiated">
                        💬 WhatsApp Initiated
                      </option>
                      <option value="Pending">🟡 Pending</option>
                      <option value="Processing">🔵 Processing</option>
                      <option value="Shipped">🚀 Shipped</option>
                      <option value="Delivered">🟢 Delivered</option>
                      <option value="Cancelled">🔴 Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* WhatsApp Unconfirmed Alert Banner & 1-Click Confirm Button */}
                {isWhatsAppUnconfirmed && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-900 font-semibold">
                      <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Customer clicked <strong>Send to WhatsApp</strong>. Confirm this order once message is received.
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleStatusChange(order.id, "Pending")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg shadow-xs transition flex items-center space-x-1 text-[11px]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Order (Mark Pending)</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, "Processing")}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-lg shadow-xs transition text-[11px]"
                      >
                        Mark Processing
                      </button>
                    </div>
                  </div>
                )}

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
            );
          })
        )}
      </div>
    </div>
  );
}
