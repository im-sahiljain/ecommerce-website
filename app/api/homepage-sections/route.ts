import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(_req: NextRequest) {
  try {
    const sections = await db.getHomepageSections();
    return NextResponse.json(sections, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch homepage sections' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type,
      title,
      subtitle,
      bgColor,
      textColor,
      layoutTemplate,
      productLineId,
      categoryId,
      isVisible,
      sortOrder,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Section title is required' },
        { status: 400 }
      );
    }

    const newSection = await db.addHomepageSection({
      type: type || 'categoryShowcase',
      title,
      subtitle,
      bgColor,
      textColor,
      layoutTemplate: layoutTemplate || 'grid',
      productLineId,
      categoryId,
      isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
      sortOrder: Number(sortOrder || 0),
    });

    revalidatePath('/');

    return NextResponse.json(newSection, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create homepage section' },
      { status: 500 }
    );
  }
}
