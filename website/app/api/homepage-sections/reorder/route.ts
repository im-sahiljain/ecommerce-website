import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: 'orderedIds array required' },
        { status: 400 }
      );
    }

    const updated = await db.reorderHomepageSections(orderedIds);

    revalidatePath('/');

    return NextResponse.json(updated, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to reorder homepage sections' },
      { status: 500 }
    );
  }
}
