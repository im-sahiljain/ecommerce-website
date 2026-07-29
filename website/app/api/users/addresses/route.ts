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

    const addresses = await db.getUserAddresses(identifier);
    return NextResponse.json(addresses, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userIdentifier,
      identifier,
      label,
      fullName,
      phone,
      addressLine,
      city,
      state,
      zipCode,
      isDefault,
    } = body;

    const targetIdentifier = userIdentifier || identifier;
    if (!targetIdentifier) {
      return NextResponse.json(
        { error: 'User identifier is required' },
        { status: 400 }
      );
    }

    if (!addressLine || !city || !state || !zipCode) {
      return NextResponse.json(
        {
          error:
            'Please provide full address details (street, city, state, zip code).',
        },
        { status: 400 }
      );
    }

    const newAddress = await db.addUserAddress(targetIdentifier, {
      label: label || 'Home',
      fullName: fullName || '',
      phone: phone || '',
      addressLine,
      city,
      state,
      zipCode,
      isDefault: Boolean(isDefault),
    });

    revalidatePath('/account');
    revalidatePath('/checkout');

    return NextResponse.json(newAddress, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to add address' },
      { status: 500 }
    );
  }
}
