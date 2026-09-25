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
      const updated = await db.setPaintColorAvailable(id, body.available);
      if (!updated) return NextResponse.json({ error: 'Color not found' }, { status: 404 });
      return NextResponse.json(updated);
    }
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || !body.colorTypeId) {
      return NextResponse.json(
        { error: 'Color name and color type are required.' },
        { status: 400 }
      );
    }
    const volumeMl = body.volumeMl === '' || body.volumeMl == null ? undefined : Number(body.volumeMl);
    const updated = await db.updatePaintColor(id, {
      name,
      hex: typeof body.hex === 'string' ? body.hex : undefined,
      colorTypeId: body.colorTypeId,
      volumeMl: Number.isFinite(volumeMl) ? volumeMl : undefined,
    });
    if (!updated) return NextResponse.json({ error: 'Color not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update color' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.deletePaintColor(id);
    if (!deleted) return NextResponse.json({ error: 'Color not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete color' }, { status: 500 });
  }
}
