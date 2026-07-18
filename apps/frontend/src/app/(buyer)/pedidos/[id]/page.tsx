import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cancelOrderAction } from "@/app/(buyer)/pedidos/actions";
import { CancelOrderForm } from "@/components/cancel-order-form";
import { ApiProblem } from "@/lib/api/problem";
import { isUuid } from "@/lib/cart/contracts";
import { formatEuro } from "@/lib/checkout/contracts";
import { formatOrderDate, orderStateLabel } from "@/lib/orders/contracts";
import { getBuyerOrder } from "@/lib/orders/server";
import { readSessionIdentity } from "@/lib/session/session";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cancelacion?: string; error?: string }>;
}

function AddressBlock({
  title,
  address,
}: {
  title: string;
  address: {
    nombre_destinatario: string;
    direccion: string;
    codigo_postal: string;
    ciudad: string;
    pais: string;
    empresa?: string;
    direccion_adicional?: string;
    provincia?: string;
  };
}) {
  return (
    <article className="address-snapshot">
      <h2>{title}</h2>
      <address>
        <strong>{address.nombre_destinatario}</strong>
        {address.empresa && <span>{address.empresa}</span>}
        <span>{address.direccion}</span>
        {address.direccion_adicional && (
          <span>{address.direccion_adicional}</span>
        )}
        <span>
          {address.codigo_postal} {address.ciudad}
          {address.provincia ? `, ${address.provincia}` : ""}
        </span>
        <span>{address.pais}</span>
      </address>
    </article>
  );
}

function CancellationStatus({
  order,
}: {
  order: Awaited<ReturnType<typeof getBuyerOrder>>;
}) {
  if (order.cancelacion === undefined) return null;
  const { cancelacion } = order;
  const message =
    cancelacion.estado === "completada"
      ? "El pedido está cancelado y el reembolso ha sido confirmado."
      : cancelacion.estado === "fallida"
        ? "El último intento de reembolso no pudo completarse. Puedes volver a intentarlo mientras el pedido siga siendo cancelable."
        : "La cancelación está en proceso. La operativa logística queda bloqueada hasta que Stripe confirme el reembolso.";
  return (
    <section
      className={`form-status ${cancelacion.estado === "fallida" ? "form-error" : "form-success"}`}
      aria-live="polite"
    >
      <h2>Estado de la cancelación</h2>
      <p>{message}</p>
      <p>Solicitada el {formatOrderDate(cancelacion.solicitada_at)}.</p>
      {cancelacion.estado === "procesando" && (
        <form action={cancelOrderAction}>
          <input name="pedido_id" type="hidden" value={order.id} />
          <input name="confirmacion_cancelacion" type="hidden" value="on" />
          <button className="button secondary" type="submit">
            Actualizar estado del reembolso
          </button>
        </form>
      )}
    </section>
  );
}

export default async function BuyerOrderDetailPage({
  params,
  searchParams,
}: Props) {
  const identity = await readSessionIdentity();
  if (identity?.rol !== "comprador") redirect("/acceso");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!isUuid(id)) notFound();
  let order;
  try {
    order = await getBuyerOrder(id);
  } catch (error) {
    if (
      error instanceof ApiProblem &&
      [403, 404].includes(error.problem.status)
    )
      notFound();
    return (
      <main className="screen-state screen-state-error">
        <h1>No hemos podido cargar el pedido</h1>
        <p className="screen-state-content">
          Inténtalo de nuevo dentro de unos instantes.
        </p>
        {error instanceof ApiProblem && (
          <p className="request-reference">
            Referencia: {error.problem.request_id}
          </p>
        )}
        <Link
          className="button secondary"
          href={`/pedidos/${encodeURIComponent(id)}`}
        >
          Reintentar
        </Link>
      </main>
    );
  }

  return (
    <main className="private-page order-detail-page">
      <nav className="breadcrumbs" aria-label="Migas de pan">
        <Link href="/cuenta">Mi cuenta</Link>
        <span aria-hidden="true">/</span>
        <Link href="/pedidos">Mis pedidos</Link>
        <span aria-hidden="true">/</span>
        <span>{order.numero_pedido}</span>
      </nav>
      <header className="private-heading order-detail-heading">
        <div>
          <p className="eyebrow">PT-COM-007</p>
          <h1>Pedido {order.numero_pedido}</h1>
          <p>Realizado el {formatOrderDate(order.created_at)}</p>
        </div>
        <span className={`status-badge status-${order.estado}`}>
          {orderStateLabel(order.estado)}
        </span>
      </header>
      {query.cancelacion === "procesando" && (
        <div className="form-status form-success">
          <p>
            Solicitud recibida. Estamos verificando el reembolso con Stripe.
          </p>
        </div>
      )}
      {query.error === "cancelacion" && (
        <div className="form-status form-error">
          <p>
            No hemos podido confirmar el resultado de la cancelación. Actualiza
            el pedido antes de volver a intentarlo.
          </p>
        </div>
      )}
      <CancellationStatus order={order} />
      <div className="order-detail-layout">
        <div>
          <section className="order-lines" aria-labelledby="order-lines-title">
            <h2 id="order-lines-title">Vinos del pedido</h2>
            {order.lineas.map((line) => (
              <article className="order-line" key={line.id}>
                <div>
                  <h3>{line.nombre_vino}</h3>
                  <p>
                    {line.bodega}
                    {line.anada === undefined ? "" : ` · Añada ${line.anada}`}
                  </p>
                  <small>
                    {line.cantidad} × {formatEuro(line.precio_unitario)}
                  </small>
                </div>
                <strong>{formatEuro(line.importe_total)}</strong>
              </article>
            ))}
          </section>
          <div className="snapshot-grid">
            <AddressBlock
              title="Dirección de envío"
              address={order.direccion_envio_snapshot}
            />
            <AddressBlock
              title="Dirección de facturación"
              address={order.direccion_facturacion_snapshot}
            />
          </div>
        </div>
        <aside className="checkout-summary order-totals">
          <h2>Resumen</h2>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatEuro(order.totales.subtotal)}</dd>
            </div>
            <div>
              <dt>Envío</dt>
              <dd>{formatEuro(order.totales.gastos_envio)}</dd>
            </div>
            <div>
              <dt>Impuestos</dt>
              <dd>{formatEuro(order.totales.impuestos)}</dd>
            </div>
            <div>
              <dt>Descuentos</dt>
              <dd>−{formatEuro(order.totales.descuentos)}</dd>
            </div>
            <div className="summary-total">
              <dt>Total</dt>
              <dd>{formatEuro(order.totales.total)}</dd>
            </div>
          </dl>
          <p>
            Importes y líneas congelados en el momento de confirmar el pedido.
          </p>
        </aside>
      </div>
      {order.puede_cancelar && <CancelOrderForm orderId={order.id} />}
      {!order.puede_cancelar &&
        order.cancelacion === undefined &&
        !["cancelado", "devuelto"].includes(order.estado) && (
          <p className="form-help">
            La cancelación directa deja de estar disponible cuando el pedido
            entra en expedición, entrega o incidencia. Consulta la{" "}
            <Link href="/legal/desistimiento">política de desistimiento</Link>{" "}
            para otras opciones.
          </p>
        )}
    </main>
  );
}
