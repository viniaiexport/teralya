# Diccionario de Datos — Teralya (INF-06)

**Versión 1.1 · Estado: EN REVISIÓN · Basado en `teralya_schema_v1.2_EN_REVISION.sql` · Julio 2026**

Evolución mínima de INF-06 v1.0 para documentar la entidad funcional Incidencia aprobada en CAP-01. No incorpora tickets, chat, CRM ni soporte avanzado.

## Control de versiones

| Versión | Fecha | Autor | Estado | Cambios |
|---|---|---|---|---|
| 1.0 | Julio 2026 | Claude | APROBADO | Diccionario correspondiente a INF-05 v1.1. |
| 1.1 | 11/07/2026 | Arquitecto de Datos Teralya | EN REVISIÓN | Incorpora exclusivamente Incidencia y actualiza la trazabilidad a INF-05 v1.2. |

## Trazabilidad

- Fuente funcional: `docs/CAP/CAP-01-Entidades-del-Sistema.pdf`, versión 1.0, estado APROBADO, sección **Incidencia** y matriz de relaciones.
- Fuente técnica: `teralya_schema_v1.2_EN_REVISION.sql`, versión 1.2, estado EN REVISIÓN.
- Documento base: INF-06 v1.0.

## Índice

1. BODEGA · 2. USUARIO · 3. COMPRADOR · 4. CUENTA_STRIPE_CONNECT · 5. VINO · 6. IMAGEN · 7. DIRECCION · 8. CARRITO · 9. CARRITO_ITEM · 10. PEDIDO · 11. PAGO · 12. SUBPEDIDO · 13. PEDIDO_ITEM · 14. INCIDENCIA · 15. NOTIFICACION · 16. AUDITORIA

---

## 1. BODEGA

**Objetivo.** Empresa productora de vino que vende en el marketplace; propietaria del catálogo, responsable de stock y preparación.

**Relaciones principales.** 1:N con usuario (personal de la bodega) · 1:N con vino · 1:1 con cuenta_stripe_connect · 1:N con subpedido.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `nombre_comercial` | text | Sí | — | Nombre con el que la bodega se muestra públicamente. |
| `razon_social` | text | No | — | Nombre legal/fiscal de la empresa. |
| `cif_vat` | text | No | — | Identificador fiscal (CIF/VAT) de la bodega. |
| `estado` | estado_bodega | Sí | 'borrador' | Estado del ciclo de vida de la bodega en la plataforma. |
| `logo_url` | text | No | — | URL del logotipo de la bodega. |
| `imagen_principal_url` | text | No | — | URL de la imagen de cabecera del perfil público. |
| `historia` | text | No | — | Texto libre con la historia de la bodega. |
| `filosofia` | text | No | — | Texto libre con la filosofía de producción. |
| `region` | text | No | — | Región vitivinícola de la bodega. |
| `pais` | text | No | — | País donde se ubica la bodega. |
| `denominacion_origen` | text | No | — | Denominación de Origen asociada a la bodega. |
| `anio_fundacion` | integer | No | — | Año de fundación de la bodega. |
| `web` | text | No | — | URL del sitio web oficial de la bodega. |
| `video_url` | text | No | — | URL de un vídeo de presentación (opcional). |
| `email_principal` | text | No | — | Email de contacto principal de la bodega. |
| `telefono` | text | No | — | Teléfono de contacto de la bodega. |
| `persona_contacto` | text | No | — | Nombre de la persona de contacto comercial. |
| `direccion_fisica` | text | No | — | Dirección física de la bodega. |
| `codigo_postal` | text | No | — | Código postal de la bodega. |
| `ciudad` | text | No | — | Ciudad de la bodega. |
| `provincia` | text | No | — | Provincia o región administrativa. |
| `pais_contacto` | text | No | — | País de contacto (puede diferir del país productor). |
| `comision` | numeric | No | — | Porcentaje de comisión de Teralya aplicado a esta bodega. |
| `tipo` | tipo_bodega | No | 'estandar' | Indica si la bodega es fundadora o estándar. |
| `condiciones_preferentes` | text | No | — | Texto libre con condiciones comerciales especiales. |
| `fecha_alta` | timestamptz | No | — | Fecha en que la bodega se dio de alta en la plataforma. |
| `fecha_aprobacion` | timestamptz | No | — | Fecha en que la bodega fue aprobada por un administrador. |
| `idioma_principal` | text | No | — | Idioma principal de comunicación con la bodega. |
| `plazo_preparacion_dias` | integer | No | — | Plazo habitual, en días, para preparar un pedido. |
| `paises_envio` | text[] | No | — | Lista de países a los que la bodega puede enviar. |
| `transportista_habitual` | text | No | — | Transportista que la bodega usa por defecto. |
| `observaciones_logisticas` | text | No | — | Notas internas sobre logística de la bodega. |
| `capacidad_internacional` | boolean | No | false | Indica si la bodega puede gestionar envíos internacionales. |
| `verificacion_estado` | text | No | — | Estado textual del proceso de verificación documental. |
| `documentacion_recibida` | text | No | — | Listado/resumen de documentación ya recibida. |
| `documentacion_pendiente` | text | No | — | Listado/resumen de documentación pendiente de recibir. |
| `aprobada_por` | uuid | No | — | Administrador que aprobó la bodega. |
| `fecha_verificacion` | timestamptz | No | — | Fecha en la que se completó la verificación. |
| `slug` | text | No | — | Identificador legible para URLs públicas de la bodega. |
| `meta_titulo` | text | No | — | Título SEO de la página pública de la bodega. |
| `meta_descripcion` | text | No | — | Descripción SEO de la página pública de la bodega. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |
| `updated_by` | uuid | No | — | Usuario administrador que hizo la última modificación. |

**Clave primaria.** `id`

**Claves foráneas.**
- `aprobada_por` → `usuario.id`
- `updated_by` → `usuario.id`

**Restricciones de unicidad.**
- `bodega_slug_key`: (slug) única

**Reglas de negocio asociadas.** Debe estar aprobada antes de publicar vinos; no puede eliminarse si tiene vinos publicados o pedidos asociados; la comisión debe quedar registrada antes de la activación

---

## 2. USUARIO

**Objetivo.** Identidad única de cualquier persona con acceso a la plataforma — comprador, personal de bodega o administrador.

**Relaciones principales.** N:1 opcional con bodega (solo si rol='bodega') · 1:1 opcional con comprador (vía tabla comprador).

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `email` | text | Sí | — | Correo electrónico, usado como identificador de acceso. |
| `password_hash` | text | Sí | — | Hash de la contraseña; nunca se guarda en texto plano. |
| `nombre` | text | No | — | Nombre de pila del usuario. |
| `apellidos` | text | No | — | Apellidos del usuario. |
| `telefono` | text | No | — | Teléfono de contacto del usuario. |
| `idioma` | text | No | 'es' | Idioma preferido de la interfaz. |
| `zona_horaria` | text | No | 'Europe/Madrid' | Zona horaria del usuario. |
| `rol` | rol_usuario | Sí | — | Rol de acceso: comprador, bodega o administrador. |
| `bodega_id` | uuid | No | — | Bodega a la que pertenece este usuario (solo si rol='bodega'). |
| `estado` | estado_usuario | Sí | 'pendiente_verificacion' | Estado de la cuenta del usuario. |
| `email_verificado` | boolean | Sí | false | Indica si el email ha sido verificado. |
| `fecha_ultimo_acceso` | timestamptz | No | — | Fecha del último inicio de sesión. |
| `fecha_ultimo_cambio_password` | timestamptz | No | — | Fecha del último cambio de contraseña. |
| `intentos_fallidos` | integer | Sí | 0 | Contador de intentos de inicio de sesión fallidos. |
| `cuenta_bloqueada` | boolean | Sí | false | Indica si la cuenta está bloqueada por seguridad. |
| `token_recuperacion` | text | No | — | Token temporal para recuperación de contraseña. |
| `token_recuperacion_caducidad` | timestamptz | No | — | Fecha de caducidad del token de recuperación. |
| `doble_factor_activo` | boolean | Sí | false | Indica si el usuario tiene 2FA activo (funcionalidad futura). |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |

**Clave primaria.** `id`

**Claves foráneas.**
- `bodega_id` → `bodega.id`

**Restricciones de unicidad.**
- `usuario_email_key`: (email) única

**Restricciones (CHECK).**
- `chk_bodega_solo_si_rol_bodega`: `(((bodega_id IS NULL) OR (rol = 'bodega'::rol_usuario)))`

**Índices.**
- `idx_usuario_bodega_id`: (bodega_id)
- `idx_usuario_rol`: (rol)

**Reglas de negocio asociadas.** El email debe ser único; la contraseña nunca se almacena en texto plano; bodega_id solo puede rellenarse si rol = 'bodega' (constraint chk_bodega_solo_si_rol_bodega)

---

## 3. COMPRADOR

**Objetivo.** Datos comerciales del cliente que compra vino; amplía a usuario con lo necesario para comprar y gestionar su historial.

**Relaciones principales.** 1:1 con usuario · 1:N con carrito, pedido y direccion.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `usuario_id` | uuid | Sí | — | Usuario del que este comprador es una extensión 1:1. |
| `fecha_nacimiento` | date | No | — | Fecha de nacimiento (opcional en el MVP). |
| `acepta_comunicaciones` | boolean | Sí | false | Indica si acepta recibir comunicaciones comerciales. |
| `moneda_preferida` | text | No | 'EUR' | Moneda preferida para mostrar precios. |
| `pais_compra_habitual` | text | No | — | País desde el que compra habitualmente. |
| `num_total_pedidos` | integer | Sí | 0 | Contador denormalizado de pedidos realizados. |
| `importe_total_comprado` | numeric | Sí | 0 | Suma denormalizada del importe total comprado. |
| `fecha_primer_pedido` | timestamptz | No | — | Fecha del primer pedido realizado. |
| `fecha_ultimo_pedido` | timestamptz | No | — | Fecha del último pedido realizado. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |

**Clave primaria.** `usuario_id`

**Claves foráneas.**
- `usuario_id` → `usuario.id`

**Reglas de negocio asociadas.** Todo comprador requiere un usuario previo; los contadores (num_total_pedidos, importe_total_comprado) son denormalizados y se recalculan por trigger/job — no son la fuente de verdad, esa es la tabla pedido

---

## 4. CUENTA_STRIPE_CONNECT

**Objetivo.** Vincula una bodega con Stripe Connect para poder recibir pagos de forma segura y automática.

**Relaciones principales.** 1:1 con bodega · referenciada indirectamente por pago a través de subpedido → bodega → cuenta_stripe_connect (no hay FK directa desde pago; ver nota en la tabla pago).

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `bodega_id` | uuid | Sí | — | Bodega propietaria de esta cuenta de cobro. |
| `stripe_account_id` | text | Sí | — | Identificador de la cuenta conectada en Stripe. |
| `estado_cuenta` | estado_cuenta_stripe | Sí | 'no_iniciada' | Estado de onboarding/verificación de la cuenta en Stripe. |
| `cuenta_verificada` | boolean | Sí | false | Indica si Stripe ha verificado la identidad de la bodega. |
| `cargos_habilitados` | boolean | Sí | false | Indica si la cuenta puede recibir cargos (charges_enabled de Stripe). |
| `cobros_habilitados` | boolean | Sí | false | Indica si la cuenta puede recibir transferencias (payouts_enabled de Stripe). |
| `pais` | text | No | — | País de registro de la cuenta Stripe. |
| `moneda` | text | No | 'EUR' | Moneda de liquidación de la cuenta. |
| `tipo_cuenta` | text | No | — | Tipo de cuenta Stripe Connect (p. ej. 'express'). |
| `fecha_vinculacion` | timestamptz | No | — | Fecha en la que se vinculó la cuenta a la bodega. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |
| `ultima_sincronizacion` | timestamptz | No | — | Última vez que se sincronizó el estado con Stripe. |

**Clave primaria.** `id`

**Claves foráneas.**
- `bodega_id` → `bodega.id`

**Restricciones de unicidad.**
- `cuenta_stripe_connect_bodega_id_key`: (bodega_id) única
- `cuenta_stripe_connect_stripe_account_id_key`: (stripe_account_id) única

**Reglas de negocio asociadas.** Una bodega no puede vender sin cuenta activa; no se almacenan datos bancarios sensibles en el marketplace; el estado se sincroniza desde la información oficial de Stripe

---

## 5. VINO

**Objetivo.** Producto comercializado por una única bodega; contiene toda la información necesaria para mostrarlo, venderlo y gestionarlo dentro del marketplace.

**Relaciones principales.** N:1 con bodega · 1:N con imagen (vía polimórfica) · 1:N con carrito_item y pedido_item.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `bodega_id` | uuid | Sí | — | Bodega propietaria de este vino. |
| `sku` | text | No | — | Referencia interna de inventario de la bodega. |
| `estado` | estado_vino | Sí | 'borrador' | Estado de publicación del vino en el catálogo. |
| `nombre_comercial` | text | Sí | — | Nombre comercial del vino. |
| `tipo_vino` | text | No | — | Tipo de vino (tinto, blanco, rosado, espumoso, etc.). |
| `anada` | integer | No | — | Año de cosecha del vino. |
| `precio` | numeric | No | — | Precio de venta al público. |
| `moneda` | text | No | 'EUR' | Moneda en la que se expresa el precio. |
| `pais` | text | No | — | País de origen del vino. |
| `region` | text | No | — | Región vitivinícola de origen. |
| `denominacion_origen` | text | No | — | Denominación de Origen del vino. |
| `subzona` | text | No | — | Subzona dentro de la DO (opcional). |
| `variedades_uva` | text[] | No | — | Variedades de uva empleadas. |
| `crianza` | text | No | — | Tipo de crianza (roble, acero, etc.). |
| `meses_crianza` | integer | No | — | Meses de crianza del vino. |
| `graduacion_alcoholica` | numeric | No | — | Graduación alcohólica en grados. |
| `volumen_ml` | integer | No | — | Volumen de la botella en mililitros. |
| `descripcion_corta` | text | No | — | Descripción breve para listados. |
| `descripcion_completa` | text | No | — | Descripción completa para la ficha de producto. |
| `nota_cata` | text | No | — | Nota de cata del vino. |
| `maridaje` | text | No | — | Sugerencias de maridaje. |
| `temperatura_servicio` | text | No | — | Temperatura de servicio recomendada. |
| `certificaciones` | text[] | No | — | Certificaciones del vino (ecológico, biodinámico, etc.). |
| `premios` | text[] | No | — | Premios y reconocimientos obtenidos. |
| `produccion_limitada` | boolean | No | false | Indica si es una producción limitada. |
| `stock_disponible` | integer | Sí | 0 | Unidades disponibles para venta inmediata. |
| `stock_reservado` | integer | Sí | 0 | Unidades reservadas en carritos/pedidos en curso. |
| `stock_minimo` | integer | Sí | 0 | Umbral mínimo de stock antes de alertar reposición. |
| `disponible_venta` | boolean | Sí | false | Indica si el vino puede comprarse actualmente. |
| `peso_gramos` | integer | No | — | Peso de la botella en gramos, para cálculo de envío. |
| `dimensiones` | text | No | — | Dimensiones de la botella/caja (opcional MVP). |
| `plazo_preparacion_dias` | integer | No | — | Plazo de preparación específico de este vino, si difiere del de la bodega. |
| `botellas_por_caja` | integer | No | — | Formato de caja disponible (3/6/12 botellas). |
| `slug` | text | No | — | Identificador legible para la URL pública del vino. |
| `meta_titulo` | text | No | — | Título SEO de la ficha de producto. |
| `meta_descripcion` | text | No | — | Descripción SEO de la ficha de producto. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |
| `fecha_publicacion` | timestamptz | No | — | Fecha en la que el vino pasó a estado publicado. |

**Clave primaria.** `id`

**Claves foráneas.**
- `bodega_id` → `bodega.id`

**Restricciones de unicidad.**
- `vino_slug_key`: (slug) única

**Restricciones (CHECK).**
- `chk_stock_no_negativo`: `((stock_disponible >= 0))`

**Índices.**
- `idx_vino_bodega_id`: (bodega_id)
- `idx_vino_estado`: (estado)

**Reglas de negocio asociadas.** No puede publicarse sin precio, sin stock o sin al menos una imagen; el stock nunca puede ser negativo (constraint chk_stock_no_negativo); no puede eliminarse si forma parte de un pedido

---

## 6. IMAGEN

**Objetivo.** Gestiona los recursos gráficos del marketplace, asociados principalmente a vinos y bodegas.

**Relaciones principales.** Polimórfica hacia vino o bodega vía (tipo_entidad, entidad_id); no lleva FK física a cada tabla para evitar duplicar el modelo por cada entidad ilustrable.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `tipo_entidad` | tipo_entidad_imagen | Sí | — | Tipo de entidad a la que pertenece la imagen: vino o bodega. |
| `entidad_id` | uuid | Sí | — | ID de la entidad (vino o bodega) a la que pertenece la imagen. |
| `nombre_archivo` | text | No | — | Nombre original del archivo subido. |
| `url` | text | Sí | — | URL pública de la imagen. |
| `formato` | text | No | — | Formato del archivo (JPG, PNG, WebP...). |
| `tamanio_bytes` | integer | No | — | Tamaño del archivo en bytes. |
| `resolucion` | text | No | — | Resolución de la imagen (ej. '1200x1200'). |
| `es_principal` | boolean | Sí | false | Indica si es la imagen principal de la entidad. |
| `orden` | integer | Sí | 0 | Posición de la imagen dentro de la galería. |
| `alt_text` | text | Sí | — | Texto alternativo obligatorio para accesibilidad y SEO. |
| `activa` | boolean | Sí | true | Indica si la imagen está visible públicamente. |
| `fecha_subida` | timestamptz | Sí | now() | Fecha en la que se subió la imagen. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |
| `subido_por` | uuid | No | — | Usuario que subió la imagen. |

**Clave primaria.** `id`

**Claves foráneas.**
- `subido_por` → `usuario.id`

**Índices.**
- `idx_imagen_entidad`: (tipo_entidad, entidad_id)
- `uq_imagen_principal`: (tipo_entidad, entidad_id) WHERE es_principal

**Reglas de negocio asociadas.** Solo puede existir una imagen principal por entidad (constraint uq_imagen_principal); el texto ALT es obligatorio para SEO; un vino requiere al menos una imagen antes de publicarse (regla aplicada a nivel de aplicación, no de BD)

---

## 7. DIRECCION

**Objetivo.** Direcciones de envío y facturación reutilizables de compradores y bodegas.

**Relaciones principales.** Polimórfica hacia comprador o bodega vía (propietario_tipo, propietario_id) · referenciada desde pedido, que además guarda una copia congelada (ver tabla pedido).

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `propietario_tipo` | tipo_propietario_dir | Sí | — | Tipo de propietario de la dirección: comprador o bodega. |
| `propietario_id` | uuid | Sí | — | ID del propietario (comprador o bodega). |
| `nombre_identificativo` | text | No | — | Etiqueta para identificar la dirección (Casa, Oficina...). |
| `destinatario` | text | Sí | — | Nombre del destinatario del envío. |
| `empresa` | text | No | — | Nombre de empresa, si aplica. |
| `direccion` | text | Sí | — | Calle y número. |
| `direccion_adicional` | text | No | — | Piso, puerta u otros datos adicionales. |
| `codigo_postal` | text | Sí | — | Código postal. |
| `ciudad` | text | Sí | — | Ciudad. |
| `provincia` | text | No | — | Provincia o región. |
| `pais` | text | Sí | — | País. |
| `persona_contacto` | text | No | — | Persona de contacto en esta dirección. |
| `telefono` | text | No | — | Teléfono de contacto en esta dirección. |
| `email` | text | No | — | Email de contacto en esta dirección (opcional). |
| `es_envio` | boolean | Sí | true | Indica si es una dirección utilizable para envío. |
| `es_facturacion` | boolean | Sí | false | Indica si es una dirección utilizable para facturación. |
| `es_principal` | boolean | Sí | false | Indica si es la dirección principal del propietario. |
| `activa` | boolean | Sí | true | Indica si la dirección sigue en uso. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |

**Clave primaria.** `id`

**Índices.**
- `idx_direccion_propietario`: (propietario_tipo, propietario_id)
- `uq_direccion_principal`: (propietario_tipo, propietario_id) WHERE es_principal

**Reglas de negocio asociadas.** Solo puede existir una dirección principal por propietario (constraint uq_direccion_principal); una dirección inactiva no puede seleccionarse en nuevas compras

---

## 8. CARRITO

**Objetivo.** Selección temporal de vinos de un comprador antes de confirmar el pedido; puede incluir vinos de varias bodegas.

**Relaciones principales.** N:1 con comprador · 1:N con carrito_item · da lugar a 1 pedido cuando se confirma la compra.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `comprador_id` | uuid | Sí | — | Comprador propietario del carrito. |
| `estado` | estado_carrito | Sí | 'activo' | Estado del carrito. |
| `num_productos` | integer | Sí | 0 | Número de líneas de producto distintas en el carrito. |
| `num_botellas` | integer | Sí | 0 | Número total de botellas en el carrito. |
| `subtotal` | numeric | Sí | 0 | Suma de los importes de las líneas, antes de envío/descuentos. |
| `gastos_envio` | numeric | Sí | 0 | Gastos de envío calculados para el carrito. |
| `descuentos` | numeric | Sí | 0 | Descuentos aplicados (funcionalidad futura). |
| `total` | numeric | Sí | 0 | Importe total del carrito. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |
| `fecha_conversion` | timestamptz | No | — | Fecha en la que el carrito se convirtió en pedido. |

**Clave primaria.** `id`

**Claves foráneas.**
- `comprador_id` → `comprador.usuario_id`

**Índices.**
- `uq_carrito_activo_por_comprador`: (comprador_id) WHERE (estado = 'activo'::estado_carrito)

**Reglas de negocio asociadas.** Un comprador solo puede tener un carrito activo a la vez (constraint uq_carrito_activo_por_comprador); un carrito convertido en pedido deja de poder modificarse

---

## 9. CARRITO_ITEM

**Objetivo.** Línea de producto dentro de un carrito de compra.

**Relaciones principales.** N:1 con carrito · N:1 con vino.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `carrito_id` | uuid | Sí | — | Carrito al que pertenece esta línea. |
| `vino_id` | uuid | Sí | — | Vino incluido en esta línea. |
| `cantidad` | integer | Sí | 1 | Número de botellas de este vino en el carrito. |
| `precio_unitario` | numeric | Sí | — | Precio unitario del vino en el momento de añadirlo. |
| `importe_total` | numeric | Sí | — | Importe total de la línea (cantidad × precio unitario). |
| `estado` | estado_carrito_item | Sí | 'disponible' | Estado de disponibilidad de la línea en el momento de consultarla. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |

**Clave primaria.** `id`

**Claves foráneas.**
- `carrito_id` → `carrito.id`
- `vino_id` → `vino.id`

**Restricciones de unicidad.**
- `uq_carrito_vino`: (carrito_id, vino_id) única

**Restricciones (CHECK).**
- `chk_cantidad_minima`: `((cantidad >= 1))`

**Reglas de negocio asociadas.** Un vino solo puede aparecer una vez por carrito (constraint uq_carrito_vino; si se repite, se incrementa cantidad a nivel de aplicación); la cantidad nunca es inferior a una botella (constraint chk_cantidad_minima); el precio se revalida en el checkout, no se da por bueno el guardado en esta tabla

---

## 10. PEDIDO

**Objetivo.** Compra confirmada de un comprador; agrupa todos los productos adquiridos, sea cual sea la bodega vendedora.

**Relaciones principales.** N:1 con comprador · 1:1 con pago · 1:N con subpedido (uno por bodega implicada) · 1:N con pedido_item.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `numero_pedido` | text | Sí | — | Número de pedido visible para el comprador, único. |
| `comprador_id` | uuid | Sí | — | Comprador que realizó el pedido. |
| `subtotal` | numeric | Sí | — | Suma de los importes de todos los pedido_item. |
| `gastos_envio` | numeric | Sí | 0 | Gastos de envío totales del pedido. |
| `impuestos` | numeric | Sí | 0 | Impuestos aplicados al pedido. |
| `descuentos` | numeric | Sí | 0 | Descuentos aplicados al pedido. |
| `total` | numeric | Sí | — | Importe total del pedido. |
| `estado_pago` | text | No | — | Estado de pago en texto libre, redundante informativo (ver tabla pago para el estado autoritativo). |
| `metodo_pago` | text | No | — | Método de pago utilizado. |
| `fecha_pago` | timestamptz | No | — | Fecha en la que se registró el pago. |
| `direccion_envio_id` | uuid | No | — | Referencia a la dirección de envío original usada. |
| `direccion_envio_snapshot` | jsonb | Sí | — | Copia congelada (JSON) de la dirección de envío en el momento de la compra. |
| `direccion_facturacion_id` | uuid | No | — | Referencia a la dirección de facturación original usada. |
| `direccion_facturacion_snapshot` | jsonb | Sí | — | Copia congelada (JSON) de la dirección de facturación en el momento de la compra. |
| `estado` | estado_pedido | Sí | 'pendiente_pago' | Estado global del pedido (fuente de verdad a nivel de pedido completo). |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `fecha_cierre` | timestamptz | No | — | Fecha en la que el pedido quedó cerrado (entregado o cancelado). |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |

**Clave primaria.** `id`

**Claves foráneas.**
- `comprador_id` → `comprador.usuario_id`
- `direccion_envio_id` → `direccion.id`
- `direccion_facturacion_id` → `direccion.id`

**Restricciones de unicidad.**
- `pedido_numero_pedido_key`: (numero_pedido) única

**Índices.**
- `idx_pedido_comprador_id`: (comprador_id)
- `idx_pedido_estado`: (estado)

**Reglas de negocio asociadas.** Numero_pedido debe ser único; un pedido pagado no puede modificarse; las direcciones de envío/facturación quedan congeladas al confirmar (por eso se guarda también el snapshot en JSONB, además de la FK de referencia a direccion)

---

## 11. PAGO

**Objetivo.** Registra la información económica de una compra, desde la autorización del cobro único hasta el reparto entre bodegas y la comisión del marketplace.

**Relaciones principales.** 1:1 con pedido · 1:N con subpedido (cada subpedido representa la porción del pago que corresponde a una bodega).

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `pedido_id` | uuid | Sí | — | Pedido al que corresponde este pago (relación 1:1). |
| `referencia_stripe` | text | No | — | Identificador del cargo/PaymentIntent en Stripe. |
| `referencia_interna` | text | No | — | Referencia interna de Teralya para el pago. |
| `subtotal` | numeric | Sí | — | Subtotal cobrado, sin envío ni impuestos. |
| `gastos_envio` | numeric | Sí | 0 | Gastos de envío incluidos en el cobro. |
| `impuestos` | numeric | Sí | 0 | Impuestos incluidos en el cobro. |
| `comision_marketplace` | numeric | Sí | 0 | Comisión total de Teralya sobre este pago. |
| `total_cobrado` | numeric | Sí | — | Importe total cobrado al comprador. |
| `total_repartido` | numeric | Sí | 0 | Importe ya repartido entre las bodegas vía sus subpedidos. |
| `total_reembolsado` | numeric | Sí | 0 | Importe ya reembolsado al comprador. |
| `metodo_pago` | text | No | — | Método de pago utilizado (tarjeta, etc.). |
| `moneda` | text | No | 'EUR' | Moneda del cobro. |
| `estado` | estado_pago | Sí | 'pendiente' | Estado autoritativo del pago. |
| `fecha_autorizacion` | timestamptz | No | — | Fecha de autorización del cargo. |
| `fecha_captura` | timestamptz | No | — | Fecha de captura efectiva del cargo. |
| `fecha_liquidacion` | timestamptz | No | — | Fecha de liquidación/settlement. |
| `fecha_reembolso` | timestamptz | No | — | Fecha del último reembolso registrado, si lo hay. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |

**Clave primaria.** `id`

**Claves foráneas.**
- `pedido_id` → `pedido.id`

**Restricciones de unicidad.**
- `pago_pedido_id_key`: (pedido_id) única
- `pago_referencia_stripe_key`: (referencia_stripe) única

**Restricciones (CHECK).**
- `chk_reparto_no_supera_cobrado`: `((total_repartido <= total_cobrado))`

**Reglas de negocio asociadas.** Un pedido solo puede tener un pago activo; el importe total debe coincidir con el pedido; total_repartido nunca puede superar total_cobrado (constraint chk_reparto_no_supera_cobrado). Nota (Contradicción 2, corregida): NO existe FK directa a cuenta_stripe_connect — un pago puede repartirse entre varias cuentas Stripe, una por bodega. El reparto real se resuelve vía subpedido → bodega → cuenta_stripe_connect.

---

## 12. SUBPEDIDO

**Objetivo.** Parte de un pedido correspondiente a una única bodega; permite que cada bodega gestione de forma independiente su preparación, envío e incidencias.

**Relaciones principales.** N:1 con pedido · N:1 con bodega · N:1 con pago · 1:N con pedido_item.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `pedido_id` | uuid | Sí | — | Pedido al que pertenece este subpedido. |
| `bodega_id` | uuid | Sí | — | Bodega responsable de este subpedido. |
| `pago_id` | uuid | Sí | — | Pago del que este subpedido representa una porción. |
| `subtotal` | numeric | Sí | — | Subtotal correspondiente a los productos de esta bodega. |
| `gastos_envio` | numeric | Sí | 0 | Gastos de envío correspondientes a esta bodega. |
| `impuestos` | numeric | Sí | 0 | Impuestos correspondientes a esta bodega. |
| `comision_marketplace` | numeric | Sí | 0 | Comisión de Teralya sobre este subpedido. |
| `total` | numeric | Sí | — | Importe total que corresponde a esta bodega. |
| `transportista` | text | No | — | Transportista utilizado para este envío. |
| `numero_seguimiento` | text | No | — | Número de seguimiento del envío. |
| `fecha_preparacion` | timestamptz | No | — | Fecha en la que la bodega marcó el pedido como preparado. |
| `fecha_envio` | timestamptz | No | — | Fecha de envío del paquete. |
| `fecha_entrega_prevista` | timestamptz | No | — | Fecha estimada de entrega. |
| `fecha_entrega_real` | timestamptz | No | — | Fecha real de entrega confirmada. |
| `estado` | estado_subpedido | Sí | 'pendiente' | Estado logístico — ÚNICA fuente de verdad del flujo de envío (ver Decisión CTO). |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |
| `fecha_ultimo_cambio_estado` | timestamptz | Sí | now() | Fecha del último cambio de estado logístico. |

**Clave primaria.** `id`

**Claves foráneas.**
- `bodega_id` → `bodega.id`
- `pago_id` → `pago.id`
- `pedido_id` → `pedido.id`

**Índices.**
- `idx_subpedido_bodega_id`: (bodega_id)
- `idx_subpedido_pago_id`: (pago_id)
- `idx_subpedido_pedido_id`: (pedido_id)

**Reglas de negocio asociadas.** Pertenece a una única bodega y un único pedido; el estado del pedido depende del estado conjunto de sus subpedidos; un subpedido entregado no puede volver a preparación. Decisión CTO: subpedido.estado es la ÚNICA fuente de verdad del flujo logístico completo (pendiente → aceptado → en_preparacion → enviado → entregado / cancelado / incidencia). pedido_item ya no duplica estos estados (ver tabla pedido_item).

---

## 13. PEDIDO_ITEM

**Objetivo.** Línea de producto dentro de un pedido; conserva una copia congelada (snapshot) del vino en el momento de la compra.

**Relaciones principales.** N:1 pedido · N:1 subpedido · N:1 vino.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `pedido_id` | uuid | Sí | — | Pedido al que pertenece esta línea. |
| `subpedido_id` | uuid | Sí | — | Subpedido (bodega) al que pertenece esta línea. |
| `vino_id` | uuid | Sí | — | Vino comprado en esta línea. |
| `nombre_vino_snapshot` | text | Sí | — | Nombre del vino congelado en el momento de la compra. |
| `anada_snapshot` | integer | No | — | Añada del vino congelada en el momento de la compra. |
| `bodega_snapshot` | text | Sí | — | Nombre de la bodega congelado en el momento de la compra. |
| `precio_unitario` | numeric | Sí | — | Precio unitario pagado, congelado, no cambia después. |
| `cantidad` | integer | Sí | — | Número de botellas de esta línea. |
| `importe_total` | numeric | Sí | — | Importe total de la línea (cantidad × precio unitario). |
| `estado` | estado_pedido_item | Sí | 'normal' | Excepción de línea únicamente: normal, cancelado o devuelto. El flujo logístico vive en subpedido.estado (Decisión CTO). |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |

**Clave primaria.** `id`

**Claves foráneas.**
- `pedido_id` → `pedido.id`
- `subpedido_id` → `subpedido.id`
- `vino_id` → `vino.id`

**Restricciones (CHECK).**
- `chk_cantidad_positiva`: `((cantidad > 0))`

**Índices.**
- `idx_pedido_item_pedido_id`: (pedido_id)
- `idx_pedido_item_subpedido_id`: (subpedido_id)

**Reglas de negocio asociadas.** El precio y los datos del vino quedan congelados tras confirmar el pedido y nunca cambian después; la cantidad debe ser mayor que cero; un pedido_item nunca cambia de bodega. Decisión CTO (cierre de Contradicción 4): pedido_item NO lleva estado logístico. Los estados pendiente/preparación/enviado/entregado son EXCLUSIVOS de subpedido, que es la única fuente de verdad del flujo logístico. pedido_item solo distingue normal / cancelado / devuelto, como excepción de línea dentro de un subpedido que sigue su curso.

---

## 14. INCIDENCIA

**Objetivo.** Registrar un problema operativo básico relacionado con un pedido, subpedido, bodega o vino para su revisión y gestión por administración.

**Alcance.** Registro, clasificación, estado, descripción, asociación funcional y trazabilidad mínima. No constituye un sistema de tickets, chat, CRM ni soporte avanzado.

**Relaciones principales.** N:1 opcional con pedido · N:1 opcional con subpedido · N:1 opcional con bodega · N:1 opcional con vino · relación polimórfica con auditoria mediante (`tipo_entidad`, `entidad_id`).

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la incidencia. |
| `tipo` | text | Sí | — | Clasificación funcional del problema operativo. |
| `estado` | text | Sí | — | Estado propio de gestión de la incidencia. |
| `fecha` | timestamptz | Sí | now() | Fecha y hora funcional de la incidencia. |
| `descripcion` | text | Sí | — | Información mínima necesaria para comprender y gestionar el problema. |
| `pedido_id` | uuid | No | — | Pedido relacionado, cuando aplique. |
| `subpedido_id` | uuid | No | — | Subpedido relacionado, cuando aplique. |
| `bodega_id` | uuid | No | — | Bodega relacionada, cuando aplique. |
| `vino_id` | uuid | No | — | Vino relacionado, cuando aplique. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización. |

**Clave primaria.** `id`

**Claves foráneas.**
- `pedido_id` → `pedido.id`
- `subpedido_id` → `subpedido.id`
- `bodega_id` → `bodega.id`
- `vino_id` → `vino.id`

**Restricciones (CHECK).**
- `chk_incidencia_relacion`: exige al menos una relación no nula entre pedido, subpedido, bodega o vino.

**Índices.**
- `idx_incidencia_estado`: (`estado`)
- `idx_incidencia_fecha`: (`fecha`)
- `idx_incidencia_pedido_id`: (`pedido_id`) para valores no nulos
- `idx_incidencia_subpedido_id`: (`subpedido_id`) para valores no nulos
- `idx_incidencia_bodega_id`: (`bodega_id`) para valores no nulos
- `idx_incidencia_vino_id`: (`vino_id`) para valores no nulos

**Historial mínimo y auditoría.** Cada creación, modificación o cambio de estado debe generar una entrada en `auditoria` con `tipo_entidad = 'incidencia'`, `entidad_id = incidencia.id`, acción, valores anterior/nuevo, fecha, usuario y resultado. Se reutiliza la auditoría transversal existente; no se crea un subsistema de soporte.

**Reglas de negocio asociadas.** Solo administración gestiona incidencias; debe existir al menos una entidad relacionada; la descripción aporta la información mínima de gestión; el cierre y las transiciones de estado se validan en la capa de aplicación conforme a CAP-01.

---

## 15. NOTIFICACION

**Objetivo.** Registra todas las comunicaciones automáticas enviadas a compradores, bodegas y administradores.

**Relaciones principales.** N:1 con usuario · N:1 opcional con pedido · N:1 opcional con subpedido.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `usuario_id` | uuid | Sí | — | Usuario destinatario de la notificación. |
| `tipo_notificacion` | text | Sí | — | Tipo/categoría de la notificación. |
| `asunto` | text | No | — | Asunto del mensaje enviado. |
| `plantilla` | text | No | — | Plantilla utilizada para generar el contenido. |
| `contenido` | text | No | — | Contenido final generado y enviado. |
| `canal` | canal_notificacion | Sí | 'email' | Canal de envío (email en el MVP). |
| `estado` | estado_notificacion | Sí | 'pendiente' | Estado de entrega de la notificación. |
| `fecha_envio` | timestamptz | No | — | Fecha de envío. |
| `fecha_entrega` | timestamptz | No | — | Fecha de entrega confirmada. |
| `fecha_lectura` | timestamptz | No | — | Fecha de lectura (funcionalidad futura). |
| `pedido_id` | uuid | No | — | Pedido relacionado, si aplica. |
| `subpedido_id` | uuid | No | — | Subpedido relacionado, si aplica. |
| `evento_origen` | text | No | — | Evento del sistema que disparó esta notificación. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |

**Clave primaria.** `id`

**Claves foráneas.**
- `pedido_id` → `pedido.id`
- `subpedido_id` → `subpedido.id`
- `usuario_id` → `usuario.id`

**Índices.**
- `idx_notificacion_usuario_id`: (usuario_id)

**Reglas de negocio asociadas.** Toda notificación pertenece a un usuario; nunca se eliminan físicamente; cada envío queda asociado al evento que lo originó (evento_origen)

---

## 16. AUDITORIA

**Objetivo.** Registra todos los eventos relevantes del marketplace para garantizar trazabilidad, seguridad y soporte ante incidencias.

**Relaciones principales.** Polimórfica hacia cualquier entidad del sistema vía (tipo_entidad, entidad_id) · N:1 opcional con usuario.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `usuario_id` | uuid | No | — | Usuario que realizó la acción, si corresponde. |
| `tipo_entidad` | text | Sí | — | Tipo de entidad afectada por el evento. |
| `entidad_id` | uuid | No | — | ID de la entidad afectada. |
| `accion` | text | Sí | — | Acción realizada (crear, modificar, eliminar, iniciar sesión...). |
| `valor_anterior` | jsonb | No | — | Valor anterior del dato modificado (JSON). |
| `valor_nuevo` | jsonb | No | — | Valor nuevo del dato modificado (JSON). |
| `descripcion` | text | No | — | Descripción legible del evento. |
| `ip_address` | inet | No | — | Dirección IP desde la que se originó la acción. |
| `user_agent` | text | No | — | Navegador/dispositivo desde el que se originó la acción. |
| `sistema` | text | No | — | Sistema o servicio que generó el evento. |
| `fecha_hora` | timestamptz | Sí | now() | Fecha y hora exacta del evento. |
| `resultado` | resultado_auditoria | Sí | 'correcto' | Resultado de la operación: correcto o error. |

**Clave primaria.** `id`

**Claves foráneas.**
- `usuario_id` → `usuario.id`

**Índices.**
- `idx_auditoria_entidad`: (tipo_entidad, entidad_id)
- `idx_auditoria_fecha`: (fecha_hora)
- `idx_auditoria_usuario_id`: (usuario_id)

**Reglas de negocio asociadas.** Ningún registro puede modificarse ni eliminarse; toda operación crítica, autenticación o cambio de estado genera una entrada de auditoría

---

*Borrador EN REVISIÓN. Parte de INF-06 v1.0 e incorpora exclusivamente la entidad Incidencia aprobada en CAP-01 y definida en INF-05 v1.2 EN REVISIÓN. Requiere validación técnica antes de aprobación.*
