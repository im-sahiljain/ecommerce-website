"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Trash2 } from "lucide-react";
import { adminFetch } from "@/config/adminAuth";
import {
  ORDER_STATUSES,
  OrderDeleteDialog,
  OrderStatusBadge,
  formatOrderMoney,
  type OrderSummary,
} from "@/components/admin/orderAdmin";

const PAGE_SIZE = 20;

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const [orderToDelete, setOrderToDelete] = useState<OrderSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (selectedFilter !== "All") params.set("status", selectedFilter);

    adminFetch(`/api/orders?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setOrders(Array.isArray(data.orders) ? data.orders : []);
        setTotal(Number(data.total) || 0);
        setStatusCounts(data.statusCounts || {});
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, selectedFilter, reloadToken]);

  const allCount = Object.values(statusCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const closeDeleteConfirm = () => {
    if (deleting) return;
    setOrderToDelete(null);
    setDeleteError("");
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await adminFetch(`/api/orders/${orderToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteError(data.error || "Could not delete this order.");
        return;
      }
      setOrderToDelete(null);
      if (orders.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        setReloadToken((token) => token + 1);
      }
    } catch {
      setDeleteError("Could not delete this order.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-800 sm:text-2xl">
            Orders
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            {loading
              ? "Loading orders..."
              : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
          </p>
        </div>
        <button
          onClick={() => setReloadToken((token) => token + 1)}
          className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl bg-neutral-100 px-4 py-2 text-xs font-bold text-neutral-700 transition hover:bg-neutral-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        {["All", ...ORDER_STATUSES].map((tab) => {
          const count = tab === "All" ? allCount : statusCounts[tab] || 0;
          const isActive = selectedFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setSelectedFilter(tab);
                setPage(1);
              }}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 py-2 transition ${
                isActive
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-2xs"
                  : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <span>{tab}</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${
                  isActive ? "bg-primary text-white" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-bold">Order</th>
                <th className="px-4 py-3 font-bold">Customer</th>
                <th className="px-4 py-3 font-bold">Items</th>
                <th className="px-4 py-3 font-bold">Total</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Placed</th>
                <th className="px-4 py-3 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center font-bold text-neutral-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center font-bold text-neutral-500">
                    No orders for “{selectedFilter}”.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-extrabold text-neutral-800 hover:text-primary"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-neutral-800">{order.customerName}</p>
                      <p className="text-neutral-500">{order.phone || "No phone"}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-neutral-700">
                      {order.itemCount}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-neutral-900">
                      {formatOrderMoney(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="rounded-lg bg-neutral-100 px-2.5 py-1.5 font-bold text-neutral-700 hover:bg-neutral-200"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError("");
                            setOrderToDelete(order);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-danger-200 bg-danger-50 px-2.5 py-1.5 font-bold text-danger-700 hover:bg-danger-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 text-xs font-bold text-neutral-600">
          <span>
            Page {Math.min(page, pageCount)} of {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg bg-neutral-100 px-3 py-1.5 hover:bg-neutral-200 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pageCount || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg bg-neutral-100 px-3 py-1.5 hover:bg-neutral-200 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <OrderDeleteDialog
        order={orderToDelete}
        deleting={deleting}
        error={deleteError}
        onCancel={closeDeleteConfirm}
        onConfirm={confirmDeleteOrder}
      />
    </div>
  );
}
