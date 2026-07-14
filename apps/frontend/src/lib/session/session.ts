import 'server-only';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'teralya_session';

export type UserRole = 'comprador' | 'bodega' | 'administrador';

export interface SessionIdentity {
  usuario_id: string;
  rol: UserRole;
  bodega_id?: string;
}

export async function readAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function writeAccessToken(token: string, expiresAt: Date): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export async function clearAccessToken(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
