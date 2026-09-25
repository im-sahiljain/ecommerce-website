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
      const updated = await db.setPaintBrushAvailable(id, body.available);
      if (!updated) return NextResponse.json({ error: 'Brush not found' }, { status: 404 });
      return NextResponse.json(updated);
    }
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'Brush name is required.' }, { status: 400 });
    }
    const updated = await db.updatePaintBrush(id, {
      name,
      size: typeof body.size === 'string' ? body.size : undefined,
    });
    if (!updated) return NextResponse.json({ error: 'Brush not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update brush' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.deletePaintBrush(id);
    if (!deleted) return NextResponse.json({ error: 'Brush not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete brush' }, { status: 500 });
  }
}
