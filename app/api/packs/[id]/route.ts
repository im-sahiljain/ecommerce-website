import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { packSlugError, packSlugFrom } from '@/lib/packSlug';
import { publicSlug } from '@/lib/slug';
import { revalidatePath } from 'next/cache';

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
    return NextResponse.json({ ...pack, slug: publicSlug(pack) }, { status: 200 });
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

    const updated = await db.updatePack(current.id, { ...body, slug: nextSlug });
    if (!updated) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
    }

    revalidatePath('/shop');
    revalidatePath('/');
    revalidatePath(`/product/${current.slug || current.id}`);
    revalidatePath(`/product/${nextSlug}`);

    return NextResponse.json(updated, { status: 200 });
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
