'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { clearCartAction, removeCartItemAction, updateCartItemAction } from '@/app/(public)/carrito/actions';
import { announceCartChange, clearGuestCart, guestBottleCount, readGuestCart, removeGuestItem, updateGuestQuantity, writeGuestCart } from '@/lib/cart/guest-cart';
import { MAX_QUANTITY, type Cart, type CartActionResult, type GuestCart } from '@/lib/cart/contracts';

function money(value: string): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount) : value;
}

function uuid(): string {
  return crypto.randomUUID();
}

function GuestLine({ item, update, remove }: { item: GuestCart['items'][number]; update: (id: string, quantity: number) => void; remove: (id: string) => void }) {
  return <article className="cart-line">
    <div className="cart-image">{item.vino.imagen_url === undefined ? <span aria-hidden="true">T</span> : <Image alt={item.vino.imagen_alt ?? item.vino.nombre} fill sizes="96px" src={item.vino.imagen_url} unoptimized />}</div>
    <div className="cart-product"><h2><Link href={`/vinos/${encodeURIComponent(item.vino_id)}`}>{item.vino.nombre}</Link></h2><p>{item.vino.bodega}</p><strong>{money(item.vino.precio)}</strong></div>
    <div className="quantity-control" aria-label={`Cantidad de ${item.vino.nombre}`}><button aria-label="Quitar una botella" disabled={item.cantidad_local <= 1} onClick={() => update(item.vino_id, item.cantidad_local - 1)} type="button">−</button><output aria-live="polite">{item.cantidad_local}</output><button aria-label="Añadir una botella" disabled={item.cantidad_local >= MAX_QUANTITY} onClick={() => update(item.vino_id, item.cantidad_local + 1)} type="button">+</button></div>
    <strong className="line-total">{money((Number(item.vino.precio) * item.cantidad_local).toFixed(2))}</strong>
    <button className="text-button" onClick={() => remove(item.vino_id)} type="button">Eliminar</button>
  </article>;
}

export function GuestCartView() {
  const [cart, setCart] = useState<GuestCart>();
  useEffect(() => setCart(readGuestCart(localStorage, uuid)), []);
  function persist(next: GuestCart): void { setCart(next); writeGuestCart(localStorage, next); announceCartChange(); }
  if (cart === undefined) return <p className="cart-loading" role="status">Cargando carrito…</p>;
  if (cart.items.length === 0) return <section className="catalog-message"><h2>Tu carrito está vacío</h2><p>Explora el catálogo y añade los vinos que quieras comprar.</p><Link className="button primary" href="/vinos">Descubrir vinos</Link></section>;
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.vino.precio) * item.cantidad_local, 0);
  return <div className="cart-layout"><section aria-label="Vinos del carrito" className="cart-lines">{cart.items.map((item) => <GuestLine item={item} key={item.vino_id} remove={(id) => persist(removeGuestItem(cart, id))} update={(id, quantity) => persist(updateGuestQuantity(cart, id, quantity))} />)}<button className="text-button clear-cart" onClick={() => { clearGuestCart(localStorage); setCart({ fusion_id: uuid(), items: [] }); announceCartChange(); }} type="button">Vaciar carrito</button></section><aside className="cart-summary"><h2>Resumen</h2><dl><div><dt>Botellas</dt><dd>{guestBottleCount(cart)}</dd></div><div><dt>Subtotal estimado</dt><dd>{money(subtotal.toFixed(2))}</dd></div></dl><p>El precio, la disponibilidad y los gastos de envío se validarán al iniciar sesión.</p><Link className="button primary cart-checkout" href="/acceso?next=/carrito">Acceder para continuar</Link></aside></div>;
}

function AuthLine({ item, mutate, pending }: { item: Cart['items'][number]; mutate: (task: Promise<CartActionResult>) => void; pending: boolean }) {
  return <article className="cart-line">
    <div className="cart-image">{item.vino.imagen_principal === undefined ? <span aria-hidden="true">T</span> : <Image alt={item.vino.imagen_principal.alt_text} fill sizes="96px" src={item.vino.imagen_principal.url} unoptimized />}</div>
    <div className="cart-product"><h2><Link href={`/vinos/${encodeURIComponent(item.vino.id)}`}>{item.vino.nombre_comercial}</Link></h2><p>{item.vino.bodega.nombre_comercial}</p><strong>{money(item.precio_unitario)}</strong>{item.estado !== 'disponible' && <span className="cart-warning">{item.estado === 'precio_modificado' ? 'Precio actualizado' : 'No disponible para comprar'}</span>}</div>
    <div className="quantity-control" aria-label={`Cantidad de ${item.vino.nombre_comercial}`}><button aria-label="Quitar una botella" disabled={pending || item.cantidad <= 1} onClick={() => mutate(updateCartItemAction(item.id, item.cantidad - 1))} type="button">−</button><output aria-live="polite">{item.cantidad}</output><button aria-label="Añadir una botella" disabled={pending || item.cantidad >= MAX_QUANTITY} onClick={() => mutate(updateCartItemAction(item.id, item.cantidad + 1))} type="button">+</button></div>
    <strong className="line-total">{money(item.importe_total)}</strong>
    <button className="text-button" disabled={pending} onClick={() => mutate(removeCartItemAction(item.id))} type="button">Eliminar</button>
  </article>;
}

export function BuyerCartView({ initialCart }: { initialCart: Cart }) {
  const [cart, setCart] = useState(initialCart);
  const [notice, setNotice] = useState<string>();
  const [pending, startTransition] = useTransition();
  function mutate(task: Promise<CartActionResult>): void {
    setNotice(undefined);
    startTransition(async () => { const result = await task; if (result.ok && result.carrito !== undefined) setCart(result.carrito); else setNotice(result.message); });
  }
  if (cart.items.length === 0) return <section className="catalog-message"><h2>Tu carrito está vacío</h2><p>Explora el catálogo y añade los vinos que quieras comprar.</p><Link className="button primary" href="/vinos">Descubrir vinos</Link></section>;
  const blocked = cart.items.some((item) => item.estado === 'sin_stock' || item.estado === 'descatalogado');
  return <><div aria-live="polite">{pending && <p className="cart-operation">Actualizando carrito…</p>}{notice !== undefined && <p className="form-status form-error" role="alert">{notice}</p>}</div><div className="cart-layout"><section aria-label="Vinos del carrito" className="cart-lines">{cart.items.map((item) => <AuthLine item={item} key={item.id} mutate={mutate} pending={pending} />)}<button className="text-button clear-cart" disabled={pending} onClick={() => mutate(clearCartAction())} type="button">Vaciar carrito</button></section><aside className="cart-summary"><h2>Resumen</h2><dl><div><dt>Subtotal</dt><dd>{money(cart.subtotal)}</dd></div><div><dt>Envío</dt><dd>{money(cart.gastos_envio)}</dd></div><div><dt>Descuentos</dt><dd>−{money(cart.descuentos)}</dd></div><div className="summary-total"><dt>Total</dt><dd>{money(cart.total)}</dd></div></dl>{blocked ? <p className="cart-warning">Retira las líneas no disponibles antes de continuar.</p> : <Link className="button primary cart-checkout" href="/checkout">Continuar al checkout</Link>}</aside></div></>;
}
