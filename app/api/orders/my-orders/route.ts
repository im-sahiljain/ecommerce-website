import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdentifier = searchParams.get('userIdentifier') || searchParams.get('identifier');

    if (!userIdentifier) {
      return NextResponse.json(
        { error: 'userIdentifier parameter is required' },
        { status: 400 }
      );
    }

    const userOrders = await db.getOrdersByUser(userIdentifier);
    return NextResponse.json(userOrders, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch user orders' },
      { status: 500 }
    );
  }
}
