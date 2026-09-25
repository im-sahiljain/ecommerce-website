import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kitExtraPerPiece, selectionToCustomization, toKitOffer } from '@/lib/kit';
import { ACCOUNT_AUTH_PAUSED } from '@/lib/accountAuth';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdentifier = searchParams.get('userIdentifier');

    if (userIdentifier && typeof userIdentifier === 'string') {
      const userOrders = await db.getOrdersByUser(userIdentifier);
      return NextResponse.json(userOrders, { status: 200 });
    }

    const pageParam = searchParams.get('page');
    if (pageParam) {
      const page = Math.max(1, Number(pageParam) || 1);
      const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 20)));
      const status = searchParams.get('status') || undefined;
      const result = await db.listOrders({
        status,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      return NextResponse.json({ ...result, page, pageSize }, { status: 200 });
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

    const attachAccount =
      !ACCOUNT_AUTH_PAUSED &&
      Boolean(userIdentifier) &&
      userIdentifier !== 'guest@littlecreators.com';

    if (attachAccount) {
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

    const pricedItems = await priceOrderItems(items);
    const pricedSubtotal = roundMoney(
      pricedItems.reduce(
        (sum: number, item: { price: number; quantity: number }) =>
          sum + Number(item.price) * Number(item.quantity || 1),
        0,
      ),
    );
    const pricedShipping = Number(shipping || 0);

    const newOrder = await db.createOrder({
      userIdentifier,
      customerName,
      shippingAddress,
      phone: phone || '',
      items: pricedItems,
      subtotal: pricedSubtotal,
      shipping: pricedShipping,
      total: roundMoney(pricedSubtotal + pricedShipping),
      status: customStatus || 'Pending',
    });

    if (attachAccount) {
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

function roundMoney(amount: number) {
  return Math.round(amount * 100) / 100;
}

async function priceOrderItems(items: any[]) {
  const [products, packs, supplies] = await Promise.all([
    db.getProducts(),
    db.getPacks(),
    db.getKitSupplies(),
  ]);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const packsById = new Map(packs.map((pack) => [pack.id, pack]));

  return items.map((item) => {
    const product = productsById.get(item.productId);
    const pack = packsById.get(item.productId);
    const base = product ? Number(product.price) : pack ? Number(pack.price) : null;
    if (base == null) return item;

    const offer = product
      ? toKitOffer(product.kitContents, supplies)
      : toKitOffer(pack?.kitContents, supplies);
    const selection = {
      colorIds: Array.isArray(item.customization?.colors)
        ? item.customization.colors
            .map((color: { id?: string }) => color.id)
            .filter((id: string | undefined): id is string => Boolean(id))
        : [],
      brushes: Array.isArray(item.customization?.brushes)
        ? item.customization.brushes
            .filter((brush: { id?: string }) => brush.id)
            .map((brush: { id: string; quantity?: number }) => ({
              id: brush.id,
              quantity: Number(brush.quantity) || 0,
            }))
        : [],
    };
    const extra = kitExtraPerPiece(offer, selection);
    const customization = selectionToCustomization(offer, selection);

    return {
      ...item,
      price: roundMoney(base + extra),
      customization: customization
        ? { ...customization, extraPerPiece: extra }
        : extra > 0
          ? { ...(item.customization || {}), extraPerPiece: extra }
          : item.customization,
    };
  });
}
