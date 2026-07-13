# INF-10-A — Catálogo Normativo de DTO

## Portada

- **Proyecto:** Teralya
- **Documento:** INF-10-A — Catálogo Normativo de DTO
- **Versión:** 1.0
- **Estado:** APROBADO POR EL CTO
- **Fecha:** 13/07/2026
- **Responsable:** CTO Teralya
- **Decisión:** DLOG 0020
- **Dependencias:** INF-05 v1.4, INF-06 v1.3, CAP-08 v1.4, INF-08 v2.5 e INF-10 v1.0

## Regla de lectura

Este catálogo cierra TAPI-09. Cada schema es un objeto JSON con `additionalProperties:false`. Un campo no listado está prohibido. Los campos opcionales se omiten cuando no existen; **ningún campo admite `null`**. `RO` significa solo respuesta y `WO` solo request. Todos los strings se recortan salvo Password/RecoveryToken/ConfirmationToken. No se admite HTML.

**Regla normativa de composición:** la expresión `campos de X` significa la unión plana y literal de las propiedades requeridas y opcionales ya enumeradas en X, conservando tipos, límites y flags; las propiedades añadidas se suman y una repetida debe ser idéntica. `campos de X excepto p` elimina explícitamente `p` —tanto de properties como de required— antes de añadir la propiedad sustituta declarada; no es un override implícito. `campos PageMeta` significa insertar literalmente `page`, `page_size`, `total_items` y `total_pages`. El YAML no usará `allOf`: materializará el conjunto plano resultante con una única lista `required`. Ningún generador puede reinterpretar, omitir o añadir propiedades.

## Tipos escalares normativos

| Alias | Tipo y restricción |
|---|---|
| UUID | string, format uuid |
| Date | string, format date |
| DateTime | string, format date-time UTC |
| Email | string, format email, 3..254, comparación case-insensitive |
| Password | string WO, 12..128, no trim |
| RecoveryToken | string WO, 32..512 |
| ConfirmationToken | string sensible, 32..4096; RO en UploadAuthorization y WO en ImageConfirmRequest |
| Lang | enum es, en, fr, de, it |
| URI | string, format uri, 1..2048 |
| Text32 | string, 1..32 |
| Text80 | string, 1..80 |
| Text100 | string, 1..100 |
| Text160 | string, 1..160 |
| Text200 | string, 1..200 |
| Text500 | string, 1..500 |
| Text5000 | string, 1..5000 |
| Money | string, pattern `^(0|[1-9][0-9]{0,7})\.[0-9]{2}$` |
| PositiveMoney | Money distinto de 0.00 |
| Percent | string decimal, 0.00..100.00 |
| Currency | enum EUR |
| Quantity | integer, 1..999 |
| Stock | integer, 0..999999 |
| Year | integer, 1800..2100 |
| Page | integer, mínimo 1, default 1 |
| PageSize | integer, 1..100, default 20 |
| Role | enum comprador, bodega, administrador |
| UserState | enum pendiente_verificacion, activo, suspendido, bloqueado, eliminado |
| WineryState | enum borrador, pendiente_revision, aprobada, activa, suspendida, archivada |
| WineState | enum borrador, pendiente_revision, publicado, oculto, archivado |
| CartState | enum activo, convertido, abandonado, cancelado |
| CartItemState | enum disponible, sin_stock, descatalogado, precio_modificado |
| OrderState | enum pendiente_pago, pagado, en_preparacion, parcialmente_enviado, enviado, entregado, cancelado, devuelto |
| PaymentState | enum pendiente, autorizado, pagado, parcialmente_reembolsado, reembolsado, fallido, cancelado |
| SubOrderState | enum pendiente, aceptado, en_preparacion, enviado, entregado, cancelado, incidencia |
| IncidentState | enum abierta, en_revision, resuelta, cerrada |

Arrays admiten como máximo 20 elementos salvo `items` de una página. Los elementos textuales miden 1..100 y son únicos tras normalización.

## Schemas transversales

| Schema | Campos requeridos | Campos opcionales | Flags y reglas |
|---|---|---|---|
| FieldError | `field:string(1..200)`, `code:Text80`, `message:Text500` | — | RO |
| Problem | `type:URI`, `title:Text160`, `status:integer(400..599)`, `detail:Text500`, `code:Text80`, `request_id:UUID`, `retryable:boolean` | `instance:string(1..2048)`, `field_errors:FieldError[0..50]` | RO |
| GenericAck | `message:Text500`, `request_id:UUID` | — | RO |
| PageMeta | `page:Page`, `page_size:PageSize`, `total_items:integer>=0`, `total_pages:integer>=0` | — | RO; `total_pages=ceil(total_items/page_size)` |
| MoneyBreakdown | `subtotal:Money`, `gastos_envio:Money`, `impuestos:Money`, `descuentos:Money`, `total:Money`, `moneda:Currency` | — | RO |
| SubOrderMoneyBreakdown | `subtotal:Money`, `gastos_envio:Money`, `impuestos:Money`, `total:Money`, `moneda:Currency` | — | RO; no expone comisión ni inventa descuentos |

## Autenticación

| Schema | Campos requeridos | Campos opcionales | Flags y reglas |
|---|---|---|---|
| RegisterBuyerRequest | `email:Email`, `password:Password`, `nombre:Text100`, `apellidos:Text100`, `fecha_nacimiento:Date`, `declaracion_mayoria_edad:true`, `aceptacion_condiciones_alcohol:true` | `idioma:Lang` | WO |
| LoginRequest | `email:Email`, `password:Password` | — | WO |
| PasswordRecoveryRequest | `email:Email` | — | WO |
| PasswordResetRequest | `token:RecoveryToken`, `password_nueva:Password`, `confirmacion_password:Password` | — | WO; passwords idénticos |
| UsuarioSesion | `id:UUID`, `email:Email`, `rol:Role`, `idioma:Lang`, `estado:UserState` | `nombre:Text100`, `apellidos:Text100`, `bodega_id:UUID` | RO; bodega_id solo para rol bodega |
| AuthSession | `access_token:string(43)`, `token_type:"Bearer"`, `expires_in:28800`, `expires_at:DateTime`, `usuario:UsuarioSesion` | — | RO; access_token solo API-001/002 |

## Bodegas

| Schema | Campos requeridos | Campos opcionales | Flags y reglas |
|---|---|---|---|
| BodegaRegistrationRequest | `nombre_comercial:Text160`, `razon_social:Text200`, `cif_vat:Text32`, `email:Email`, `password:Password`, `persona_contacto:Text100`, `telefono:Text32`, `aceptacion_condiciones:true` | `pais_contacto:Text100`, `ciudad:Text100`, `codigo_postal:string(1..20)` | WO |
| BodegaProfilePatch | al menos uno de los campos opcionales | `nombre_comercial:Text160`, `historia:Text5000`, `filosofia:Text5000`, `region:Text160`, `pais:Text100`, `denominacion_origen:Text160`, `anio_fundacion:Year`, `web:URI`, `video_url:URI`, `email_principal:Email`, `telefono:Text32`, `persona_contacto:Text100`, `logo_url:URI`, `imagen_principal_url:URI` | WO |
| BodegaSummary | `id:UUID`, `nombre_comercial:Text160` | `slug:Text160`, `logo_url:URI`, `region:Text160`, `pais:Text100`, `denominacion_origen:Text160` | RO |
| BodegaPublic | `id:UUID`, `nombre_comercial:Text160`, `vinos:WineSummary[]` | `slug:Text160`, `logo_url:URI`, `imagen_principal_url:URI`, `historia:Text5000`, `filosofia:Text5000`, `region:Text160`, `pais:Text100`, `denominacion_origen:Text160`, `anio_fundacion:Year`, `web:URI`, `video_url:URI` | RO; solo vinos publicados/disponibles |
| BodegaSelf | `id:UUID`, `nombre_comercial:Text160`, `estado:WineryState`, `created_at:DateTime`, `updated_at:DateTime` | `slug:Text160`, `logo_url:URI`, `imagen_principal_url:URI`, `historia:Text5000`, `filosofia:Text5000`, `region:Text160`, `pais:Text100`, `denominacion_origen:Text160`, `anio_fundacion:Year`, `web:URI`, `video_url:URI`, `razon_social:Text200`, `cif_vat:Text32`, `email_principal:Email`, `telefono:Text32`, `persona_contacto:Text100`, `direccion_fisica:Text200`, `codigo_postal:string(1..20)`, `ciudad:Text100`, `provincia:Text100`, `pais_contacto:Text100` | RO |
| BodegaAdminSummary | `id:UUID`, `nombre_comercial:Text160`, `estado:WineryState`, `created_at:DateTime` | `razon_social:Text200`, `cif_vat:Text32`, `pais_contacto:Text100` | RO |
| BodegaAdmin | campos de BodegaSelf | `fecha_alta:DateTime`, `fecha_aprobacion:DateTime` | RO; nunca comisión, documentación/verificación interna, credenciales, IDs de aprobador ni auditoría |
| PageBodegaAdminSummary | `items:BodegaAdminSummary[]` y campos PageMeta | — | RO |

## Vinos e imágenes

| Schema | Campos requeridos | Campos opcionales | Flags y reglas |
|---|---|---|---|
| WineCreateRequest | `nombre_comercial:Text160`, `precio:PositiveMoney`, `moneda:Currency`, `stock_disponible:Stock`, `disponible_venta:boolean` | `sku:Text100`, `tipo_vino:Text80`, `anada:Year`, `pais:Text100`, `region:Text160`, `denominacion_origen:Text160`, `variedades_uva:Text100[]`, `crianza:Text100`, `meses_crianza:integer(0..120)`, `graduacion_alcoholica:Percent`, `volumen_ml:integer(1..10000)`, `descripcion_corta:Text500`, `descripcion_completa:Text5000`, `nota_cata:Text5000`, `maridaje:Text5000`, `temperatura_servicio:Text100`, `certificaciones:Text100[]`, `premios:Text100[]`, `produccion_limitada:boolean`, `peso_gramos:integer(1..100000)`, `plazo_preparacion_dias:integer(0..365)`, `botellas_por_caja:integer(1..100)` | WO |
| WineUpdateRequest | `nombre_comercial:Text160`, `precio:PositiveMoney`, `moneda:Currency`, `stock_disponible:Stock`, `disponible_venta:boolean` | los mismos opcionales de WineCreateRequest | WO; reemplazo PUT: todo opcional omitido se restablece a NULL/default de persistencia y nunca conserva el valor anterior; sin id, bodega_id, estado ni timestamps |
| WineSummary | `id:UUID`, `nombre_comercial:Text160`, `precio:Money`, `moneda:Currency`, `disponible_venta:boolean`, `bodega:BodegaSummary` | `slug:Text160`, `tipo_vino:Text80`, `anada:Year`, `region:Text160`, `denominacion_origen:Text160`, `imagen_principal:ImageSummary` | RO; sin stock exacto |
| WinePublicDetail | campos de WineSummary, `imagenes:ImageSummary[]` | `pais:Text100`, `variedades_uva:Text100[]`, `crianza:Text100`, `meses_crianza:integer`, `graduacion_alcoholica:Percent`, `volumen_ml:integer`, `descripcion_corta:Text500`, `descripcion_completa:Text5000`, `nota_cata:Text5000`, `maridaje:Text5000`, `temperatura_servicio:Text100`, `certificaciones:Text100[]`, `premios:Text100[]`, `produccion_limitada:boolean` | RO; solo imágenes activas |
| WineOwnSummary | `id:UUID`, `nombre_comercial:Text160`, `estado:WineState`, `stock_disponible:Stock`, `disponible_venta:boolean`, `updated_at:DateTime` | `sku:Text100`, `precio:Money`, `moneda:Currency`, `imagen_principal:ImageSummary` | RO |
| WineOwnDetail | campos de WinePublicDetail, `estado:WineState`, `stock_disponible:Stock`, `stock_reservado:Stock`, `stock_minimo:Stock`, `created_at:DateTime`, `updated_at:DateTime` | `sku:Text100`, `peso_gramos:integer`, `plazo_preparacion_dias:integer`, `botellas_por_caja:integer` | RO |
| WineAdminSummary | `id:UUID`, `nombre_comercial:Text160`, `estado:WineState`, `bodega:BodegaAdminSummary`, `updated_at:DateTime` | `precio:Money`, `moneda:Currency`, `imagen_principal:ImageSummary` | RO |
| WineAdminDetail | campos de WineOwnDetail excepto `bodega`, más una única propiedad requerida `bodega:BodegaAdminSummary` | — | RO; sustitución explícita, sin colisión con BodegaSummary |
| PageWineSummary | `items:WineSummary[]` y campos PageMeta | — | RO |
| PageWineOwnSummary | `items:WineOwnSummary[]` y campos PageMeta | — | RO |
| PageWineAdminSummary | `items:WineAdminSummary[]` y campos PageMeta | — | RO |
| ImageSummary | `id:UUID`, `url:URI`, `es_principal:boolean`, `orden:integer>=0`, `alt_text:Text500` | `resolucion:Text32` | RO |
| Image | campos de ImageSummary, `formato:enum(jpeg,png,webp)`, `activa:boolean`, `fecha_subida:DateTime`, `updated_at:DateTime` | `nombre_archivo:Text200`, `tamanio_bytes:integer(1..10485760)`, `resolucion:Text32` | RO; URL CDN, nunca storage key |
| UploadRequest | `upload_id:UUID`, `nombre_archivo:Text200`, `content_type:enum(image/jpeg,image/png,image/webp)`, `tamanio_bytes:integer(1..10485760)`, `checksum_sha256:string(base64,44)` | — | WO |
| RequiredUploadHeaders | `Content-Type:enum(image/jpeg,image/png,image/webp)`, `x-amz-checksum-sha256:string(base64,44)`, `If-None-Match:"*"` | — | RO; Content-Type y checksum coinciden exactamente con UploadRequest y claims del token |
| UploadAuthorization | `upload_id:UUID`, `upload_url:URI`, `method:"PUT"`, `required_headers:RequiredUploadHeaders`, `confirmation_token:ConfirmationToken`, `upload_expires_at:DateTime`, `confirmation_expires_at:DateTime` | — | RO |
| ImageConfirmRequest | `upload_id:UUID`, `confirmation_token:ConfirmationToken`, `alt_text:Text500` | `orden:integer(0..999)`, `es_principal:boolean` | WO |
| ImagePatchRequest | al menos uno | `alt_text:Text500`, `orden:integer(0..999)`, `es_principal:boolean` | WO |

Para API-034/API-025, vino completo significa: nombre, precio positivo, EUR, stock_disponible > 0, disponible_venta=true y al menos una Image activa con alt_text. No se vuelven obligatorios otros campos opcionales del modelo.

## Carrito

| Schema | Campos requeridos | Campos opcionales | Flags y reglas |
|---|---|---|---|
| CartAddRequest | `vino_id:UUID`, `cantidad:Quantity` | — | WO; excluyente con CartMergeRequest |
| LocalCartItem | `vino_id:UUID`, `cantidad_local:Quantity` | — | WO |
| CartMergeRequest | `fusion_id:UUID`, `items:LocalCartItem[1..100]` | — | WO; vino_id único |
| QuantityPatchRequest | `cantidad:Quantity` | — | WO |
| CartItem | `id:UUID`, `vino:WineSummary`, `cantidad:Quantity`, `precio_unitario:Money`, `importe_total:Money`, `estado:CartItemState` | — | RO |
| Cart | `id:UUID`, `estado:CartState`, `items:CartItem[]`, `num_productos:integer>=0`, `num_botellas:integer>=0`, `subtotal:Money`, `gastos_envio:Money`, `descuentos:Money`, `total:Money`, `moneda:Currency`, `updated_at:DateTime` | — | RO |
| FusionLine | `vino_id:UUID`, `estado:enum(fusionada,limitada,descartada)` | `cantidad_resultante:Stock`, `motivo:Text160` | RO |
| CartMutationResponse | `carrito:Cart` | `fusion: FusionLine[]` | RO; fusion solo modo fusión |

## Direcciones

| Schema | Campos requeridos | Campos opcionales | Flags y reglas |
|---|---|---|---|
| AddressCreateRequest | `uso:enum(envio,facturacion,ambos)`, `nombre_destinatario:Text160`, `direccion:Text200`, `codigo_postal:string(1..20)`, `ciudad:Text100`, `pais:Text100` | `nombre_identificativo:Text100`, `empresa:Text160`, `direccion_adicional:Text200`, `provincia:Text100`, `persona_contacto:Text100`, `telefono:Text32`, `email:Email`, `es_principal:boolean` | WO; uso se mapea internamente a es_envio/es_facturacion |
| AddressPatchRequest | al menos uno | todos los campos de AddressCreateRequest | WO |
| Address | `id:UUID`, `uso:enum(envio,facturacion,ambos)`, `nombre_destinatario:Text160`, `direccion:Text200`, `codigo_postal:string(1..20)`, `ciudad:Text100`, `pais:Text100`, `es_principal:boolean`, `activa:boolean`, `created_at:DateTime`, `updated_at:DateTime` | `nombre_identificativo:Text100`, `empresa:Text160`, `direccion_adicional:Text200`, `provincia:Text100`, `persona_contacto:Text100`, `telefono:Text32`, `email:Email` | RO; nunca propietario_tipo/id |
| AddressSnapshot | `nombre_destinatario:Text160`, `direccion:Text200`, `codigo_postal:string`, `ciudad:Text100`, `pais:Text100` | `empresa:Text160`, `direccion_adicional:Text200`, `provincia:Text100`, `persona_contacto:Text100`, `telefono:Text32`, `email:Email` | RO; inmutable |

## Pedidos, pagos y SubPedidos

| Schema | Campos requeridos | Campos opcionales | Flags y reglas |
|---|---|---|---|
| CheckoutRequest | `direccion_envio_id:UUID`, `direccion_facturacion_id:UUID` | — | WO |
| CheckoutSessionRequest | `pedido_id:UUID` | — | WO |
| OrderLine | `id:UUID`, `vino_id:UUID`, `nombre_vino:Text160`, `bodega:Text160`, `precio_unitario:Money`, `cantidad:Quantity`, `importe_total:Money` | `anada:Year` | RO; snapshots |
| OrderPrepared | `id:UUID`, `numero_pedido:Text100`, `estado:"pendiente_pago"`, `totales:MoneyBreakdown`, `direccion_envio_snapshot:AddressSnapshot`, `direccion_facturacion_snapshot:AddressSnapshot` | — | RO |
| CheckoutSession | `pedido_id:UUID`, `checkout_url:URI`, `session_expires_at:DateTime`, `reused:boolean` | — | RO |
| OrderConfirmation | `pedido_id:UUID`, `numero_pedido:Text100`, `pago_estado:PaymentState`, `pedido_estado:OrderState` | `confirmado_at:DateTime` | RO |
| OrderSummary | `id:UUID`, `numero_pedido:Text100`, `estado:OrderState`, `total:Money`, `moneda:Currency`, `created_at:DateTime` | — | RO |
| OrderBuyerDetail | campos OrderSummary, `totales:MoneyBreakdown`, `direccion_envio_snapshot:AddressSnapshot`, `direccion_facturacion_snapshot:AddressSnapshot`, `lineas:OrderLine[]` | — | RO; sin Stripe ni SubPedidos como unidad funcional |
| PageOrderSummary | `items:OrderSummary[]` y campos PageMeta | — | RO |
| SubOrderStatePatch | `estado_destino:SubOrderState` | — | WO |
| Tracking | — | `transportista:Text100`, `numero_seguimiento:Text100`, `fecha_preparacion:DateTime`, `fecha_envio:DateTime`, `fecha_entrega_prevista:DateTime`, `fecha_entrega_real:DateTime` | RO |
| SubOrderSummary | `id:UUID`, `pedido_id:UUID`, `estado:SubOrderState`, `total:Money`, `moneda:Currency`, `fecha_ultimo_cambio_estado:DateTime` | — | RO |
| SubOrderDetail | campos SubOrderSummary, `totales:SubOrderMoneyBreakdown`, `lineas:OrderLine[]`, `direccion_envio_snapshot:AddressSnapshot`, `tracking:Tracking` | `pedido_estado:OrderState` | RO |
| PageSubOrderSummary | `items:SubOrderSummary[]` y campos PageMeta | — | RO |
| OrderAdminDetail | campos OrderBuyerDetail, `subpedidos:SubOrderDetail[]` | `comprador_id:UUID` | RO |
| Dashboard | `ventas_dia:DashboardSales`, `pedidos_pendientes:integer>=0` | — | RO |
| DashboardSales | `importe:Money`, `moneda:Currency`, `num_pedidos:integer>=0` | — | RO |
| WebhookAck | `event_id:Text200`, `status:enum(processed,duplicate,ignored)` | `pedido_id:UUID`, `pago_estado:PaymentState`, `pedido_estado:OrderState` | RO |

## Incidencias

| Schema | Campos requeridos | Campos opcionales | Flags y reglas |
|---|---|---|---|
| IncidentStatePatch | `estado_destino:IncidentState` | — | WO |
| RelatedResource | `tipo:enum(pedido,subpedido,bodega,vino)`, `id:UUID` | — | RO |
| IncidentSummary | `id:UUID`, `tipo:Text100`, `estado:IncidentState`, `fecha:DateTime`, `recurso_relacionado:RelatedResource` | — | RO |
| IncidentDetail | campos IncidentSummary, `descripcion:Text5000`, `updated_at:DateTime` | — | RO; no incluye auditoría |
| PageIncidentSummary | `items:IncidentSummary[]` y campos PageMeta | — | RO |

## Parámetros query/path

| Schema | Campos |
|---|---|
| CatalogQuery | `q?:string(1..120)`, `tipo_vino?:Text80`, `region?:Text160`, `denominacion_origen?:Text160`, `precio_min?:Money`, `precio_max?:Money`, `page:Page=1`, `page_size:PageSize=20` |
| OwnWineQuery | `estado?:WineState`, `page:Page=1`, `page_size:PageSize=20` |
| AdminWineryQuery | `estado:const(pendiente)`, `page:Page=1`, `page_size:PageSize=20`; el alias wire pendiente se mapea internamente a estado_bodega pendiente_revision |
| AdminWineQuery | `estado:"pendiente_revision"`, `page:Page=1`, `page_size:PageSize=20` |
| AdminIncidentQuery | `estado?:IncidentState`, `page:Page=1`, `page_size:PageSize=20` |
| AddressQuery | `uso?:enum(envio,facturacion,ambos)` |
| PageQuery | `page:Page=1`, `page_size:PageSize=20` |
| ResourceIdPath | `id:UUID`; nombres específicos `pedido_id`/`imagen_id` también UUID |

## Mapeo normativo API-001→050

Todos los errores usan Problem. La columna errores enumera los status permitidos además del éxito.

| API | Request / parámetros | Éxito | Errores |
|---|---|---|---|
| 001 | RegisterBuyerRequest | 201 AuthSession | 400,409,500 |
| 002 | LoginRequest | 200 AuthSession | 400,401,403,429,500 |
| 003 | PasswordRecoveryRequest | 200 GenericAck | 400,429,500 |
| 004 | PasswordResetRequest | 200 GenericAck | 400,404,409,500 |
| 005 | BodegaRegistrationRequest | 201 BodegaSelf | 400,409,500 |
| 006 | BodegaProfilePatch | 200 BodegaSelf | 400,401,403,409,500 |
| 007 | WineCreateRequest | 201 WineOwnDetail | 400,401,403,409,500 |
| 008 | ResourceIdPath + WineUpdateRequest | 200 WineOwnDetail | 400,401,403,404,409,500 |
| 009 | CatalogQuery | 200 PageWineSummary | 400,500 |
| 010 | ResourceIdPath | 200 WinePublicDetail | 404,500 |
| 011 | CartAddRequest oneOf CartMergeRequest | 200 CartMutationResponse | 400,401,404,409,500 |
| 012 | — | 200 Cart | 401,404,500 |
| 013 | ResourceIdPath + QuantityPatchRequest | 200 Cart | 400,401,404,409,500 |
| 014 | ResourceIdPath | 200 Cart | 401,404,500 |
| 015 | — | 200 Cart | 401,500 |
| 016 | CheckoutRequest | 200 OrderPrepared | 400,401,403,404,409,500 |
| 017 | CheckoutSessionRequest | 200 CheckoutSession | 400,401,404,409,502,503 |
| 018 | pedido_id path | 200 OrderConfirmation | 401,404,500 |
| 019 | PageQuery | 200 PageOrderSummary | 400,401,500 |
| 020 | ResourceIdPath | 200 OrderBuyerDetail | 401,403,404,500 |
| 021 | PageQuery | 200 PageSubOrderSummary | 400,401,403,500 |
| 022 | ResourceIdPath | 200 SubOrderDetail | 401,403,404,500 |
| 023 | ResourceIdPath + SubOrderStatePatch | 200 SubOrderDetail | 400,401,403,404,409,500 |
| 024 | ResourceIdPath | 200 BodegaAdmin | 400,401,403,404,409,500 |
| 025 | ResourceIdPath | 200 WineAdminDetail | 400,401,403,404,409,500 |
| 026 | ResourceIdPath | 200 WineAdminDetail | 401,403,404,409,500 |
| 027 | PageQuery | 200 PageOrderSummary | 400,401,403,500 |
| 028 | — | 200 Dashboard | 401,403,500 |
| 029 | raw Stripe body + Stripe-Signature | 200 WebhookAck | 400,404,409,422,500 |
| 030 | ResourceIdPath | 200 BodegaPublic | 404,500 |
| 031 | — | 200 BodegaSelf | 401,403,404,500 |
| 032 | OwnWineQuery | 200 PageWineOwnSummary | 400,401,403,500 |
| 033 | ResourceIdPath | 200 WineOwnDetail | 401,403,404,500 |
| 034 | ResourceIdPath | 200 WineOwnDetail | 400,401,403,404,409,500 |
| 035 | AdminWineryQuery | 200 PageBodegaAdminSummary | 400,401,403,500 |
| 036 | ResourceIdPath | 200 BodegaAdmin | 401,403,404,500 |
| 037 | AdminWineQuery | 200 PageWineAdminSummary | 400,401,403,500 |
| 038 | ResourceIdPath | 200 WineAdminDetail | 401,403,404,500 |
| 039 | ResourceIdPath | 200 OrderAdminDetail | 401,403,404,500 |
| 040 | AdminIncidentQuery | 200 PageIncidentSummary | 400,401,403,500 |
| 041 | ResourceIdPath | 200 IncidentDetail | 401,403,404,500 |
| 042 | ResourceIdPath + IncidentStatePatch | 200 IncidentDetail | 400,401,403,404,409,500 |
| 043 | Idempotency-Key UUID + AddressCreateRequest | 201/200 Address | 400,401,403,409,500 |
| 044 | AddressQuery | 200 Address[] | 400,401,403,500 |
| 045 | ResourceIdPath + AddressPatchRequest | 200 Address | 400,401,403,404,409,500 |
| 046 | ResourceIdPath | 204 vacío | 401,403,404,409,500 |
| 047 | vino id path + UploadRequest | 200 UploadAuthorization | 400,401,403,404,409,500 |
| 048 | vino id path + ImageConfirmRequest | 201/200 Image | 400,401,403,404,409,410,500 |
| 049 | vino/imagen id path + ImagePatchRequest | 200 Image | 400,401,403,404,409,500 |
| 050 | vino/imagen id path | 204 vacío | 401,403,404,409,500 |

## Cierre

INF-10-A v1.0 queda **APROBADO POR EL CTO** tras doble dictamen APROBABLE. No queda ningún campo, tipo, obligatoriedad, nullability, límite, proyección ni mapeo de operación delegado al futuro YAML. El YAML deberá materializar literalmente este catálogo y no podrá añadir propiedades.
