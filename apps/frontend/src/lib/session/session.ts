import 'server-only';
import { createHmac,timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'teralya_session';
const IDENTITY_COOKIE = 'teralya_identity';
const SESSION_TTL_MS = 28_800_000;

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
  const maximum=new Date(Date.now()+SESSION_TTL_MS);
  const safeExpiry=new Date(Math.min(expiresAt.getTime(),maximum.getTime()));
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: safeExpiry,
  });
}

function signature(token:string,payload:string):string{return createHmac('sha256',token).update(payload).digest('base64url')}
function serializeIdentity(token:string,identity:SessionIdentity):string{const payload=Buffer.from(JSON.stringify(identity)).toString('base64url');return `${payload}.${signature(token,payload)}`}
export async function writeSession(token:string,identity:SessionIdentity,expiresAt:Date):Promise<void>{await writeAccessToken(token,expiresAt);const maximum=new Date(Date.now()+SESSION_TTL_MS);const safeExpiry=new Date(Math.min(expiresAt.getTime(),maximum.getTime()));(await cookies()).set(IDENTITY_COOKIE,serializeIdentity(token,identity),{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',expires:safeExpiry})}
export async function readSessionIdentity():Promise<SessionIdentity|undefined>{const store=await cookies();const token=store.get(SESSION_COOKIE)?.value;const packed=store.get(IDENTITY_COOKIE)?.value;if(token===undefined||packed===undefined)return undefined;const separator=packed.lastIndexOf('.');if(separator<1)return undefined;const payload=packed.slice(0,separator);const received=Buffer.from(packed.slice(separator+1));const expected=Buffer.from(signature(token,payload));if(received.length!==expected.length||!timingSafeEqual(received,expected))return undefined;try{const value:unknown=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));if(typeof value!=='object'||value===null)return undefined;const candidate=value as Partial<SessionIdentity>;if(typeof candidate.usuario_id!=='string'||!['comprador','bodega','administrador'].includes(candidate.rol??''))return undefined;if(candidate.bodega_id!==undefined&&typeof candidate.bodega_id!=='string')return undefined;return candidate as SessionIdentity}catch{return undefined}}

export async function clearAccessToken(): Promise<void> {
  const store=await cookies();store.delete(SESSION_COOKIE);store.delete(IDENTITY_COOKIE);
}
