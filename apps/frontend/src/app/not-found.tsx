import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="screen-state">
      <h1>Página no encontrada</h1>
      <Link className="button primary" href="/">Volver al inicio</Link>
    </section>
  );
}
