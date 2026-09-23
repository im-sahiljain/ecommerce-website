import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest) {
  try {
    const [orderStats, products] = await Promise.all([
      db.getOrderStats(),
      db.getProducts(),
    ]);

    return NextResponse.json(
      {
        totalProducts: products.length,
        totalOrders: orderStats.totalOrders,
        totalRevenue: orderStats.totalRevenue,
        pendingOrders: orderStats.pendingOrders,
        recentOrders: [],
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
