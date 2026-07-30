import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(_req: NextRequest) {
  try {
    const packs = await db.getPacks();
    return NextResponse.json(packs, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch packs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      price,
      originalPrice,
      description,
      image,
      images,
      productIds,
      productLineId,
      categoryId,
      inStock,
      featured,
    } = body;

    if (!name || !price || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: 'Pack name, price, and selected productIds array are required.' },
        { status: 400 }
      );
    }

    const newPack = await db.addPack({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      description: description || '',
      image: image || '',
      images: images || [],
      productIds,
      productLineId: productLineId || undefined,
      categoryId: categoryId || undefined,
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      featured: Boolean(featured),
    });

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json(newPack, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create pack' },
      { status: 500 }
    );
  }
}
