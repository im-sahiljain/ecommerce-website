import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const colors = await db.getPaintColors();
    return NextResponse.json(colors);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch colors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || !body.colorTypeId) {
      return NextResponse.json(
        { error: 'Color name and color type are required.' },
        { status: 400 }
      );
    }
    const volumeMl = body.volumeMl === '' || body.volumeMl == null ? undefined : Number(body.volumeMl);
    const created = await db.addPaintColor({
      name,
      hex: typeof body.hex === 'string' ? body.hex : undefined,
      colorTypeId: body.colorTypeId,
      volumeMl: Number.isFinite(volumeMl) ? volumeMl : undefined,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create color' }, { status: 500 });
  }
}
