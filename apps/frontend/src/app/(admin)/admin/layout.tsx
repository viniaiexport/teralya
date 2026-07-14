import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { readSessionIdentity } from '@/lib/session/session';
export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {const identity=await readSessionIdentity();if(identity?.rol!=='administrador')redirect('/acceso');return <div className="private-shell"><a className="skip-link" href="#main-content">Saltar al contenido</a><header className="private-bar"><Link className="brand" href="/admin">Teralya Admin</Link><nav aria-label="Administración"><Link href="/admin">Dashboard</Link><Link href="/admin/pedidos">Pedidos</Link><Link href="/admin/bodegas">Bodegas</Link><Link href="/admin/vinos">Vinos</Link><Link href="/admin/incidencias">Incidencias</Link></nav></header><main id="main-content" tabIndex={-1}>{children}</main></div>;}
