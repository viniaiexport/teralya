import Link from 'next/link';
import { redirect } from 'next/navigation';
import { readSessionIdentity } from '@/lib/session/session';

export default async function BuyerAccountPage() {
  const identity = await readSessionIdentity();
  if (identity?.rol !== 'comprador') redirect('/acceso');
  return <section className="private-page account-page">
    <header className="private-heading"><p className="eyebrow">PT-COM-001</p><h1>Mi cuenta</h1><p>Consulta tus compras y continúa descubriendo vinos de bodegas europeas.</p></header>
    <div className="private-card-grid">
      <article className="private-card"><p className="card-kicker">Pedidos</p><h2>Mis pedidos</h2><p>Revisa el estado global, las líneas, las bodegas y las direcciones congeladas de cada compra.</p><Link className="button primary" href="/pedidos">Ver mis pedidos</Link></article>
      <article className="private-card"><p className="card-kicker">Catálogo</p><h2>Seguir comprando</h2><p>Vuelve al catálogo público para descubrir vinos disponibles.</p><Link className="button secondary" href="/vinos">Explorar vinos</Link></article>
    </div>
  </section>;
}
