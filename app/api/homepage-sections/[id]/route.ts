import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { HOMEPAGE_CMS_PAUSED } from '@/lib/homepageCms';

function pausedResponse() {
  return NextResponse.json(
    {
      paused: true,
      message:
        'Homepage CMS is not used by the storefront. Database operations are paused.',
    },
    { status: 503 }
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (HOMEPAGE_CMS_PAUSED) return pausedResponse();
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await db.updateHomepageSection(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: 'Homepage section not found' },
        { status: 404 }
      );
    }

    revalidatePath('/');

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update homepage section' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (HOMEPAGE_CMS_PAUSED) return pausedResponse();
  try {
    const { id } = await params;
    const deleted = await db.deleteHomepageSection(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Homepage section not found' },
        { status: 404 }
      );
    }

    revalidatePath('/');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete homepage section' },
      { status: 500 }
    );
  }
}
