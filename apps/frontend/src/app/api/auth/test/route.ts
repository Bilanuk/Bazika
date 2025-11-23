import { NextRequest, NextResponse } from 'next/server';
import { getSession, getCurrentUser, requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const user = await getCurrentUser();
    
    console.log('Session:', session);
    console.log('User:', user);
    
    let adminCheck = null;
    try {
      await requireAdmin();
      adminCheck = 'success';
    } catch (error) {
      adminCheck = error instanceof Error ? error.message : 'failed';
    }
    
    return NextResponse.json({
      session: !!session,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      } : null,
      adminCheck,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      session: false,
      user: null,
      adminCheck: 'error',
    });
  }
} 