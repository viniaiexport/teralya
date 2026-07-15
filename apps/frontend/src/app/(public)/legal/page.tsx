import Link from 'next/link';

export default function LegalIndexPage() {
  return (
    <>
      <h1>Documentos legales</h1>
      <p>
        Aquí encuentras las condiciones que rigen el uso de Teralya: cómo funciona el marketplace, cómo tratamos tus datos, qué cookies usamos, la edad mínima para comprar alcohol, y tus derechos de desistimiento, cancelación y reembolso.
      </p>
      <ul>
        <li><Link href="/legal/terminos">Términos y Condiciones de Uso</Link></li>
        <li><Link href="/legal/privacidad">Política de Privacidad</Link></li>
        <li><Link href="/legal/cookies">Política de Cookies</Link></li>
        <li><Link href="/legal/mayoria-edad">Mayoría de edad y condiciones de alcohol</Link></li>
        <li><Link href="/legal/desistimiento">Derecho de desistimiento y cancelación</Link></li>
        <li><Link href="/legal/reembolsos">Reembolsos e incidencias</Link></li>
      </ul>
    </>
  );
}
