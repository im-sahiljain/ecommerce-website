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

    const updated = await db.updateFacet(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Facet not found' }, { status: 404 });
    }

    revalidatePath('/shop');

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update facet' },
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
    const deleted = await db.deleteFacet(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Facet not found' }, { status: 404 });
    }

    revalidatePath('/shop');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete facet' },
      { status: 500 }
    );
  }
}
