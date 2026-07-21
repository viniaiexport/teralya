import Link from 'next/link';
import type { Route } from 'next';

export default function ForWineriesPage() {
  return (
    <div className="professional-page">
      <section aria-labelledby="professional-title" className="professional-hero">
        <div className="professional-hero-copy">
          <p className="eyebrow">Teralya para bodegas</p>
          <h1 id="professional-title">Tu bodega merece vender por su nombre.</h1>
          <p>Presenta tus vinos con contexto, conserva el control de tu catálogo y llega a compradores que valoran el origen. Tú vendes y envías; Teralya facilita el encuentro y la compra.</p>
          <div className="professional-actions">
            <Link className="button primary" href={'/registro/bodega' as Route}>Solicitar acceso profesional</Link>
            <Link className="button secondary" href="/bodegas">Ver bodegas en Teralya</Link>
          </div>
          <div aria-label="Ventajas para bodegas" className="professional-trust">
            <span><strong>Tu marca visible</strong>Sin perderte detrás del marketplace</span>
            <span><strong>Tu catálogo</strong>Precios, stock, imágenes y relato propio</span>
            <span><strong>Venta directa</strong>Preparas y envías cada pedido</span>
          </div>
        </div>
        <div aria-label="Barricas en una bodega europea" className="professional-hero-media" role="img"><span>De la bodega<br/>al comprador</span></div>
      </section>

      <section aria-labelledby="professional-value-title" className="professional-statement">
        <p className="eyebrow">Una relación más directa</p>
        <h2 id="professional-value-title">El productor vuelve al centro de la venta.</h2>
        <p>Tu ficha explica quién eres, dónde elaboras y por qué tus vinos son diferentes. Las condiciones de envío se muestran antes de comprar y cada pedido conserva la identidad de la bodega.</p>
      </section>

      <section aria-label="Herramientas para bodegas" className="professional-benefits">
        <article><span>01</span><h2>Escaparate con identidad</h2><p>Historia, territorio, filosofía, imágenes y vinos reunidos en una presentación cuidada.</p></article>
        <article><span>02</span><h2>Control comercial</h2><p>Gestiona disponibilidad, precio, stock y condiciones de envío desde tu área profesional.</p></article>
        <article><span>03</span><h2>Operación clara</h2><p>Recibe tus SubPedidos, actualiza su preparación y comunica el seguimiento al comprador.</p></article>
      </section>

      <section aria-labelledby="professional-process-title" className="professional-process">
        <header><p className="eyebrow">Empezar es sencillo</p><h2 id="professional-process-title">De la solicitud a la primera venta.</h2></header>
        <ol>
          <li><b>1</b><div><h3>Presenta la bodega</h3><p>Completa los datos profesionales necesarios para la validación.</p></div></li>
          <li><b>2</b><div><h3>Crea tu perfil</h3><p>Añade historia, territorio y condiciones de preparación y entrega.</p></div></li>
          <li><b>3</b><div><h3>Publica tus vinos</h3><p>Carga fichas e imágenes y envíalas a revisión antes de aparecer en el catálogo.</p></div></li>
          <li><b>4</b><div><h3>Vende y envía</h3><p>Gestiona cada pedido desde tu panel manteniendo el contacto con la operación.</p></div></li>
        </ol>
      </section>

      <section aria-labelledby="professional-cta-title" className="professional-cta">
        <div><p className="eyebrow">Bodegas fundadoras</p><h2 id="professional-cta-title">Haz que tu próximo comprador descubra primero tu historia.</h2><p>Solicita el acceso profesional y prepara tu bodega para formar parte de la selección inicial de Teralya.</p></div>
        <Link className="button primary" href={'/registro/bodega' as Route}>Presentar mi bodega</Link>
      </section>
    </div>
  );
}
