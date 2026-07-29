import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(_req: NextRequest) {
  try {
    const categories = await db.getCategories();
    return NextResponse.json(categories, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, productLineId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = await db.addCategory({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      productLineId,
    });

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json(category, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}
