import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { readSessionIdentity } from '@/lib/session/session';

export default async function WineryLayout({ children }: Readonly<{ children: ReactNode }>) {
  const identity = await readSessionIdentity();
  if (identity?.rol !== 'bodega' || identity.bodega_id === undefined) redirect('/acceso');
  return <main><header className="private-bar"><Link className="brand" href="/bodega">Teralya Bodega</Link><nav aria-label="Área de bodega"><Link href="/bodega">Panel</Link><Link href="/bodega/perfil">Perfil</Link><Link href="/bodega/vinos">Vinos</Link><Link href="/bodega/subpedidos">SubPedidos</Link><Link href="/vinos">Ver catálogo</Link></nav></header>{children}</main>;
}
