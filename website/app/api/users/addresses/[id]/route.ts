import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const identifier =
      searchParams.get('userIdentifier') || searchParams.get('identifier');

    if (!identifier) {
      return NextResponse.json(
        { error: 'User identifier is required' },
        { status: 400 }
      );
    }

    const success = await db.deleteUserAddress(identifier, id);
    if (!success) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    revalidatePath('/account');
    revalidatePath('/checkout');

    return NextResponse.json(
      { success: true, message: 'Address deleted' },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete address' },
      { status: 500 }
    );
  }
}
