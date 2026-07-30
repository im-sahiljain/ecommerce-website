import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(_req: NextRequest) {
  try {
    const ageGroups = await db.getAgeGroups();
    return NextResponse.json(ageGroups, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch age groups' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const group = await db.addAgeGroup({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
    });

    revalidatePath('/shop');

    return NextResponse.json(group, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create age group' },
      { status: 500 }
    );
  }
}
