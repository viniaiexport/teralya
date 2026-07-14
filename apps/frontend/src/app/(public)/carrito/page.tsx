import Link from 'next/link';
import { BuyerCartView, GuestCartView } from '@/components/cart-view';
import { ApiProblem } from '@/lib/api/problem';
import { getBuyerCart } from '@/lib/cart/server';
import { readSessionIdentity } from '@/lib/session/session';

export default async function CartPage() {
  const identity = await readSessionIdentity();
  if (identity !== undefined && identity.rol !== 'comprador') {
    return <main className="screen-state"><p className="eyebrow">Carrito</p><h1>Área disponible para compradores</h1><p className="screen-state-content">Tu sesión actual corresponde a otro tipo de usuario.</p><Link className="button secondary" href="/">Volver al inicio</Link></main>;
  }
  let cart;
  if (identity?.rol === 'comprador') {
    try {
      cart = await getBuyerCart();
    } catch (error) {
      return <main className="screen-state"><p className="eyebrow">Carrito</p><h1>No hemos podido cargar tu carrito</h1><p className="screen-state-content">Inténtalo de nuevo dentro de unos instantes.</p>{error instanceof ApiProblem && <p className="request-reference">Referencia: {error.problem.request_id}</p>}<Link className="button secondary" href="/carrito">Reintentar</Link></main>;
    }
  }
  return <main className="cart-page"><header className="cart-heading"><p className="eyebrow">Tu selección</p><h1>Carrito</h1><p>{identity?.rol === 'comprador' ? 'Precios y disponibilidad validados por Teralya.' : 'Tu selección se guarda únicamente en este navegador hasta que inicies sesión.'}</p></header>{cart === undefined ? <GuestCartView /> : <BuyerCartView initialCart={cart} />}</main>;
}
