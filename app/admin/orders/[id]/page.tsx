"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";
import { adminFetch } from "@/config/adminAuth";
import {
  ORDER_STATUSES,
  OrderDeleteDialog,
  OrderStatusBadge,
  formatOrderMoney,
  type Order,
  type OrderStatus,
} from "@/components/admin/orderAdmin";

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminFetch(`/api/orders/${orderId}`)
      .then(async (res) => {
        if (!res.ok) {
          if (!cancelled) setMissing(true);
          return;
        }
        const data = await res.json();
        if (!cancelled) setOrder(data);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order) return;
    setStatusSaving(true);
    const previous = order.status;
    setOrder({ ...order, status });
    const res = await adminFetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!res.ok) setOrder({ ...order, status: previous });
    setStatusSaving(false);
  };

  const confirmDeleteOrder = async () => {
    if (!order || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await adminFetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteError(data.error || "Could not delete this order.");
        return;
      }
      router.push("/admin/orders");
    } catch {
      setDeleteError("Could not delete this order.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <p className="py-16 text-center text-xs font-bold text-slate-500">
        Loading order...
      </p>
    );
  }

  if (missing || !order) {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm font-bold text-slate-700">This order was not found.</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-bold text-pink-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to orders
        </Link>
      </div>
    );
  }

  const itemCount = order.items?.length || order.itemCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Orders
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
              {order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDeleteError("");
            setConfirmingDelete(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete order
        </button>
      </div>

      {order.status === "WhatsApp Initiated" && (
        <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-semibold text-emerald-900">
            <AlertCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              Customer clicked <strong>Send to WhatsApp</strong>. Confirm this
              order once the message is received.
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => handleStatusChange("Pending")}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirm order
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange("Processing")}
              className="rounded-lg bg-sky-600 px-3 py-1.5 text-[11px] font-extrabold text-white hover:bg-sky-700"
            >
              Mark processing
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <h2 className="text-sm font-extrabold text-slate-800">Customer</h2>
          <p className="mt-3 text-sm font-bold text-slate-800">
            {order.customerName}
          </p>
          <p className="text-xs text-slate-500">{order.phone || "No phone"}</p>
          <p className="mt-1 text-xs text-slate-500">{order.userIdentifier}</p>
        </section>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5">
          <h2 className="text-sm font-extrabold text-slate-800">Delivery</h2>
          <p className="mt-3 text-sm font-bold text-slate-800">
            {order.shippingAddress}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Tracking: {order.trackingNumber || "Not assigned"}
          </p>
          <label className="mt-4 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Status
          </label>
          <select
            value={order.status}
            disabled={statusSaving}
            onChange={(event) =>
              handleStatusChange(event.target.value as OrderStatus)
            }
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-extrabold text-slate-800">
            Items ({itemCount})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-bold">Product</th>
                <th className="px-5 py-3 font-bold">Qty</th>
                <th className="px-5 py-3 font-bold">Price</th>
                <th className="px-5 py-3 font-bold">Line total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, index) => (
                <tr key={`${item.productId}-${index}`} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : null}
                      <span className="font-bold text-slate-800">
                        {item.productName}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-700">
                    {item.quantity}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {formatOrderMoney(item.price)}
                  </td>
                  <td className="px-5 py-3 font-extrabold text-slate-900">
                    {formatOrderMoney(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-1 border-t border-slate-100 px-5 py-4 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-bold text-slate-800">
              {formatOrderMoney(order.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Shipping</span>
            <span className="font-bold text-slate-800">
              {formatOrderMoney(order.shipping || 0)}
            </span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-extrabold text-slate-900">
            <span>Total</span>
            <span>{formatOrderMoney(order.total)}</span>
          </div>
        </div>
      </section>

      <OrderDeleteDialog
        order={
          confirmingDelete
            ? {
                orderNumber: order.orderNumber,
                customerName: order.customerName,
                itemCount,
              }
            : null
        }
        deleting={deleting}
        error={deleteError}
        onCancel={() => {
          if (deleting) return;
          setConfirmingDelete(false);
          setDeleteError("");
        }}
        onConfirm={confirmDeleteOrder}
      />
    </div>
  );
}
