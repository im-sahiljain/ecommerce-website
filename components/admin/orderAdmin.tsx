"use client";

import { Trash2 } from "lucide-react";

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "WhatsApp Initiated";

export const ORDER_STATUSES: OrderStatus[] = [
  "WhatsApp Initiated",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export interface OrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  itemCount: number;
}

export interface Order extends OrderSummary {
  userIdentifier: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shipping?: number;
  trackingNumber?: string;
}

const STATUS_STYLES: Record<string, string> = {
  "WhatsApp Initiated": "bg-emerald-100 text-emerald-800",
  Pending: "bg-amber-100 text-amber-800",
  Processing: "bg-sky-100 text-sky-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-rose-100 text-rose-800",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
        STATUS_STYLES[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export function formatOrderMoney(amount: number) {
  return `₹${Number(amount || 0).toFixed(2)}`;
}

export function OrderDeleteDialog({
  order,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  order: { orderNumber: string; customerName: string; itemCount: number } | null;
  deleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-order-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h2
              id="delete-order-title"
              className="text-base font-extrabold text-slate-900"
            >
              Delete this order?
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {order.orderNumber} for {order.customerName} will be removed,
              including all {order.itemCount} items. This cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-rose-700 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete order"}
          </button>
        </div>
      </div>
    </div>
  );
}
