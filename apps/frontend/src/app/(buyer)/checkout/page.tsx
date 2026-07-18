import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AddressForm } from '@/components/address-form';
import { deleteAddressAction, prepareCheckoutAction } from './actions';
import { getBuyerCart } from '@/lib/cart/server';
import { addressLabel, formatEuro, type Address } from '@/lib/checkout/contracts';
import { listAddresses } from '@/lib/checkout/server';
import { readSessionIdentity } from '@/lib/session/session';

interface Props { searchParams: Promise<{ error?: string | string[]; request_id?: string | string[]; direccion?: string | string[] }> }

function AddressChoice({ address, name, defaultChecked }: { address: Address; name: 'direccion_envio_id' | 'direccion_facturacion_id'; defaultChecked: boolean }) {
  return <label className="address-choice"><input defaultChecked={defaultChecked} name={name} required type="radio" value={address.id}/><span><strong>{addressLabel(address)}</strong><small>{address.nombre_destinatario}<br/>{address.direccion}{address.direccion_adicional === undefined ? '' : `, ${address.direccion_adicional}`}<br/>{address.codigo_postal} {address.ciudad}{address.provincia === undefined ? '' : `, ${address.provincia}`} · {address.pais}</small></span></label>;
}

export default async function CheckoutPage({ searchParams }: Props) {
  const identity = await readSessionIdentity();
  if (identity?.rol !== 'comprador') redirect('/acceso?next=/checkout');
  const [addresses, cart, query] = await Promise.all([listAddresses(), getBuyerCart(), searchParams]);
  if (cart === undefined || cart.items.length === 0) redirect('/carrito');
  const shipping = addresses.filter((address) => address.activa && (address.uso === 'envio' || address.uso === 'ambos'));
  const billing = addresses.filter((address) => address.activa && (address.uso === 'facturacion' || address.uso === 'ambos'));
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const requestId = Array.isArray(query.request_id) ? query.request_id[0] : query.request_id;
  return <main className="checkout-page">
    <nav aria-label="Migas de pan" className="breadcrumbs"><Link href="/carrito">Carrito</Link><span aria-hidden="true">/</span><span aria-current="page">Checkout</span></nav>
    <div aria-label="Progreso de compra" className="checkout-steps"><span className="active">1 · Carrito</span><span className="active">2 · Direcciones</span><span>3 · Pago seguro</span><span>4 · Confirmación</span></div>
    <header className="checkout-heading"><p className="eyebrow">Compra protegida</p><h1>Direcciones y resumen</h1><p>Revisa dónde debe enviarse y facturarse tu pedido antes de continuar al checkout seguro de Stripe.</p></header>
    {error !== undefined && <div className="form-status form-error" role="alert"><p>{error === 'direcciones' ? 'Selecciona una dirección de envío y otra de facturación.' : 'No se ha podido preparar el pedido. Revisa el carrito y las direcciones.'}</p>{requestId !== undefined && <small>Referencia: {requestId}</small>}</div>}
    <div className="checkout-layout"><section className="checkout-addresses">
      {addresses.length === 0 ? <section className="catalog-message"><h2>Añade tu primera dirección</h2><p>Necesitamos una dirección válida para preparar el pedido.</p></section> : <form action={prepareCheckoutAction} id="checkout-form"><fieldset><legend>Dirección de envío</legend>{shipping.length === 0 ? <p className="cart-warning">No tienes una dirección válida para envío.</p> : shipping.map((address, index) => <AddressChoice address={address} defaultChecked={address.es_principal || index === 0} key={address.id} name="direccion_envio_id"/>)}</fieldset><fieldset><legend>Dirección de facturación</legend>{billing.length === 0 ? <p className="cart-warning">No tienes una dirección válida para facturación.</p> : billing.map((address, index) => <AddressChoice address={address} defaultChecked={address.es_principal || index === 0} key={address.id} name="direccion_facturacion_id"/>)}</fieldset></form>}
      {addresses.length > 0 && <details className="address-management"><summary>Gestionar direcciones guardadas</summary>{addresses.map((address) => <div className="saved-address" key={address.id}><span><strong>{addressLabel(address)}</strong><small>{address.direccion}, {address.ciudad}</small></span><form action={deleteAddressAction}><input name="direccion_id" type="hidden" value={address.id}/><button className="text-button" type="submit">Eliminar</button></form></div>)}</details>}
      <AddressForm idempotencyKey={randomUUID()} key={randomUUID()}/>
    </section>
    <aside className="checkout-summary"><p className="card-kicker">Tu selección</p><h2>Resumen del pedido</h2>{cart.items.map((item) => <div className="checkout-line" key={item.id}><span>{item.cantidad} × {item.vino.nombre_comercial}</span><strong>{formatEuro(item.importe_total)}</strong></div>)}<dl><div><dt>Subtotal</dt><dd>{formatEuro(cart.subtotal)}</dd></div><div><dt>Envío</dt><dd>{formatEuro(cart.gastos_envio)}</dd></div><div><dt>Descuentos</dt><dd>−{formatEuro(cart.descuentos)}</dd></div><div className="summary-total"><dt>Total</dt><dd>{formatEuro(cart.total)}</dd></div></dl><p>El backend volverá a validar precios, publicación y stock antes de crear el Pedido.</p><button className="button primary cart-checkout" disabled={shipping.length === 0 || billing.length === 0} form="checkout-form" type="submit">Preparar pedido</button><div className="checkout-trust"><span>Pago procesado por Stripe</span><span>Pedido validado antes del cobro</span><span>Vendido y enviado por las bodegas</span><span>Datos protegidos y cifrados</span></div></aside></div>
  </main>;
}
