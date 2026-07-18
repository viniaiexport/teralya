import Link from 'next/link';
import { redirect } from 'next/navigation';
import { readSessionIdentity } from '@/lib/session/session';

export default async function BuyerAccountPage() {
  const identity = await readSessionIdentity();
  if (identity?.rol !== 'comprador') redirect('/acceso');
  return <section className="private-page account-page">
    <header className="private-heading"><p className="eyebrow">Bienvenido de nuevo</p><h1>Mi cuenta</h1><p>Consulta tus compras y continúa descubriendo vinos vendidos directamente por sus bodegas.</p></header>
    <div className="private-card-grid">
      <article className="private-card"><p className="card-kicker">Tus compras</p><h2>Mis pedidos</h2><p>Revisa el estado global, las líneas, las bodegas y las direcciones congeladas de cada compra.</p><Link className="button primary" href="/pedidos">Ver mis pedidos</Link></article>
      <article className="private-card"><p className="card-kicker">Seguir descubriendo</p><h2>Vuelve al origen</h2><p>Explora la selección pública y conoce las bodegas que están construyendo Teralya.</p><Link className="button secondary" href="/vinos">Explorar vinos</Link></article>
    </div>
  </section>;
}
