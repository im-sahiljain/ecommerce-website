import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packSlugError, packSlugFrom } from '@/lib/packSlug';
import { publicSlug } from '@/lib/slug';
import { revalidatePath } from 'next/cache';

export async function GET(_req: NextRequest) {
  try {
    const packs = await db.getPacks();
    return NextResponse.json(
      packs.map((pack) => ({ ...pack, slug: publicSlug(pack) })),
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch kits' },
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
        { error: 'Kit name, price, and selected products are required.' },
        { status: 400 }
      );
    }

    const nextSlug = packSlugFrom(name, slug);
    if (!nextSlug) {
      return NextResponse.json({ error: 'Enter a link for this kit.' }, { status: 400 });
    }
    const slugError = await packSlugError(nextSlug);
    if (slugError) {
      return NextResponse.json({ error: slugError }, { status: 400 });
    }

    const newPack = await db.addPack({
      name,
      slug: nextSlug,
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
      { error: err.message || 'Failed to create kit' },
      { status: 500 }
    );
  }
}
