import Link from 'next/link';

export default function WineryDashboardPage() {
  return <section className="private-page account-page"><header className="private-heading"><p className="eyebrow">PT-BOD-001</p><h1>Panel de bodega</h1><p>Gestiona únicamente los recursos y envíos asociados a tu bodega.</p></header><div className="private-card-grid"><article className="private-card"><p className="card-kicker">Operativa</p><h2>SubPedidos</h2><p>Consulta las partes de pedidos asignadas a tu bodega y avanza su estado logístico.</p><Link className="button primary" href="/bodega/subpedidos">Gestionar SubPedidos</Link></article><article className="private-card"><p className="card-kicker">Próximo corte</p><h2>Perfil y vinos</h2><p>La gestión de perfil, catálogo propio e imágenes se incorporará en el siguiente corte de FE-007.</p></article></div></section>;
}
