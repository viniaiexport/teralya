export default function ReembolsosPage() {
  return (
    <>
      <h1>Reembolsos e incidencias</h1>
      <p className="legal-meta">Versión 1.0 · Julio 2026</p>

      <h2>Cuándo procede un reembolso</h2>
      <ul>
        <li>Desistimiento dentro de los 14 días desde la recepción del pedido.</li>
        <li>Cancelación del pedido antes del envío.</li>
        <li>El pago se confirmó pero el producto ya no estaba disponible: en ese caso el reembolso se procesa automáticamente.</li>
        <li>Una incidencia (vino dañado, pedido incompleto, error de la bodega) resuelta a tu favor tras su revisión.</li>
      </ul>

      <h2>Cómo se gestiona una incidencia</h2>
      <p>
        Cada incidencia que reportes sobre un pedido se revisa por nuestro equipo, que decide la resolución (reembolso total, parcial, reposición o una explicación si no procede). Te avisaremos del resultado.
      </p>

      <h2>Cómo se procesa el reembolso</h2>
      <p>
        El reembolso se realiza al mismo medio de pago que usaste. Si tu pedido incluía vino de varias bodegas, el reembolso se calcula según la parte correspondiente a cada una, salvo que la incidencia afecte a todo el pedido.
      </p>

      <h2>Responsabilidad de cada parte</h2>
      <p>
        La bodega es responsable de la calidad, el etiquetado y el estado del vino en el momento del envío, y de gestionar físicamente cualquier devolución. Teralya es responsable de que el flujo de pago, reembolso e incidencias funcione correctamente. Te pedimos que reportes cualquier incidencia con la mayor diligencia posible tras recibir tu pedido.
      </p>
    </>
  );
}
