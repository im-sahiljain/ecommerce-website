import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { changeAmount, reason, updatedBy } = body;

    if (typeof changeAmount !== 'number' || !reason) {
      return NextResponse.json(
        { error: 'changeAmount (number) and reason (string) are required.' },
        { status: 400 }
      );
    }

    const updated = await db.adjustProductStock(
      id,
      changeAmount,
      reason,
      updatedBy || 'Admin'
    );

    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    revalidatePath(`/product/${id}`);
    revalidatePath('/shop');

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to adjust stock' },
      { status: 500 }
    );
  }
}
