import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Admin username/email and password are required.' },
        { status: 400 }
      );
    }

    const adminUser = await db.getAdminUserFromDatabase(username);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Invalid admin credentials or account not found in database.' },
        { status: 401 }
      );
    }

    if (adminUser.password !== password) {
      return NextResponse.json(
        { error: 'Invalid admin password. Access denied.' },
        { status: 401 }
      );
    }

    const adminInfo = {
      username: adminUser.email || adminUser.identifier,
      name: adminUser.name || 'Admin User',
      role: 'admin',
    };

    return NextResponse.json(
      {
        success: true,
        token: `admin-token-${Date.now()}`,
        admin: adminInfo,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error during admin login' },
      { status: 500 }
    );
  }
}
