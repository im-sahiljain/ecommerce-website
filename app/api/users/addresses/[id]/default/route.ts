import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const identifier =
      body.userIdentifier ||
      body.identifier ||
      searchParams.get('userIdentifier') ||
      searchParams.get('identifier');

    if (!identifier) {
      return NextResponse.json(
        { error: 'User identifier is required' },
        { status: 400 }
      );
    }

    const success = await db.setDefaultAddress(identifier, id);
    if (!success) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    revalidatePath('/account');
    revalidatePath('/checkout');

    return NextResponse.json(
      { success: true, message: 'Default address updated' },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update default address' },
      { status: 500 }
    );
  }
}
