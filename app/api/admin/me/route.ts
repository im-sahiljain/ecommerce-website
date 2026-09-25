import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { readAdminSessionUserId } from '@/lib/adminSession';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '').trim();
    const userId = token ? readAdminSessionUserId(token) : null;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const adminUser = await db.getAdminUserById(userId);
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        admin: {
          username: adminUser.identifier || adminUser.email,
          name: adminUser.name || 'Admin',
          role: adminUser.role,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch admin profile' },
      { status: 500 }
    );
  }
}
