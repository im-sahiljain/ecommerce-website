import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdentifier = searchParams.get('userIdentifier');

    if (userIdentifier && typeof userIdentifier === 'string') {
      const userOrders = await db.getOrdersByUser(userIdentifier);
      return NextResponse.json(userOrders, { status: 200 });
    }

    const orders = await db.getOrders();
    return NextResponse.json(orders, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const settings = await db.getSettings();
    if (settings.isGlobalOrderingEnabled === false) {
      return NextResponse.json(
        { error: 'Website online cart & checkout is currently disabled by store admin.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      customerName,
      shippingAddress,
      phone,
      items,
      subtotal,
      shipping,
      total,
      userIdentifier: customIdentifier,
      status: customStatus,
      city,
      state,
      zipCode,
    } = body;

    let userIdentifier =
      customIdentifier || phone || 'guest@littlecreators.com';

    if (!items || !items.length || !customerName || !shippingAddress) {
      return NextResponse.json(
        { error: 'Please fill in all order details (items, customerName, shippingAddress).' },
        { status: 400 }
      );
    }

    if (userIdentifier && userIdentifier !== 'guest@littlecreators.com') {
      await db.findOrCreateUser(userIdentifier, customerName);
      await db.updateUserProfile(userIdentifier, {
        name: customerName,
        phone: phone || '',
        address: shippingAddress,
        city: city || '',
        state: state || '',
        zipCode: zipCode || '',
      });
    }

    const newOrder = await db.createOrder({
      userIdentifier,
      customerName,
      shippingAddress,
      phone: phone || '',
      items,
      subtotal: Number(subtotal),
      shipping: Number(shipping || 0),
      total: Number(total),
      status: customStatus || 'Pending',
    });

    if (userIdentifier && userIdentifier !== 'guest@littlecreators.com') {
      const existingAddresses = await db.getUserAddresses(userIdentifier);
      const matchesExisting = existingAddresses.some(
        (a) => a.addressLine.toLowerCase() === shippingAddress.toLowerCase()
      );

      if (!matchesExisting) {
        await db.addUserAddress(userIdentifier, {
          label:
            existingAddresses.length === 0
              ? 'Home'
              : `Address #${existingAddresses.length + 1}`,
          fullName: customerName,
          phone: phone || '',
          addressLine: shippingAddress,
          city: city || '',
          state: state || '',
          zipCode: zipCode || '',
          isDefault: existingAddresses.length === 0,
        });
      }
    }

    revalidatePath('/account');
    revalidatePath('/checkout');

    return NextResponse.json(newOrder, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
