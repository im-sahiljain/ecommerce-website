import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Pack } from '@/lib/db/types';
import { normalizeKit, toKitOffer } from '@/lib/kit';
import { packSlugError, packSlugFrom } from '@/lib/packSlug';
import { publicSlug } from '@/lib/slug';
import { revalidatePath } from 'next/cache';

async function presentPack(pack: Pack) {
  const supplies = await db.getKitSupplies();
  return {
    ...pack,
    slug: publicSlug(pack),
    kitOffer: toKitOffer(pack.kitContents, supplies),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pack = (await db.getPackBySlug(id)) ?? (await db.getPackById(id));
    if (!pack) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
    }
    return NextResponse.json(await presentPack(pack), { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch kit' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const current = (await db.getPackById(id)) ?? (await db.getPackBySlug(id));
    if (!current) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
    }

    const nextSlug =
      body.slug != null && String(body.slug).trim()
        ? packSlugFrom(body.name || current.name, body.slug)
        : current.slug || packSlugFrom(current.name, '');
    if (!nextSlug) {
      return NextResponse.json({ error: 'Enter a link for this kit.' }, { status: 400 });
    }
    const slugError = await packSlugError(nextSlug, current.id);
    if (slugError) {
      return NextResponse.json({ error: slugError }, { status: 400 });
    }

    const updates = { ...body, slug: nextSlug };
    if ('kitContents' in body) updates.kitContents = normalizeKit(body.kitContents) || null;
    delete updates.kitOffer;
    const updated = await db.updatePack(current.id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
    }

    revalidatePath('/shop');
    revalidatePath('/');
    revalidatePath(`/product/${current.slug || current.id}`);
    revalidatePath(`/product/${nextSlug}`);

    return NextResponse.json(await presentPack(updated), { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update kit' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.deletePack(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
    }

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete kit' },
      { status: 500 }
    );
  }
}
