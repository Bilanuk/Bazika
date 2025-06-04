import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { UserRoles } from '@/types/user-roles';
import { NextRequest, NextResponse } from 'next/server';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== UserRoles.ADMIN) {
    throw new Error('Admin access required');
  }
  return session;
}

export async function withAdminAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      await requireAdmin();
      return handler(request);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Access denied' },
        { status: 403 }
      );
    }
  };
} 