export default function PrivacidadPage() {
  return (
    <>
      <h1>Política de Privacidad</h1>
      <p className="legal-meta">Versión 1.0 · Julio 2026</p>
      <p className="legal-notice">
        Este documento está en fase inicial de revisión legal. Puede actualizarse antes del lanzamiento definitivo; te avisaremos si cambia de forma sustancial.
      </p>

      <h2>1. Qué datos tratamos</h2>
      <p>
        Tratamos los datos necesarios para operar tu cuenta y tus pedidos: nombre, apellidos, correo electrónico, contraseña (almacenada de forma cifrada), fecha de nacimiento y declaración de mayoría de edad, direcciones de envío y facturación, historial de pedidos, y una referencia de pago de Stripe — nunca los datos completos de tu tarjeta, que Stripe procesa directamente.
      </p>
      <p>
        La fecha de nacimiento se trata exclusivamente para verificar que cumples la edad mínima legal para comprar alcohol. No tratamos ninguna otra categoría especial de datos.
      </p>

      <h2>2. Con quién compartimos datos</h2>
      <p>
        Compartimos los datos estrictamente necesarios con Stripe (pagos) y con nuestros proveedores de correo electrónico transaccional y almacenamiento de imágenes, siempre bajo un contrato de encargo de tratamiento. No vendemos tus datos a terceros.
      </p>

      <h2>3. Cuánto tiempo conservamos tus datos</h2>
      <p>
        Conservamos los datos de tu cuenta y tus pedidos mientras tu cuenta esté activa y durante el plazo legal aplicable a obligaciones fiscales y de protección al consumidor tras su cierre.
      </p>

      <h2>4. Tus derechos</h2>
      <p>
        Puedes ejercer los derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición sobre tus datos, así como retirar tu consentimiento cuando el tratamiento se base en él, escribiéndonos a través del canal de contacto de la plataforma. También puedes reclamar ante la autoridad de control de protección de datos de tu país.
      </p>

      <h2>5. Menores de edad</h2>
      <p>
        Teralya no está dirigida a menores de 18 años. No solicitamos ni tratamos intencionadamente información de menores más allá de la fecha de nacimiento necesaria para verificar que no lo son.
      </p>

      <h2>6. Seguridad</h2>
      <p>
        Tu contraseña se almacena cifrada, nunca en texto plano. El acceso a tu cuenta está protegido con límites de intentos frente a accesos indebidos.
      </p>

      <h2>7. Cambios en esta política</h2>
      <p>
        Los cambios sustanciales se notificarán a los usuarios registrados y llevarán fecha de versión visible.
      </p>
    </>
  );
}
