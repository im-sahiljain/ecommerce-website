import type { Order } from './types';
import type { Db } from './pool';

export async function listOrders(db: Db, options: {
  status?: string;
  limit: number;
  offset: number;
}): Promise<{
  orders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    phone: string;
    status: Order['status'];
    total: number;
    createdAt: string;
    itemCount: number;
  }>;
  total: number;
  statusCounts: Record<string, number>;
}> {
  const pool = db.pgPool;
  const empty = { orders: [], total: 0, statusCounts: {} as Record<string, number> };
  if (!pool) return empty;

  const status = options.status || null;
  const limit = options.limit;
  const offset = options.offset;

  try {
    const [rowsRes, totalRes, countsRes] = await Promise.all([
      pool.query(
        `
        SELECT
          id,
          order_number,
          customer_name,
          phone,
          status,
          total,
          created_at,
          CASE
            WHEN items IS NULL THEN 0
            WHEN jsonb_typeof(items::jsonb) = 'array' THEN jsonb_array_length(items::jsonb)
            ELSE 0
          END AS item_count
        FROM public.orders
        WHERE ($1::text IS NULL OR status = $1)
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
        `,
        [status, limit, offset]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS total FROM public.orders WHERE ($1::text IS NULL OR status = $1)`,
        [status]
      ),
      pool.query(
        `SELECT status, COUNT(*)::int AS count FROM public.orders GROUP BY status`
      ),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const row of countsRes.rows) {
      statusCounts[row.status] = row.count;
    }

    return {
      orders: rowsRes.rows.map((r) => ({
        id: r.id,
        orderNumber: r.order_number,
        customerName: r.customer_name,
        phone: r.phone || '',
        status: r.status,
        total: Number(r.total),
        createdAt: r.created_at,
        itemCount: Number(r.item_count) || 0,
      })),
      total: totalRes.rows[0]?.total || 0,
      statusCounts,
    };
  } catch (err: any) {
    console.warn('⚠️ PG listOrders error:', err.message);
    return empty;
  }
}

export async function getOrderStats(db: Db): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}> {
  const pool = db.pgPool;
  const empty = { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 };
  if (!pool) return empty;
  try {
    const res = await pool.query(`
      SELECT
        COUNT(*)::int AS total_orders,
        COALESCE(SUM(total), 0)::float8 AS total_revenue,
        COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending_orders
      FROM public.orders
    `);
    const row = res.rows[0];
    return {
      totalOrders: row?.total_orders || 0,
      totalRevenue: Number(row?.total_revenue) || 0,
      pendingOrders: row?.pending_orders || 0,
    };
  } catch (err: any) {
    console.warn('⚠️ PG getOrderStats error:', err.message);
    return empty;
  }
}

export async function getOrders(db: Db): Promise<Order[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    const res = await pool.query(`SELECT * FROM public.orders ORDER BY created_at DESC`);
    return res.rows.map((r) => ({
      id: r.id,
      orderNumber: r.order_number,
      userIdentifier: r.user_identifier,
      customerName: r.customer_name,
      shippingAddress: r.shipping_address,
      phone: r.phone,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
      subtotal: Number(r.subtotal),
      shipping: Number(r.shipping),
      total: Number(r.total),
      status: r.status,
      createdAt: r.created_at,
      trackingNumber: r.tracking_number,
    }));
  } catch (err: any) {
    console.warn('⚠️ PG getOrders error:', err.message);
    return [];
  }
}

export async function getOrdersByUser(db: Db, identifier: string): Promise<Order[]> {
  const pool = db.pgPool;
  if (!pool) return [];
  try {
    const res = await pool.query(
      `SELECT * FROM public.orders WHERE LOWER(user_identifier) = LOWER($1) ORDER BY created_at DESC`,
      [identifier]
    );
    return res.rows.map((r) => ({
      id: r.id,
      orderNumber: r.order_number,
      userIdentifier: r.user_identifier,
      customerName: r.customer_name,
      shippingAddress: r.shipping_address,
      phone: r.phone,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
      subtotal: Number(r.subtotal),
      shipping: Number(r.shipping),
      total: Number(r.total),
      status: r.status,
      createdAt: r.created_at,
      trackingNumber: r.tracking_number,
    }));
  } catch (err: any) {
    console.warn('⚠️ PG getOrdersByUser error:', err.message);
    return [];
  }
}

export async function getOrderById(db: Db, id: string): Promise<Order | undefined> {
  const pool = db.pgPool;
  if (!pool) return undefined;
  try {
    const res = await pool.query(`SELECT * FROM public.orders WHERE id = $1 OR order_number = $1`, [
      id,
    ]);
    if (res.rows.length === 0) return undefined;
    const r = res.rows[0];
    return {
      id: r.id,
      orderNumber: r.order_number,
      userIdentifier: r.user_identifier,
      customerName: r.customer_name,
      shippingAddress: r.shipping_address,
      phone: r.phone,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
      subtotal: Number(r.subtotal),
      shipping: Number(r.shipping),
      total: Number(r.total),
      status: r.status,
      createdAt: r.created_at,
      trackingNumber: r.tracking_number,
    };
  } catch (err: any) {
    console.warn('⚠️ PG getOrderById error:', err.message);
    return undefined;
  }
}

export async function createOrder(db: Db, 
  order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'> & { status?: Order['status'] }
): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: `ord-${Date.now()}`,
    orderNumber: `LC-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    status: order.status || 'Pending',
    trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
  };

  const pool = db.pgPool;
  if (pool) {
    try {
      await pool.query(
        `
        INSERT INTO public.orders (id, order_number, user_identifier, customer_name, shipping_address, phone, items, subtotal, shipping, total, status, created_at, tracking_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (id) DO NOTHING;
      `,
        [
          newOrder.id,
          newOrder.orderNumber,
          newOrder.userIdentifier,
          newOrder.customerName,
          newOrder.shippingAddress,
          newOrder.phone,
          JSON.stringify(newOrder.items),
          newOrder.subtotal,
          newOrder.shipping,
          newOrder.total,
          newOrder.status,
          newOrder.createdAt,
          newOrder.trackingNumber,
        ]
      );
    } catch (err: any) {
      console.warn('⚠️ PG createOrder error:', err.message);
    }
  }
  return newOrder;
}

export async function updateOrderStatus(db: Db, id: string, status: Order['status']): Promise<Order | null> {
  const pool = db.pgPool;
  if (!pool) return null;
  try {
    await pool.query(`UPDATE public.orders SET status = $1 WHERE id = $2 OR order_number = $2`, [
      status,
      id,
    ]);
    return (await getOrderById(db, id)) || null;
  } catch (err: any) {
    console.warn('⚠️ PG updateOrderStatus error:', err.message);
    return null;
  }
}

export async function deleteOrder(db: Db, id: string): Promise<boolean> {
  const pool = db.pgPool;
  if (!pool) return false;
  try {
    const res = await pool.query(
      `DELETE FROM public.orders WHERE id = $1 OR order_number = $1`,
      [id]
    );
    return (res.rowCount || 0) > 0;
  } catch (err: any) {
    console.warn('⚠️ PG deleteOrder error:', err.message);
    throw err;
  }
}
