import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(_req: NextRequest) {
  try {
    const themes = await db.getThemes();
    return NextResponse.json(themes, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, icon } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Theme name is required' },
        { status: 400 }
      );
    }

    const theme = await db.addTheme({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      icon,
    });

    revalidatePath('/shop');
    revalidatePath('/');

    return NextResponse.json(theme, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create theme' },
      { status: 500 }
    );
  }
}
