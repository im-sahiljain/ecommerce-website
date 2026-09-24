import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const active = body.active !== false;
    const product =
      (await db.getProductBySlug(id)) ?? (await db.getProductById(id));
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const result = await db.likeProduct(product.id, active);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to like product' },
      { status: 500 }
    );
  }
}
