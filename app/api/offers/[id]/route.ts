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

    const updated = await db.updateOfferRule(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Offer rule not found' }, { status: 404 });
    }

    revalidatePath('/offers');

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update offer rule' },
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
    const deleted = await db.deleteOfferRule(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Offer rule not found' }, { status: 404 });
    }

    revalidatePath('/offers');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete offer rule' },
      { status: 500 }
    );
  }
}
