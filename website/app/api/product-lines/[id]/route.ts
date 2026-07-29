import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await db.updateProductLine(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Product line not found' }, { status: 404 });
    }

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update product line' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.deleteProductLine(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Product line not found' }, { status: 404 });
    }

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete product line' },
      { status: 500 }
    );
  }
}
