import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Create a simple demo session without NextAuth
    const cookieStore = cookies();
    
    // Set a demo session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: 'demo-user-1',
        name: 'Demo User',
        email: 'demo@xinvoice.com',
      }
    });

    // Set a simple session cookie for demo mode
    response.cookies.set('demo-session', 'active', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;

  } catch (error) {
    console.error('Demo signin error:', error);
    return NextResponse.json(
      { error: 'Failed to start demo session' },
      { status: 500 }
    );
  }
}