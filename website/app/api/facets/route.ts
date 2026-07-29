import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(_req: NextRequest) {
  try {
    const facets = await db.getFacets();
    return NextResponse.json(facets, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch facets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      parentId,
      productLineId,
      facetGroup,
      coverImage,
      icon,
      description,
      seoTitle,
      seoDescription,
      isVisible,
      sortOrder,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Facet name is required' },
        { status: 400 }
      );
    }

    const newFacet = await db.addFacet({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      parentId,
      productLineId,
      facetGroup: facetGroup || 'General',
      coverImage,
      icon,
      description,
      seoTitle,
      seoDescription,
      isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
      sortOrder: Number(sortOrder || 0),
    });

    revalidatePath('/shop');

    return NextResponse.json(newFacet, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create facet' },
      { status: 500 }
    );
  }
}
