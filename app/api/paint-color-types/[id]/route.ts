import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (typeof body.available === 'boolean' && !body.name) {
      const updated = await db.setPaintColorTypeAvailable(id, body.available);
      if (!updated) return NextResponse.json({ error: 'Color type not found' }, { status: 404 });
      return NextResponse.json(updated);
    }
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'Color type name is required.' }, { status: 400 });
    }
    const updated = await db.updatePaintColorType(id, name);
    if (!updated) return NextResponse.json({ error: 'Color type not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update color type' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.deletePaintColorType(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const message = err.message || 'Failed to delete color type';
    const status = message.includes('Delete or move') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
