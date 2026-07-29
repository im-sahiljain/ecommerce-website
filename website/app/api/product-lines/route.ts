import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(_req: NextRequest) {
  try {
    const lines = await db.getProductLines();
    return NextResponse.json(lines, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch product lines' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, coverImage, icon, isVisible, sortOrder } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Product line name is required' },
        { status: 400 }
      );
    }

    const newLine = await db.addProductLine({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      coverImage,
      icon: icon || '📦',
      isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
      sortOrder: Number(sortOrder || 0),
    });

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json(newLine, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create product line' },
      { status: 500 }
    );
  }
}
