import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    return NextResponse.json(
      {
        admin: {
          username: 'admin@littlecreators.com',
          name: 'Admin User',
          role: 'admin',
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
