import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier =
      searchParams.get('userIdentifier') || searchParams.get('identifier');

    if (!identifier) {
      return NextResponse.json(
        { error: 'User identifier is required' },
        { status: 400 }
      );
    }

    const user = await db.getUserByIdentifier(identifier);
    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { password, ...profile } = user;
    return NextResponse.json(profile, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userIdentifier, identifier, ...updates } = body;

    const targetIdentifier = userIdentifier || identifier;
    if (!targetIdentifier) {
      return NextResponse.json(
        { error: 'User identifier is required' },
        { status: 400 }
      );
    }

    const updatedUser = await db.updateUserProfile(targetIdentifier, updates);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password, ...profile } = updatedUser;

    revalidatePath('/account');

    return NextResponse.json(
      {
        success: true,
        message: 'Profile and delivery address updated successfully',
        user: profile,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
