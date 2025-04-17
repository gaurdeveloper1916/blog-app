import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import { authMiddleware } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = await authMiddleware(request);

    if ('error' in auth) {
      return auth;
    }

    // Connect to the database
    await connectToDatabase();

    // Get user details
    const user = await User.findById(auth.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
