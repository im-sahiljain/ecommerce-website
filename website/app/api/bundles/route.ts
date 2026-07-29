import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(_req: NextRequest) {
  try {
    const rules = await db.getBundleRules();
    return NextResponse.json(rules, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch bundle rules' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, applicableScope, scopeValue, tiers, isActive, priority } = body;

    if (!name || !tiers || !Array.isArray(tiers)) {
      return NextResponse.json(
        { error: 'Bundle name and discount tiers are required.' },
        { status: 400 }
      );
    }

    const newRule = await db.addBundleRule({
      name,
      applicableScope: applicableScope || 'all',
      scopeValue,
      tiers,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      priority: Number(priority || 0),
    });

    revalidatePath('/shop');

    return NextResponse.json(newRule, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create bundle rule' },
      { status: 500 }
    );
  }
}
