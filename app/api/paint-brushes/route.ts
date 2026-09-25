import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const brushes = await db.getPaintBrushes();
    return NextResponse.json(brushes);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch brushes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'Brush name is required.' }, { status: 400 });
    }
    const created = await db.addPaintBrush({
      name,
      size: typeof body.size === 'string' ? body.size : undefined,
      price: catalogPrice(body.price),
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create brush' }, { status: 500 });
  }
}

function catalogPrice(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * 100) / 100;
}
