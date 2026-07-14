# Diccionario de Datos — Teralya (INF-06)

**Versión 1.3 · Estado: EN REVISIÓN · Basado en `teralya_schema_v1.4_EN_REVISION.sql` · Julio 2026**

Actualización 1:1 sobre INF-05 v1.4 en revisión. Documenta 19 tablas, tipos exactos, claves, restricciones, índices, funciones y triggers sin ampliar el MVP.

## Control de versiones

| Versión | Fecha | Autor | Estado | Cambios |
|---|---|---|---|---|
| 1.0 | Julio 2026 | Claude | APROBADO | Diccionario correspondiente a INF-05 v1.1. |
| 1.1 | 11/07/2026 | Arquitecto de Datos Teralya | SUSTITUIDA | Alineación parcial con INF-05 v1.2. |
| 1.2 | 13/07/2026 | CTO Teralya | APROBADO | Reconstrucción completa sobre INF-05 v1.3; incorpora Decisiones 0014–0016. |
| 1.3 | 13/07/2026 | CTO + Arquitecto de Datos | EN REVISIÓN | Alineación 1:1 con INF-05 v1.4 y DLOG 0017; añade CARRITO_FUSION inmutable. |

## Trazabilidad

- Fuente funcional: `docs/CAP/CAP-01-Entidades-del-Sistema.pdf`, versión 1.0, estado APROBADO, sección **Incidencia** y matriz de relaciones.
- Fuente técnica normativa: `teralya_schema_v1.4_EN_REVISION.sql`, versión 1.4, estado EN REVISIÓN.
- Decisiones CEO de 11/07/2026: fecha de nacimiento obligatoria, registro de declaraciones/aceptaciones y entidad mínima de recuperación de contraseña.
- Decisión 0014: PAGO es la única fuente económica persistente.
- Decisión 0015: ciclo de Incidencia `abierta → en_revision → resuelta → cerrada`.
- Decisión 0016: idempotencia e integridad comercial mediante unicidad, ledger Stripe y claves compuestas.
- Decisión 0017: fusión por suma limitada al stock e idempotencia por `fusion_id`.
- Documento sustituido: INF-06 v1.2.

## Índice

1. BODEGA · 2. USUARIO · 3. COMPRADOR · 4. CUENTA_STRIPE_CONNECT · 5. VINO · 6. IMAGEN · 7. DIRECCION · 8. CARRITO · 9. CARRITO_ITEM · 10. CARRITO_FUSION · 11. PEDIDO · 12. PAGO · 13. EVENTO_WEBHOOK_STRIPE · 14. SUBPEDIDO · 15. PEDIDO_ITEM · 16. INCIDENCIA · 17. NOTIFICACION · 18. AUDITORIA · 19. SOLICITUD_RECUPERACION_PASSWORD

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
| `comision` | numeric(5,2) | No | — | Porcentaje de comisión de Teralya aplicado a esta bodega. |
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
| `doble_factor_activo` | boolean | Sí | false | Indica si el usuario tiene 2FA activo (funcionalidad futura). |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |

**Clave primaria.** `id`

**Claves foráneas.**
- `bodega_id` → `bodega.id`

**Restricciones de unicidad.**
- `usuario_email_key`: (email) única

**Restricciones (CHECK).**
- `chk_bodega_segun_rol`: `((rol = 'bodega' AND bodega_id IS NOT NULL) OR (rol IN ('comprador','administrador') AND bodega_id IS NULL))`

**Índices.**
- `idx_usuario_bodega_id`: (bodega_id)
- `idx_usuario_rol`: (rol)

**Reglas de negocio asociadas.** El email debe ser único; la contraseña nunca se almacena en texto plano; bodega_id es obligatorio para rol bodega y debe ser nulo para comprador o administrador (constraint chk_bodega_segun_rol)

---

## 3. COMPRADOR

**Objetivo.** Datos comerciales del cliente que compra vino; amplía a usuario con lo necesario para comprar y gestionar su historial.

**Relaciones principales.** 1:1 con usuario · 1:N con carrito, pedido y direccion.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `usuario_id` | uuid | Sí | — | Usuario del que este comprador es una extensión 1:1. |
| `fecha_nacimiento` | date | Sí | — | Fecha de nacimiento obligatoria, usada para comprobar la edad mínima aplicable. |
| `declaracion_mayoria_edad` | boolean | Sí | false | Confirmación expresa del comprador de que cumple la edad mínima aplicable. |
| `declaracion_mayoria_edad_at` | timestamptz | No | — | Fecha y hora en que se registró la declaración de mayoría de edad. |
| `aceptacion_condiciones_alcohol` | boolean | Sí | false | Aceptación expresa de las condiciones aplicables a la compra de alcohol. |
| `aceptacion_condiciones_alcohol_at` | timestamptz | No | — | Fecha y hora en que se registró la aceptación de las condiciones de compra de alcohol. |
| `version_condiciones_alcohol` | text | No | — | Versión de las condiciones de compra de alcohol aceptadas por el comprador. |
| `acepta_comunicaciones` | boolean | Sí | false | Indica si acepta recibir comunicaciones comerciales. |
| `moneda_preferida` | text | No | 'EUR' | Moneda preferida para mostrar precios. |
| `pais_compra_habitual` | text | No | — | País desde el que compra habitualmente. |
| `num_total_pedidos` | integer | Sí | 0 | Contador denormalizado de pedidos realizados. |
| `importe_total_comprado` | numeric(12,2) | Sí | 0 | Suma denormalizada del importe total comprado. |
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
| `precio` | numeric(10,2) | No | — | Precio de venta al público. |
| `moneda` | text | No | 'EUR' | Moneda en la que se expresa el precio. |
| `pais` | text | No | — | País de origen del vino. |
| `region` | text | No | — | Región vitivinícola de origen. |
| `denominacion_origen` | text | No | — | Denominación de Origen del vino. |
| `subzona` | text | No | — | Subzona dentro de la DO (opcional). |
| `variedades_uva` | text[] | No | — | Variedades de uva empleadas. |
| `crianza` | text | No | — | Tipo de crianza (roble, acero, etc.). |
| `meses_crianza` | integer | No | — | Meses de crianza del vino. |
| `graduacion_alcoholica` | numeric(4,2) | No | — | Graduación alcohólica en grados. |
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
- `chk_vino_id_bodega`: (`id`, `bodega_id`)
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
| `subtotal` | numeric(10,2) | Sí | 0 | Suma de los importes de las líneas, antes de envío/descuentos. |
| `gastos_envio` | numeric(10,2) | Sí | 0 | Gastos de envío calculados para el carrito. |
| `descuentos` | numeric(10,2) | Sí | 0 | Descuentos aplicados (funcionalidad futura). |
| `total` | numeric(10,2) | Sí | 0 | Importe total del carrito. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |
| `fecha_conversion` | timestamptz | No | — | Fecha en la que el carrito se convirtió en pedido. |

**Clave primaria.** `id`

**Claves foráneas.**
- `comprador_id` → `comprador.usuario_id`
- `carrito_id` → `carrito.id`

**Restricciones de unicidad.**
- `uq_carrito_id_comprador`: (`id`, `comprador_id`) clave candidata para la FK compuesta de fusión.

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
| `precio_unitario` | numeric(10,2) | Sí | — | Precio unitario del vino en el momento de añadirlo. |
| `importe_total` | numeric(10,2) | Sí | — | Importe total de la línea (cantidad × precio unitario). |
| `estado` | estado_carrito_item | Sí | 'disponible' | Estado de disponibilidad de la línea en el momento de consultarla. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación del registro. |
| `updated_at` | timestamptz | Sí | now() | Fecha y hora de la última actualización del registro. |

**Clave primaria.** `id`

**Claves foráneas.**
- `carrito_id` → `carrito.id`
- `vino_id` y `bodega_id` → `vino.(id, bodega_id)`

**Restricciones de unicidad.**
- `uq_carrito_vino`: (carrito_id, vino_id) única

**Restricciones (CHECK).**
- `chk_cantidad_minima`: `((cantidad >= 1))`

**Reglas de negocio asociadas.** Un vino solo puede aparecer una vez por carrito (constraint uq_carrito_vino; si se repite, se incrementa cantidad a nivel de aplicación); la cantidad nunca es inferior a una botella (constraint chk_cantidad_minima); el precio se revalida en el checkout, no se da por bueno el guardado en esta tabla

---

## 10. CARRITO_FUSION

**Objetivo.** Ledger técnico inmutable para registrar una instantánea local fusionada tras autenticación y devolver el mismo resultado en reintentos, sin persistir carritos anónimos.

**Relaciones principales.** N:1 con comprador · N:1 con carrito del mismo comprador.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador técnico del registro. |
| `comprador_id` | uuid | Sí | — | Comprador autenticado que ejecuta la fusión. |
| `carrito_id` | uuid | Sí | — | Carrito persistente del mismo comprador. |
| `fusion_id` | uuid | Sí | — | Clave idempotente de la instantánea local. |
| `payload_hash` | text | Sí | — | SHA-256 hexadecimal del JSON canónico calculado por servidor. |
| `resultado` | jsonb | Sí | — | Objeto v1 con carrito y resultado por línea. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora del único procesamiento exitoso. |

**Clave primaria.** `id`

**Claves foráneas.**
- `comprador_id` → `comprador.usuario_id`
- (`carrito_id`, `comprador_id`) → `carrito.(id, comprador_id)` mediante `fk_carrito_fusion_carrito_comprador`.

**Restricciones de unicidad.**
- `uq_carrito_fusion_comprador`: (`comprador_id`, `fusion_id`) única.

**Restricciones (CHECK).**
- `chk_carrito_fusion_payload_hash`: SHA-256 hexadecimal en minúsculas, exactamente 64 caracteres.
- `chk_carrito_fusion_resultado_objeto`: objeto JSON con `version = 1`, objeto `carrito` y array `lineas`.

**Índices.**
- `idx_carrito_fusion_carrito_id`: (`carrito_id`).

**Reglas de negocio asociadas.** El servidor canonicaliza líneas por `vino_id` y cantidades enteras, calcula SHA-256 y bloquea la fila del carrito y líneas afectadas antes de leer, calcular, escribir y registrar el ledger. La fusión y el ledger se confirman en la misma transacción. Repetir comprador, `fusion_id` y hash devuelve `resultado`; un hash distinto con la misma clave se rechaza. El registro no admite UPDATE ni DELETE.

---

## 11. PEDIDO

**Objetivo.** Compra confirmada de un comprador; agrupa todos los productos adquiridos, sea cual sea la bodega vendedora.

**Relaciones principales.** N:1 con comprador · 1:1 con pago · 1:N con subpedido (uno por bodega implicada) · 1:N con pedido_item.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `numero_pedido` | text | Sí | — | Número de pedido visible para el comprador, único. |
| `comprador_id` | uuid | Sí | — | Comprador que realizó el pedido. |
| `carrito_id` | uuid | Sí | — | Carrito de origen; es único y garantiza idempotencia del checkout. |
| `subtotal` | numeric(10,2) | Sí | — | Suma de los importes de todos los pedido_item. |
| `gastos_envio` | numeric(10,2) | Sí | 0 | Gastos de envío totales del pedido. |
| `impuestos` | numeric(10,2) | Sí | 0 | Impuestos aplicados al pedido. |
| `descuentos` | numeric(10,2) | Sí | 0 | Descuentos aplicados al pedido. |
| `total` | numeric(10,2) | Sí | — | Importe total del pedido. |
| `direccion_envio_id` | uuid | Sí | — | Referencia a la dirección de envío original usada. |
| `direccion_envio_snapshot` | jsonb | Sí | — | Copia congelada (JSON) de la dirección de envío en el momento de la compra. |
| `direccion_facturacion_id` | uuid | Sí | — | Referencia a la dirección de facturación original usada. |
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
- `pedido_carrito_id_key`: (carrito_id) única

**Índices.**
- `idx_pedido_comprador_id`: (comprador_id)
- `idx_pedido_estado`: (estado)

**Reglas de negocio asociadas.** Numero_pedido debe ser único; un pedido pagado no puede modificarse; las direcciones de envío/facturación quedan congeladas al confirmar (por eso se guarda también el snapshot en JSONB, además de la FK de referencia a direccion)

---

## 12. PAGO

**Objetivo.** Registra la información económica de una compra, desde la autorización del cobro único hasta el reparto entre bodegas y la comisión del marketplace.

**Relaciones principales.** 1:1 con pedido · 1:N con subpedido (cada subpedido representa la porción del pago que corresponde a una bodega).

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `pedido_id` | uuid | Sí | — | Pedido al que corresponde este pago (relación 1:1). |
| `referencia_stripe` | text | No | — | Identificador del cargo/PaymentIntent en Stripe. |
| `referencia_interna` | text | No | — | Referencia interna de Teralya para el pago. |
| `stripe_checkout_session_id` | text | No | — | Identificador único de la sesión de Stripe Checkout. |
| `stripe_checkout_expires_at` | timestamptz | No | — | Expiración de la sesión de Stripe Checkout. |
| `subtotal` | numeric(10,2) | Sí | — | Subtotal cobrado, sin envío ni impuestos. |
| `gastos_envio` | numeric(10,2) | Sí | 0 | Gastos de envío incluidos en el cobro. |
| `impuestos` | numeric(10,2) | Sí | 0 | Impuestos incluidos en el cobro. |
| `comision_marketplace` | numeric(10,2) | Sí | 0 | Comisión total de Teralya sobre este pago. |
| `total_cobrado` | numeric(10,2) | Sí | — | Importe total cobrado al comprador. |
| `total_repartido` | numeric(10,2) | Sí | 0 | Importe ya repartido entre las bodegas vía sus subpedidos. |
| `total_reembolsado` | numeric(10,2) | Sí | 0 | Importe ya reembolsado al comprador. |
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
- `pago_stripe_checkout_session_id_key`: (stripe_checkout_session_id) única
- `uq_pago_id_pedido`: (id, pedido_id) única

**Restricciones (CHECK).**
- `chk_reparto_no_supera_cobrado`: `((total_repartido <= total_cobrado))`

**Reglas de negocio asociadas.** Un pedido solo puede tener un pago activo; el importe total debe coincidir con el pedido; total_repartido nunca puede superar total_cobrado (constraint chk_reparto_no_supera_cobrado). Nota (Contradicción 2, corregida): NO existe FK directa a cuenta_stripe_connect — un pago puede repartirse entre varias cuentas Stripe, una por bodega. El reparto real se resuelve vía subpedido → bodega → cuenta_stripe_connect.

---

## 13. EVENTO_WEBHOOK_STRIPE

**Objetivo.** Ledger técnico mínimo para garantizar el procesamiento idempotente del webhook de Stripe (API-029). No añade funcionalidad de producto.

**Relaciones principales.** N:1 opcional con pago.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `stripe_event_id` | text | Sí | — | Identificador único del evento y clave primaria de idempotencia. |
| `tipo_evento` | text | Sí | — | Tipo de evento comunicado por Stripe. |
| `pago_id` | uuid | No | — | Pago relacionado, cuando ya puede resolverse. |
| `recibido_at` | timestamptz | Sí | now() | Fecha y hora de recepción. |
| `procesado_at` | timestamptz | No | — | Fecha y hora de procesamiento. |
| `resultado` | resultado_auditoria | Sí | 'correcto' | Resultado técnico registrado. |

**Clave primaria.** `stripe_event_id`

**Claves foráneas.**
- `pago_id` → `pago.id`

**Restricciones (CHECK).**
- `chk_webhook_tipo_no_vacio`: el tipo no puede estar vacío.
- `chk_webhook_procesado`: procesado_at es nulo o posterior a recibido_at.

**Índices.**
- `idx_webhook_stripe_pago_id`: (pago_id)

**Regla de idempotencia.** La clave primaria impide procesar dos veces el mismo `stripe_event_id`.

---

## 14. SUBPEDIDO

**Objetivo.** Parte de un pedido correspondiente a una única bodega; permite que cada bodega gestione de forma independiente su preparación, envío e incidencias.

**Relaciones principales.** N:1 con pedido · N:1 con bodega · N:1 con pago · 1:N con pedido_item.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `pedido_id` | uuid | Sí | — | Pedido al que pertenece este subpedido. |
| `bodega_id` | uuid | Sí | — | Bodega responsable de este subpedido. |
| `pago_id` | uuid | Sí | — | Pago del que este subpedido representa una porción. |
| `subtotal` | numeric(10,2) | Sí | — | Subtotal correspondiente a los productos de esta bodega. |
| `gastos_envio` | numeric(10,2) | Sí | 0 | Gastos de envío correspondientes a esta bodega. |
| `impuestos` | numeric(10,2) | Sí | 0 | Impuestos correspondientes a esta bodega. |
| `comision_marketplace` | numeric(10,2) | Sí | 0 | Comisión de Teralya sobre este subpedido. |
| `total` | numeric(10,2) | Sí | — | Importe total que corresponde a esta bodega. |
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
- `pedido_id` → `pedido.id`
- FK compuesta `fk_subpedido_pago_pedido`: (`pago_id`, `pedido_id`) → `pago(id, pedido_id)`

**Restricciones de unicidad.**
- `uq_subpedido_pedido_bodega`: (`pedido_id`, `bodega_id`)
- `uq_subpedido_id_pedido_bodega`: (`id`, `pedido_id`, `bodega_id`)

**Índices.**
- `idx_subpedido_bodega_id`: (bodega_id)
- `idx_subpedido_pago_id`: (pago_id)
- `idx_subpedido_pedido_id`: (pedido_id)

**Reglas de negocio asociadas.** Pertenece a una única bodega y un único pedido; el estado del pedido depende del estado conjunto de sus subpedidos; un subpedido entregado no puede volver a preparación. Decisión CTO: subpedido.estado es la ÚNICA fuente de verdad del flujo logístico completo (pendiente → aceptado → en_preparacion → enviado → entregado / cancelado / incidencia). pedido_item ya no duplica estos estados (ver tabla pedido_item).

---

## 15. PEDIDO_ITEM

**Objetivo.** Línea de producto dentro de un pedido; conserva una copia congelada (snapshot) del vino en el momento de la compra.

**Relaciones principales.** N:1 pedido · N:1 subpedido · N:1 vino.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la fila. |
| `pedido_id` | uuid | Sí | — | Pedido al que pertenece esta línea. |
| `subpedido_id` | uuid | Sí | — | Subpedido (bodega) al que pertenece esta línea. |
| `vino_id` | uuid | Sí | — | Vino comprado en esta línea. |
| `bodega_id` | uuid | Sí | — | Bodega propietaria del vino y del SubPedido. |
| `nombre_vino_snapshot` | text | Sí | — | Nombre del vino congelado en el momento de la compra. |
| `anada_snapshot` | integer | No | — | Añada del vino congelada en el momento de la compra. |
| `bodega_snapshot` | text | Sí | — | Nombre de la bodega congelado en el momento de la compra. |
| `precio_unitario` | numeric(10,2) | Sí | — | Precio unitario pagado, congelado, no cambia después. |
| `cantidad` | integer | Sí | — | Número de botellas de esta línea. |
| `importe_total` | numeric(10,2) | Sí | — | Importe total de la línea (cantidad × precio unitario). |
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

## 16. INCIDENCIA

**Objetivo.** Registrar un problema operativo básico relacionado con un pedido, subpedido, bodega o vino para su revisión y gestión por administración.

**Alcance.** Registro, clasificación, estado, descripción, asociación funcional y trazabilidad mínima. No constituye un sistema de tickets, chat, CRM ni soporte avanzado.

**Relaciones principales.** N:1 opcional con pedido · N:1 opcional con subpedido · N:1 opcional con bodega · N:1 opcional con vino · relación polimórfica con auditoria mediante (`tipo_entidad`, `entidad_id`).

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la incidencia. |
| `tipo` | text | Sí | — | Clasificación funcional del problema operativo. |
| `estado` | estado_incidencia | Sí | 'abierta' | Estado de gestión: abierta, en_revision, resuelta o cerrada. |
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

**Reglas de negocio asociadas.** Solo administración gestiona incidencias; debe existir al menos una entidad relacionada; la descripción aporta la información mínima de gestión; la base de datos solo permite `abierta → en_revision → resuelta → cerrada`; cada cambio queda auditado y no se admiten saltos ni reaperturas.

---

## 17. NOTIFICACION

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

## 18. AUDITORIA

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

## 19. SOLICITUD_RECUPERACION_PASSWORD

**Objetivo.** Conservar de forma segura y trazable las solicitudes de recuperación de acceso de las cuentas de usuario.

**Relaciones principales.** N:1 con usuario.

| Campo | Tipo | Obligatorio | Default | Descripción |
|---|---|---|---|---|
| `id` | uuid | Sí | gen_random_uuid() | Identificador único de la solicitud. |
| `usuario_id` | uuid | Sí | — | Cuenta de usuario a la que pertenece la solicitud. |
| `token_hash` | text | Sí | — | Huella segura y única del token; no almacena el token utilizable en claro. |
| `estado` | estado_solicitud_recuperacion | Sí | 'pendiente' | Estado: pendiente, utilizada, expirada o cancelada. |
| `created_at` | timestamptz | Sí | now() | Fecha y hora de creación. |
| `expires_at` | timestamptz | Sí | — | Fecha y hora límite de validez. |
| `used_at` | timestamptz | No | — | Fecha y hora de utilización efectiva. |

**Clave primaria.** `id`

**Claves foráneas.** `usuario_id` → `usuario.id`, con borrado en cascada.

**Restricciones de unicidad.** `token_hash` es único.

**Índices.**
- `idx_solicitud_recuperacion_usuario_id`: (`usuario_id`)
- `idx_solicitud_recuperacion_estado_expires`: (`estado`, `expires_at`)

**Reglas de negocio asociadas.** Una cuenta puede tener múltiples solicitudes históricas; solo una solicitud pendiente, no expirada y no utilizada permite cambiar la contraseña; el token se almacena exclusivamente como hash; una solicitud utilizada, expirada o cancelada no se reutiliza.

---

## Catálogo normativo de tipos ENUM

| Tipo | Valores permitidos |
|---|---|
| `rol_usuario` | comprador · bodega · administrador |
| `estado_usuario` | pendiente_verificacion · activo · suspendido · bloqueado · eliminado |
| `estado_bodega` | borrador · pendiente_revision · aprobada · activa · suspendida · archivada |
| `tipo_bodega` | fundadora · estandar |
| `estado_vino` | borrador · pendiente_revision · publicado · oculto · archivado |
| `tipo_entidad_imagen` | vino · bodega |
| `tipo_propietario_dir` | comprador · bodega |
| `estado_carrito` | activo · convertido · abandonado · cancelado |
| `estado_carrito_item` | disponible · sin_stock · descatalogado · precio_modificado |
| `estado_pedido` | pendiente_pago · pagado · en_preparacion · parcialmente_enviado · enviado · entregado · cancelado · devuelto |
| `estado_pedido_item` | normal · cancelado · devuelto |
| `estado_subpedido` | pendiente · aceptado · en_preparacion · enviado · entregado · cancelado · incidencia |
| `estado_pago` | pendiente · autorizado · pagado · parcialmente_reembolsado · reembolsado · fallido · cancelado |
| `estado_cuenta_stripe` | no_iniciada · pendiente · en_revision · activa · restringida · suspendida |
| `canal_notificacion` | email |
| `estado_notificacion` | pendiente · enviada · entregada · fallida · cancelada |
| `resultado_auditoria` | correcto · error |
| `estado_solicitud_recuperacion` | pendiente · utilizada · expirada · cancelada |
| `estado_incidencia` | abierta · en_revision · resuelta · cerrada |

## Restricciones incorporadas en v1.2

- **Bodega:** comisión nula o entre 0 y 100; plazo de preparación no negativo; una bodega aprobada o activa debe tener comisión.
- **Usuario:** el rol bodega exige bodega_id; comprador y administrador lo prohíben; intentos fallidos no negativos; email único sin distinguir mayúsculas.
- **Comprador:** contadores e importe acumulado no negativos; usuario asociado con rol comprador.
- **Vino:** estado pendiente_revision; precio positivo cuando exista; stocks no negativos; medidas físicas positivas; unicidad compuesta (id, bodega_id).
- **Carrito:** importes y contadores no negativos; total = subtotal + gastos_envio − descuentos; un carrito activo por comprador.
- **CarritoItem:** cantidad mínima 1; importe = precio_unitario × cantidad; un vino por carrito.
- **Pedido:** carrito de origen único; importes no negativos; total = subtotal + gastos_envio + impuestos − descuentos; direcciones obligatorias y propias del comprador.
- **Pago:** fuente económica única; sesión Stripe única; importes no negativos; reparto y reembolso no superan el cobrado; total_cobrado coincide con Pedido.
- **SubPedido:** uno por Pedido y bodega; FK compuesta con Pago; importes no negativos.
- **PedidoItem:** integridad compuesta con Pedido, SubPedido, bodega y vino; cantidad positiva e importe calculado.
- **Incidencia:** tipo y descripción no vacíos; al menos un recurso relacionado; ciclo cerrado de estados.
- **Recuperación:** expiración posterior a creación; uso posterior a creación; estado utilizada equivale a used_at informado.
- **Auditoría:** registros inmutables.

## Catálogo de funciones

| Función | Finalidad |
|---|---|
| `fn_actualizar_updated_at` | Actualiza automáticamente updated_at. |
| `fn_proteger_coherencia_rol_usuario` | Impide cambios de rol o estado que rompan relaciones. |
| `fn_validar_rol_comprador` | Exige rol comprador. |
| `fn_validar_aprobador_bodega` | Exige administrador activo como aprobador. |
| `fn_validar_imagen_entidad` | Valida el propietario real de una imagen. |
| `fn_validar_direccion_propietario` | Valida el propietario real de una dirección. |
| `fn_proteger_referencias_polimorficas` | Impide borrados que dejen referencias huérfanas. |
| `fn_validar_direcciones_pedido` | Exige direcciones activas y propias del comprador. |
| `fn_validar_importe_pago_pedido` | Comprueba Pago → Pedido. |
| `fn_proteger_total_pedido_con_pago` | Comprueba Pedido → Pago. |
| `fn_validar_transicion_incidencia` | Aplica el ciclo cerrado de Incidencia. |
| `fn_auditar_estado_incidencia` | Audita automáticamente cambios de Incidencia. |
| `fn_proteger_carrito_fusion` | Bloquea UPDATE y DELETE en el ledger de fusión. |
| `fn_proteger_auditoria` | Bloquea UPDATE y DELETE en Auditoría. |

## Catálogo de triggers

| Trigger | Tabla | Evento | Función |
|---|---|---|---|
| `trg_bodega_updated_at` | `bodega` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_usuario_updated_at` | `usuario` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_comprador_updated_at` | `comprador` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_cuenta_stripe_updated_at` | `cuenta_stripe_connect` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_vino_updated_at` | `vino` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_imagen_updated_at` | `imagen` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_direccion_updated_at` | `direccion` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_carrito_updated_at` | `carrito` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_carrito_item_updated_at` | `carrito_item` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_pedido_updated_at` | `pedido` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_pago_updated_at` | `pago` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_subpedido_updated_at` | `subpedido` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_pedido_item_updated_at` | `pedido_item` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_incidencia_updated_at` | `incidencia` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_notificacion_updated_at` | `notificacion` | BEFORE UPDATE | `fn_actualizar_updated_at()` |
| `trg_proteger_coherencia_rol_usuario` | `usuario` | BEFORE UPDATE OF rol, estado | `fn_proteger_coherencia_rol_usuario()` |
| `trg_validar_rol_comprador` | `comprador` | BEFORE INSERT OR UPDATE OF usuario_id | `fn_validar_rol_comprador()` |
| `trg_validar_aprobador_bodega` | `bodega` | BEFORE INSERT OR UPDATE OF aprobada_por | `fn_validar_aprobador_bodega()` |
| `trg_validar_imagen_entidad` | `imagen` | BEFORE INSERT OR UPDATE OF tipo_entidad, entidad_id | `fn_validar_imagen_entidad()` |
| `trg_validar_direccion_propietario` | `direccion` | BEFORE INSERT OR UPDATE OF propietario_tipo, propietario_id | `fn_validar_direccion_propietario()` |
| `trg_proteger_refs_bodega` | `bodega` | BEFORE DELETE | `fn_proteger_referencias_polimorficas()` |
| `trg_proteger_refs_vino` | `vino` | BEFORE DELETE | `fn_proteger_referencias_polimorficas()` |
| `trg_proteger_refs_comprador` | `comprador` | BEFORE DELETE | `fn_proteger_referencias_polimorficas()` |
| `trg_validar_direcciones_pedido` | `pedido` | BEFORE INSERT OR UPDATE OF comprador_id, direccion_envio_id, direccion_facturacion_id | `fn_validar_direcciones_pedido()` |
| `trg_validar_importe_pago_pedido` | `pago` | BEFORE INSERT OR UPDATE OF pedido_id, total_cobrado | `fn_validar_importe_pago_pedido()` |
| `trg_proteger_total_pedido_con_pago` | `pedido` | BEFORE UPDATE OF total | `fn_proteger_total_pedido_con_pago()` |
| `trg_validar_transicion_incidencia` | `incidencia` | BEFORE UPDATE OF estado | `fn_validar_transicion_incidencia()` |
| `trg_auditar_estado_incidencia` | `incidencia` | AFTER UPDATE OF estado | `fn_auditar_estado_incidencia()` |
| `trg_proteger_carrito_fusion` | `carrito_fusion` | BEFORE UPDATE OR DELETE | `fn_proteger_carrito_fusion()` |
| `trg_proteger_auditoria` | `auditoria` | BEFORE UPDATE OR DELETE | `fn_proteger_auditoria()` |

Total normativo: **14 funciones y 30 triggers**.

## Índices y claves operativas añadidos

- `uq_usuario_email_normalizado`.
- `idx_carrito_comprador_id`, `idx_carrito_item_carrito_id`, `idx_carrito_item_vino_id`, `idx_carrito_fusion_carrito_id`.
- `idx_webhook_stripe_pago_id`.
- `idx_pedido_item_vino_id`, `idx_pedido_item_bodega_id`.
- `idx_notificacion_pedido_id`, `idx_notificacion_subpedido_id`.
- `idx_bodega_aprobada_por`, `idx_bodega_updated_by`.
- `idx_pedido_estado_created`, `idx_subpedido_bodega_estado`, `idx_vino_bodega_estado`, `idx_incidencia_estado_fecha`.
- Unicidades compuestas: Vino(id,bodega), Pago(id,pedido), SubPedido(pedido,bodega), SubPedido(id,pedido,bodega).

## Garantías transversales

1. `pedido.carrito_id UNIQUE` evita Pedidos duplicados.
2. La sesión de Stripe y `stripe_event_id` garantizan idempotencia de pago y webhook.
3. `pago.estado` es la única fuente persistente económica.
4. Las claves compuestas impiden mezclar Pedidos, Pagos, SubPedidos, líneas, bodegas y vinos.
5. `subpedido.estado` es la fuente logística; PedidoItem solo conserva normal, cancelado o devuelto.
6. Los cambios de Incidencia quedan auditados automáticamente.

## Matriz de correspondencia INF-05 ↔ INF-06

| Elemento | INF-05 v1.4 | INF-06 v1.3 |
|---|---:|---:|
| Tablas | 19 | 19 |
| Tipos ENUM | 19 | 19 |
| Funciones | 14 | 14 |
| Triggers | 30 | 30 |
| Constraints nombradas | 46 | 46 |
| Índices explícitos | 44 | 44 |
| Fuente económica | PAGO | PAGO |
| Fuente logística | SUBPEDIDO | SUBPEDIDO |
| Ledger Stripe | EVENTO_WEBHOOK_STRIPE | EVENTO_WEBHOOK_STRIPE |
| Ledger fusión | CARRITO_FUSION | CARRITO_FUSION |

## Catálogo literal de constraints nombradas

| Tabla | Constraint | Definición normativa |
|---|---|---|
| `bodega` | `chk_bodega_comision` | `CONSTRAINT chk_bodega_comision CHECK (comision IS NULL OR comision BETWEEN 0 AND 100)` |
| `bodega` | `chk_bodega_plazo_preparacion` | `CONSTRAINT chk_bodega_plazo_preparacion CHECK (plazo_preparacion_dias IS NULL OR plazo_preparacion_dias >= 0)` |
| `bodega` | `chk_bodega_comision_para_operar` | `CONSTRAINT chk_bodega_comision_para_operar CHECK (estado NOT IN ('aprobada', 'activa') OR comision IS NOT NULL)` |
| `usuario` | `chk_bodega_segun_rol` | `CONSTRAINT chk_bodega_segun_rol CHECK ( (rol = 'bodega' AND bodega_id IS NOT NULL) OR (rol IN ('comprador', 'administrador') AND bodega_id IS NULL) )` |
| `usuario` | `chk_usuario_intentos_fallidos` | `CONSTRAINT chk_usuario_intentos_fallidos CHECK (intentos_fallidos >= 0)` |
| `solicitud_recuperacion_password` | `chk_recuperacion_expira_despues` | `CONSTRAINT chk_recuperacion_expira_despues CHECK (expires_at > created_at)` |
| `solicitud_recuperacion_password` | `chk_recuperacion_uso_despues` | `CONSTRAINT chk_recuperacion_uso_despues CHECK (used_at IS NULL OR used_at >= created_at)` |
| `solicitud_recuperacion_password` | `chk_recuperacion_estado_uso` | `CONSTRAINT chk_recuperacion_estado_uso CHECK ((estado = 'utilizada') = (used_at IS NOT NULL))` |
| `bodega` | `fk_bodega_aprobada_por` | `CONSTRAINT fk_bodega_aprobada_por FOREIGN KEY (aprobada_por) REFERENCES usuario(id)` |
| `bodega` | `fk_bodega_updated_by` | `CONSTRAINT fk_bodega_updated_by FOREIGN KEY (updated_by) REFERENCES usuario(id)` |
| `comprador` | `chk_comprador_contadores` | `CONSTRAINT chk_comprador_contadores CHECK ( num_total_pedidos >= 0 AND importe_total_comprado >= 0 )` |
| `vino` | `chk_vino_id_bodega` | `CONSTRAINT chk_vino_id_bodega UNIQUE (id, bodega_id)` |
| `vino` | `chk_vino_precio` | `CONSTRAINT chk_vino_precio CHECK (precio IS NULL OR precio > 0)` |
| `vino` | `chk_stock_no_negativo` | `CONSTRAINT chk_stock_no_negativo CHECK (stock_disponible >= 0 AND stock_reservado >= 0 AND stock_minimo >= 0)` |
| `vino` | `chk_vino_medidas` | `CONSTRAINT chk_vino_medidas CHECK ( (volumen_ml IS NULL OR volumen_ml > 0) AND (peso_gramos IS NULL OR peso_gramos > 0) AND (botellas_por_caja IS NULL OR botellas_por_caja > 0) AND (plazo_preparacion_dias IS NULL OR plazo_preparacion_dias >= 0) )` |
| `carrito` | `chk_carrito_contadores` | `CONSTRAINT chk_carrito_contadores CHECK (num_productos >= 0 AND num_botellas >= 0)` |
| `carrito` | `chk_carrito_importes` | `CONSTRAINT chk_carrito_importes CHECK ( subtotal >= 0 AND gastos_envio >= 0 AND descuentos >= 0 AND total >= 0 )` |
| `carrito` | `chk_carrito_total` | `CONSTRAINT chk_carrito_total CHECK (total = subtotal + gastos_envio - descuentos)` |
| `carrito` | `uq_carrito_id_comprador` | `CONSTRAINT uq_carrito_id_comprador UNIQUE (id, comprador_id)` |
| `carrito_item` | `chk_cantidad_minima` | `CONSTRAINT chk_cantidad_minima CHECK (cantidad >= 1)` |
| `carrito_item` | `chk_carrito_item_importes` | `CONSTRAINT chk_carrito_item_importes CHECK ( precio_unitario >= 0 AND importe_total >= 0 AND importe_total = precio_unitario * cantidad )` |
| `carrito_item` | `uq_carrito_vino` | `CONSTRAINT uq_carrito_vino UNIQUE (carrito_id, vino_id)` |
| `carrito_fusion` | `fk_carrito_fusion_carrito_comprador` | `CONSTRAINT fk_carrito_fusion_carrito_comprador FOREIGN KEY (carrito_id, comprador_id) REFERENCES carrito(id, comprador_id)` |
| `carrito_fusion` | `uq_carrito_fusion_comprador` | `CONSTRAINT uq_carrito_fusion_comprador UNIQUE (comprador_id, fusion_id)` |
| `carrito_fusion` | `chk_carrito_fusion_payload_hash` | `CONSTRAINT chk_carrito_fusion_payload_hash CHECK (payload_hash ~ '^[0-9a-f]{64}$')` |
| `carrito_fusion` | `chk_carrito_fusion_resultado_objeto` | `CONSTRAINT chk_carrito_fusion_resultado_objeto CHECK (jsonb_typeof(resultado) = 'object' AND resultado ->> 'version' = '1' AND jsonb_typeof(resultado -> 'carrito') = 'object' AND jsonb_typeof(resultado -> 'lineas') = 'array')` |
| `pedido` | `chk_pedido_importes` | `CONSTRAINT chk_pedido_importes CHECK ( subtotal >= 0 AND gastos_envio >= 0 AND impuestos >= 0 AND descuentos >= 0 AND total >= 0 )` |
| `pedido` | `chk_pedido_total` | `CONSTRAINT chk_pedido_total CHECK (total = subtotal + gastos_envio + impuestos - descuentos)` |
| `pago` | `uq_pago_id_pedido` | `CONSTRAINT uq_pago_id_pedido UNIQUE (id, pedido_id)` |
| `pago` | `chk_pago_importes` | `CONSTRAINT chk_pago_importes CHECK ( subtotal >= 0 AND gastos_envio >= 0 AND impuestos >= 0 AND comision_marketplace >= 0 AND total_cobrado >= 0 AND total_repartido >= 0 AND total_reembolsado >= 0 )` |
| `pago` | `chk_reparto_no_supera_cobrado` | `CONSTRAINT chk_reparto_no_supera_cobrado CHECK (total_repartido <= total_cobrado)` |
| `pago` | `chk_reembolso_no_supera_cobrado` | `CONSTRAINT chk_reembolso_no_supera_cobrado CHECK (total_reembolsado <= total_cobrado)` |
| `pago` | `chk_checkout_session_coherente` | `CONSTRAINT chk_checkout_session_coherente CHECK ( stripe_checkout_session_id IS NULL OR stripe_checkout_expires_at IS NOT NULL )` |
| `evento_webhook_stripe` | `chk_webhook_tipo_no_vacio` | `CONSTRAINT chk_webhook_tipo_no_vacio CHECK (btrim(tipo_evento) <> '')` |
| `evento_webhook_stripe` | `chk_webhook_procesado` | `CONSTRAINT chk_webhook_procesado CHECK (procesado_at IS NULL OR procesado_at >= recibido_at)` |
| `subpedido` | `fk_subpedido_pago_pedido` | `CONSTRAINT fk_subpedido_pago_pedido FOREIGN KEY (pago_id, pedido_id) REFERENCES pago(id, pedido_id)` |
| `subpedido` | `uq_subpedido_pedido_bodega` | `CONSTRAINT uq_subpedido_pedido_bodega UNIQUE (pedido_id, bodega_id)` |
| `subpedido` | `uq_subpedido_id_pedido_bodega` | `CONSTRAINT uq_subpedido_id_pedido_bodega UNIQUE (id, pedido_id, bodega_id)` |
| `subpedido` | `chk_subpedido_importes` | `CONSTRAINT chk_subpedido_importes CHECK ( subtotal >= 0 AND gastos_envio >= 0 AND impuestos >= 0 AND comision_marketplace >= 0 AND total >= 0 )` |
| `pedido_item` | `fk_item_subpedido_pedido_bodega` | `CONSTRAINT fk_item_subpedido_pedido_bodega FOREIGN KEY (subpedido_id, pedido_id, bodega_id) REFERENCES subpedido(id, pedido_id, bodega_id)` |
| `pedido_item` | `fk_item_vino_bodega` | `CONSTRAINT fk_item_vino_bodega FOREIGN KEY (vino_id, bodega_id) REFERENCES vino(id, bodega_id)` |
| `pedido_item` | `chk_cantidad_positiva` | `CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0)` |
| `pedido_item` | `chk_pedido_item_importes` | `CONSTRAINT chk_pedido_item_importes CHECK ( precio_unitario >= 0 AND importe_total >= 0 AND importe_total = precio_unitario * cantidad )` |
| `incidencia` | `chk_incidencia_tipo_no_vacio` | `CONSTRAINT chk_incidencia_tipo_no_vacio CHECK (btrim(tipo) <> '')` |
| `incidencia` | `chk_incidencia_descripcion_no_vacia` | `CONSTRAINT chk_incidencia_descripcion_no_vacia CHECK (btrim(descripcion) <> '')` |
| `incidencia` | `chk_incidencia_relacion` | `CONSTRAINT chk_incidencia_relacion CHECK ( pedido_id IS NOT NULL OR subpedido_id IS NOT NULL OR bodega_id IS NOT NULL OR vino_id IS NOT NULL )` |

## Catálogo literal de índices

| Índice | Tabla | Definición normativa |
|---|---|---|
| `idx_usuario_bodega_id` | `usuario` | `CREATE INDEX idx_usuario_bodega_id ON usuario(bodega_id);` |
| `idx_usuario_rol` | `usuario` | `CREATE INDEX idx_usuario_rol ON usuario(rol);` |
| `idx_solicitud_recuperacion_usuario_id` | `solicitud_recuperacion_password` | `CREATE INDEX idx_solicitud_recuperacion_usuario_id ON solicitud_recuperacion_password(usuario_id);` |
| `idx_solicitud_recuperacion_estado_expires` | `solicitud_recuperacion_password` | `CREATE INDEX idx_solicitud_recuperacion_estado_expires ON solicitud_recuperacion_password(estado, expires_at);` |
| `idx_vino_bodega_id` | `vino` | `CREATE INDEX idx_vino_bodega_id ON vino(bodega_id);` |
| `idx_vino_estado` | `vino` | `CREATE INDEX idx_vino_estado ON vino(estado);` |
| `idx_imagen_entidad` | `imagen` | `CREATE INDEX idx_imagen_entidad ON imagen(tipo_entidad, entidad_id);` |
| `uq_imagen_principal` | `imagen` | `CREATE UNIQUE INDEX uq_imagen_principal ON imagen(tipo_entidad, entidad_id) WHERE es_principal;` |
| `idx_direccion_propietario` | `direccion` | `CREATE INDEX idx_direccion_propietario ON direccion(propietario_tipo, propietario_id);` |
| `uq_direccion_principal` | `direccion` | `CREATE UNIQUE INDEX uq_direccion_principal ON direccion(propietario_tipo, propietario_id) WHERE es_principal;` |
| `uq_carrito_activo_por_comprador` | `carrito` | `CREATE UNIQUE INDEX uq_carrito_activo_por_comprador ON carrito(comprador_id) WHERE estado = 'activo';` |
| `idx_carrito_fusion_carrito_id` | `carrito_fusion` | `CREATE INDEX idx_carrito_fusion_carrito_id ON carrito_fusion(carrito_id);` |
| `idx_pedido_comprador_id` | `pedido` | `CREATE INDEX idx_pedido_comprador_id ON pedido(comprador_id);` |
| `idx_pedido_estado` | `pedido` | `CREATE INDEX idx_pedido_estado ON pedido(estado);` |
| `idx_webhook_stripe_pago_id` | `evento_webhook_stripe` | `CREATE INDEX idx_webhook_stripe_pago_id ON evento_webhook_stripe(pago_id);` |
| `idx_subpedido_pedido_id` | `subpedido` | `CREATE INDEX idx_subpedido_pedido_id ON subpedido(pedido_id);` |
| `idx_subpedido_bodega_id` | `subpedido` | `CREATE INDEX idx_subpedido_bodega_id ON subpedido(bodega_id);` |
| `idx_subpedido_pago_id` | `subpedido` | `CREATE INDEX idx_subpedido_pago_id ON subpedido(pago_id);` |
| `idx_pedido_item_pedido_id` | `pedido_item` | `CREATE INDEX idx_pedido_item_pedido_id ON pedido_item(pedido_id);` |
| `idx_pedido_item_subpedido_id` | `pedido_item` | `CREATE INDEX idx_pedido_item_subpedido_id ON pedido_item(subpedido_id);` |
| `idx_incidencia_estado` | `incidencia` | `CREATE INDEX idx_incidencia_estado ON incidencia(estado);` |
| `idx_incidencia_fecha` | `incidencia` | `CREATE INDEX idx_incidencia_fecha ON incidencia(fecha);` |
| `idx_incidencia_pedido_id` | `incidencia` | `CREATE INDEX idx_incidencia_pedido_id ON incidencia(pedido_id) WHERE pedido_id IS NOT NULL;` |
| `idx_incidencia_subpedido_id` | `incidencia` | `CREATE INDEX idx_incidencia_subpedido_id ON incidencia(subpedido_id) WHERE subpedido_id IS NOT NULL;` |
| `idx_incidencia_bodega_id` | `incidencia` | `CREATE INDEX idx_incidencia_bodega_id ON incidencia(bodega_id) WHERE bodega_id IS NOT NULL;` |
| `idx_incidencia_vino_id` | `incidencia` | `CREATE INDEX idx_incidencia_vino_id ON incidencia(vino_id) WHERE vino_id IS NOT NULL;` |
| `idx_notificacion_usuario_id` | `notificacion` | `CREATE INDEX idx_notificacion_usuario_id ON notificacion(usuario_id);` |
| `idx_auditoria_entidad` | `auditoria` | `CREATE INDEX idx_auditoria_entidad ON auditoria(tipo_entidad, entidad_id);` |
| `idx_auditoria_usuario_id` | `auditoria` | `CREATE INDEX idx_auditoria_usuario_id ON auditoria(usuario_id);` |
| `idx_auditoria_fecha` | `auditoria` | `CREATE INDEX idx_auditoria_fecha ON auditoria(fecha_hora);` |
| `uq_usuario_email_normalizado` | `usuario` | `CREATE UNIQUE INDEX uq_usuario_email_normalizado ON usuario(lower(email));` |
| `idx_carrito_comprador_id` | `carrito` | `CREATE INDEX idx_carrito_comprador_id ON carrito(comprador_id);` |
| `idx_carrito_item_carrito_id` | `carrito_item` | `CREATE INDEX idx_carrito_item_carrito_id ON carrito_item(carrito_id);` |
| `idx_carrito_item_vino_id` | `carrito_item` | `CREATE INDEX idx_carrito_item_vino_id ON carrito_item(vino_id);` |
| `idx_pedido_item_vino_id` | `pedido_item` | `CREATE INDEX idx_pedido_item_vino_id ON pedido_item(vino_id);` |
| `idx_pedido_item_bodega_id` | `pedido_item` | `CREATE INDEX idx_pedido_item_bodega_id ON pedido_item(bodega_id);` |
| `idx_notificacion_pedido_id` | `notificacion` | `CREATE INDEX idx_notificacion_pedido_id ON notificacion(pedido_id) WHERE pedido_id IS NOT NULL;` |
| `idx_notificacion_subpedido_id` | `notificacion` | `CREATE INDEX idx_notificacion_subpedido_id ON notificacion(subpedido_id) WHERE subpedido_id IS NOT NULL;` |
| `idx_bodega_aprobada_por` | `bodega` | `CREATE INDEX idx_bodega_aprobada_por ON bodega(aprobada_por) WHERE aprobada_por IS NOT NULL;` |
| `idx_bodega_updated_by` | `bodega` | `CREATE INDEX idx_bodega_updated_by ON bodega(updated_by) WHERE updated_by IS NOT NULL;` |
| `idx_pedido_estado_created` | `pedido` | `CREATE INDEX idx_pedido_estado_created ON pedido(estado, created_at);` |
| `idx_subpedido_bodega_estado` | `subpedido` | `CREATE INDEX idx_subpedido_bodega_estado ON subpedido(bodega_id, estado);` |
| `idx_vino_bodega_estado` | `vino` | `CREATE INDEX idx_vino_bodega_estado ON vino(bodega_id, estado);` |
| `idx_incidencia_estado_fecha` | `incidencia` | `CREATE INDEX idx_incidencia_estado_fecha ON incidencia(estado, fecha DESC);` |
