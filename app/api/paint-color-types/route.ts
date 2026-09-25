import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const types = await db.getPaintColorTypes();
    return NextResponse.json(types);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch color types' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'Color type name is required.' }, { status: 400 });
    }
    const created = await db.addPaintColorType(name);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create color type' }, { status: 500 });
  }
}
