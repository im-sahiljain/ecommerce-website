import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(_req: NextRequest) {
  try {
    const rules = await db.getOfferRules();
    return NextResponse.json(rules, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch offer rules' },
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
        { error: 'Offer name and discount tiers are required.' },
        { status: 400 }
      );
    }

    const newRule = await db.addOfferRule({
      name,
      applicableScope: applicableScope || 'all',
      scopeValue,
      tiers,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      priority: Number(priority || 0),
    });

    revalidatePath('/offers');

    return NextResponse.json(newRule, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create offer rule' },
      { status: 500 }
    );
  }
}
