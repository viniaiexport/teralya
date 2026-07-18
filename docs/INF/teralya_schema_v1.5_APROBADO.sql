-- =====================================================================
-- TERALYA — Esquema de Base de Datos (INF-05)
-- PostgreSQL · Versión 1.5 · Julio 2026 · Estado: APROBADO POR EL CTO
-- Autor: Claude · Basado en: Capítulo 1 - Entidades del MVP
-- Evolución v1.5: conserva las garantías de v1.4 y añade las condiciones
--   de envío configurables por bodega y el ledger cancelacion_pedido para
--   la cancelación contractual idempotente, sin ampliar el alcance del MVP.
-- Decisión CTO aplicada: Usuario Base + Usuario fusionados en "usuario".
--   Comprador = extensión 1:1. Bodega = entidad independiente, 1:N con
--   usuario. Administrador = rol, sin tabla propia.
-- =====================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
CREATE TYPE rol_usuario           AS ENUM ('comprador', 'bodega', 'administrador');
CREATE TYPE estado_usuario        AS ENUM ('pendiente_verificacion', 'activo', 'suspendido', 'bloqueado', 'eliminado');
CREATE TYPE estado_bodega         AS ENUM ('borrador', 'pendiente_revision', 'aprobada', 'activa', 'suspendida', 'archivada');
CREATE TYPE tipo_bodega           AS ENUM ('fundadora', 'estandar');
CREATE TYPE estado_vino           AS ENUM ('borrador', 'pendiente_revision', 'publicado', 'oculto', 'archivado');
CREATE TYPE tipo_entidad_imagen   AS ENUM ('vino', 'bodega');
CREATE TYPE tipo_propietario_dir  AS ENUM ('comprador', 'bodega');
CREATE TYPE estado_carrito        AS ENUM ('activo', 'convertido', 'abandonado', 'cancelado');
CREATE TYPE estado_carrito_item   AS ENUM ('disponible', 'sin_stock', 'descatalogado', 'precio_modificado');
CREATE TYPE estado_pedido         AS ENUM ('pendiente_pago', 'pagado', 'en_preparacion', 'parcialmente_enviado', 'enviado', 'entregado', 'cancelado', 'devuelto');
CREATE TYPE estado_pedido_item    AS ENUM ('normal', 'cancelado', 'devuelto');
CREATE TYPE estado_subpedido      AS ENUM ('pendiente', 'aceptado', 'en_preparacion', 'enviado', 'entregado', 'cancelado', 'incidencia');
CREATE TYPE estado_pago           AS ENUM ('pendiente', 'autorizado', 'pagado', 'parcialmente_reembolsado', 'reembolsado', 'fallido', 'cancelado');
CREATE TYPE estado_cuenta_stripe  AS ENUM ('no_iniciada', 'pendiente', 'en_revision', 'activa', 'restringida', 'suspendida');
CREATE TYPE canal_notificacion    AS ENUM ('email');
CREATE TYPE estado_notificacion   AS ENUM ('pendiente', 'enviada', 'entregada', 'fallida', 'cancelada');
CREATE TYPE resultado_auditoria   AS ENUM ('correcto', 'error');
CREATE TYPE estado_solicitud_recuperacion AS ENUM ('pendiente', 'utilizada', 'expirada', 'cancelada');
CREATE TYPE estado_incidencia      AS ENUM ('abierta', 'en_revision', 'resuelta', 'cerrada');
CREATE TYPE estado_cancelacion_pedido AS ENUM ('procesando', 'completada', 'fallida');

-- ---------------------------------------------------------------------
-- 1. BODEGA  (independiente; se crea antes de usuario por la FK 1:N)
-- Objetivo: empresa productora de vino que vende en el marketplace;
--   propietaria del catálogo, responsable de stock y preparación.
-- Relaciones: 1:N con usuario (personal de la bodega) · 1:N con vino ·
--   1:1 con cuenta_stripe_connect · 1:N con subpedido.
-- Reglas de negocio: debe estar aprobada antes de publicar vinos; no
--   puede eliminarse si tiene vinos publicados o pedidos asociados;
--   la comisión debe quedar registrada antes de la activación.
-- ---------------------------------------------------------------------
CREATE TABLE bodega (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_comercial        TEXT NOT NULL,
    razon_social            TEXT,
    cif_vat                 TEXT,
    estado                  estado_bodega NOT NULL DEFAULT 'borrador',

    -- Perfil público
    logo_url                TEXT,
    imagen_principal_url    TEXT,
    historia                TEXT,
    filosofia               TEXT,
    region                  TEXT,
    pais                    TEXT,
    denominacion_origen     TEXT,
    anio_fundacion          INTEGER,
    web                     TEXT,
    video_url               TEXT,

    -- Contacto
    email_principal         TEXT,
    telefono                TEXT,
    persona_contacto        TEXT,
    direccion_fisica        TEXT,
    codigo_postal           TEXT,
    ciudad                  TEXT,
    provincia               TEXT,
    pais_contacto           TEXT,

    -- Comercial
    comision                NUMERIC(5,2),
    tipo                    tipo_bodega DEFAULT 'estandar',
    condiciones_preferentes TEXT,
    fecha_alta              TIMESTAMPTZ,
    fecha_aprobacion         TIMESTAMPTZ,
    idioma_principal         TEXT,

    -- Operativa
    plazo_preparacion_dias      INTEGER,
    plazo_entrega_estimado      TEXT,
    paises_envio                TEXT[],
    coste_envio_descripcion     TEXT,
    transportista_habitual      TEXT,
    restricciones_entrega       TEXT,
    condiciones_empaquetado     TEXT,
    observaciones_logisticas    TEXT,
    capacidad_internacional     BOOLEAN DEFAULT FALSE,

    -- Verificación
    verificacion_estado      TEXT,
    documentacion_recibida   TEXT,
    documentacion_pendiente  TEXT,
    aprobada_por             UUID,  -- FK a usuario (administrador), se añade tras crear tabla usuario
    fecha_verificacion       TIMESTAMPTZ,

    -- SEO
    slug                     TEXT UNIQUE,
    meta_titulo              TEXT,
    meta_descripcion         TEXT,

    -- Auditoría
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by                UUID,  -- FK a usuario, se añade después

    CONSTRAINT chk_bodega_comision CHECK (comision IS NULL OR comision BETWEEN 0 AND 100),
    CONSTRAINT chk_bodega_plazo_preparacion CHECK (plazo_preparacion_dias IS NULL OR plazo_preparacion_dias >= 0),
    CONSTRAINT chk_bodega_comision_para_operar CHECK (estado NOT IN ('aprobada', 'activa') OR comision IS NOT NULL)
);

-- ---------------------------------------------------------------------
-- 2. USUARIO  (fusión de Usuario Base + Usuario, según decisión CTO)
-- Objetivo: identidad única de cualquier persona con acceso a la
--   plataforma — comprador, personal de bodega o administrador.
-- Relaciones: N:1 opcional con bodega (solo si rol='bodega') · 1:1
--   opcional con comprador (vía tabla comprador).
-- Reglas de negocio: el email debe ser único; la contraseña nunca se
--   almacena en texto plano; bodega_id solo puede rellenarse si
--   rol = 'bodega' (constraint chk_bodega_solo_si_rol_bodega).
-- ---------------------------------------------------------------------
CREATE TABLE usuario (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                       TEXT NOT NULL UNIQUE,
    password_hash               TEXT NOT NULL,
    nombre                      TEXT,
    apellidos                   TEXT,
    telefono                    TEXT,
    idioma                      TEXT DEFAULT 'es',
    zona_horaria                TEXT DEFAULT 'Europe/Madrid',

    rol                         rol_usuario NOT NULL,
    bodega_id                   UUID REFERENCES bodega(id),  -- solo si rol = 'bodega'; 1:N bodega→usuario

    estado                      estado_usuario NOT NULL DEFAULT 'pendiente_verificacion',
    email_verificado             BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_ultimo_acceso           TIMESTAMPTZ,
    fecha_ultimo_cambio_password  TIMESTAMPTZ,

    -- Seguridad
    intentos_fallidos            INTEGER NOT NULL DEFAULT 0,
    cuenta_bloqueada              BOOLEAN NOT NULL DEFAULT FALSE,
    doble_factor_activo            BOOLEAN NOT NULL DEFAULT FALSE,  -- futuro

    created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_bodega_segun_rol CHECK (
        (rol = 'bodega' AND bodega_id IS NOT NULL) OR
        (rol IN ('comprador', 'administrador') AND bodega_id IS NULL)
    ),
    CONSTRAINT chk_usuario_intentos_fallidos CHECK (intentos_fallidos >= 0)
);

CREATE INDEX idx_usuario_bodega_id ON usuario(bodega_id);
CREATE INDEX idx_usuario_rol ON usuario(rol);

-- ---------------------------------------------------------------------
-- 2A. SOLICITUD_RECUPERACION_PASSWORD
-- Objetivo: conservar de forma segura y trazable las solicitudes de
--   recuperación de acceso asociadas a una cuenta de usuario.
-- ---------------------------------------------------------------------
CREATE TABLE solicitud_recuperacion_password (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id  UUID NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,
    estado      estado_solicitud_recuperacion NOT NULL DEFAULT 'pendiente',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,

    CONSTRAINT chk_recuperacion_expira_despues CHECK (expires_at > created_at),
    CONSTRAINT chk_recuperacion_uso_despues CHECK (used_at IS NULL OR used_at >= created_at),
    CONSTRAINT chk_recuperacion_estado_uso CHECK ((estado = 'utilizada') = (used_at IS NOT NULL))
);

CREATE INDEX idx_solicitud_recuperacion_usuario_id
    ON solicitud_recuperacion_password(usuario_id);
CREATE INDEX idx_solicitud_recuperacion_estado_expires
    ON solicitud_recuperacion_password(estado, expires_at);

-- FKs diferidas de bodega hacia usuario (ciclo resuelto)
ALTER TABLE bodega ADD CONSTRAINT fk_bodega_aprobada_por FOREIGN KEY (aprobada_por) REFERENCES usuario(id);
ALTER TABLE bodega ADD CONSTRAINT fk_bodega_updated_by   FOREIGN KEY (updated_by)   REFERENCES usuario(id);

-- ---------------------------------------------------------------------
-- 3. COMPRADOR  (extensión 1:1 de usuario, según decisión CTO)
-- Objetivo: datos comerciales del cliente que compra vino; amplía a
--   usuario con lo necesario para comprar y gestionar su historial.
-- Relaciones: 1:1 con usuario · 1:N con carrito, pedido y direccion.
-- Reglas de negocio: todo comprador requiere un usuario previo; los
--   contadores (num_total_pedidos, importe_total_comprado) son
--   denormalizados y se recalculan por trigger/job — no son la fuente
--   de verdad, esa es la tabla pedido.
-- ---------------------------------------------------------------------
CREATE TABLE comprador (
    usuario_id                UUID PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    fecha_nacimiento           DATE NOT NULL,
    declaracion_mayoria_edad    BOOLEAN NOT NULL DEFAULT FALSE,
    declaracion_mayoria_edad_at TIMESTAMPTZ,
    aceptacion_condiciones_alcohol    BOOLEAN NOT NULL DEFAULT FALSE,
    aceptacion_condiciones_alcohol_at TIMESTAMPTZ,
    version_condiciones_alcohol       TEXT,
    acepta_comunicaciones       BOOLEAN NOT NULL DEFAULT FALSE,
    moneda_preferida            TEXT DEFAULT 'EUR',
    pais_compra_habitual         TEXT,

    -- Contadores denormalizados (se recalculan por trigger/job, no fuente de verdad)
    num_total_pedidos            INTEGER NOT NULL DEFAULT 0,
    importe_total_comprado        NUMERIC(12,2) NOT NULL DEFAULT 0,
    fecha_primer_pedido            TIMESTAMPTZ,
    fecha_ultimo_pedido             TIMESTAMPTZ,

    created_at                     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_comprador_contadores CHECK (
        num_total_pedidos >= 0 AND importe_total_comprado >= 0
    )
);

-- ---------------------------------------------------------------------
-- 4. CUENTA_STRIPE_CONNECT  (1:1 con bodega)
-- Objetivo: vincula una bodega con Stripe Connect para poder recibir
--   pagos de forma segura y automática.
-- Relaciones: 1:1 con bodega · referenciada indirectamente por pago a
--   través de subpedido → bodega → cuenta_stripe_connect (no hay FK
--   directa desde pago; ver nota en la tabla pago).
-- Reglas de negocio: una bodega no puede vender sin cuenta activa; no
--   se almacenan datos bancarios sensibles en el marketplace; el
--   estado se sincroniza desde la información oficial de Stripe.
-- ---------------------------------------------------------------------
CREATE TABLE cuenta_stripe_connect (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bodega_id              UUID NOT NULL UNIQUE REFERENCES bodega(id),
    stripe_account_id      TEXT NOT NULL UNIQUE,

    estado_cuenta          estado_cuenta_stripe NOT NULL DEFAULT 'no_iniciada',
    cuenta_verificada       BOOLEAN NOT NULL DEFAULT FALSE,
    cargos_habilitados      BOOLEAN NOT NULL DEFAULT FALSE,
    cobros_habilitados      BOOLEAN NOT NULL DEFAULT FALSE,

    pais                   TEXT,
    moneda                 TEXT DEFAULT 'EUR',
    tipo_cuenta             TEXT,
    fecha_vinculacion        TIMESTAMPTZ,

    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    ultima_sincronizacion      TIMESTAMPTZ
);

-- ---------------------------------------------------------------------
-- 5. VINO
-- Objetivo: producto comercializado por una única bodega; contiene
--   toda la información necesaria para mostrarlo, venderlo y
--   gestionarlo dentro del marketplace.
-- Relaciones: N:1 con bodega · 1:N con imagen (vía polimórfica) · 1:N
--   con carrito_item y pedido_item.
-- Reglas de negocio: no puede publicarse sin precio, sin stock o sin
--   al menos una imagen; el stock nunca puede ser negativo (constraint
--   chk_stock_no_negativo); no puede eliminarse si forma parte de un
--   pedido.
-- ---------------------------------------------------------------------
CREATE TABLE vino (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bodega_id             UUID NOT NULL REFERENCES bodega(id),
    sku                   TEXT,
    estado                estado_vino NOT NULL DEFAULT 'borrador',

    nombre_comercial       TEXT NOT NULL,
    tipo_vino               TEXT,
    anada                  INTEGER,
    precio                  NUMERIC(10,2),
    moneda                  TEXT DEFAULT 'EUR',

    pais                   TEXT,
    region                 TEXT,
    denominacion_origen     TEXT,
    subzona                 TEXT,

    variedades_uva           TEXT[],
    crianza                  TEXT,
    meses_crianza             INTEGER,
    graduacion_alcoholica      NUMERIC(4,2),
    volumen_ml                 INTEGER,

    descripcion_corta            TEXT,
    descripcion_completa          TEXT,
    nota_cata                     TEXT,
    maridaje                      TEXT,
    temperatura_servicio           TEXT,

    certificaciones                TEXT[],
    premios                        TEXT[],
    produccion_limitada             BOOLEAN DEFAULT FALSE,

    stock_disponible                 INTEGER NOT NULL DEFAULT 0,
    stock_reservado                   INTEGER NOT NULL DEFAULT 0,
    stock_minimo                       INTEGER NOT NULL DEFAULT 0,
    disponible_venta                    BOOLEAN NOT NULL DEFAULT FALSE,

    peso_gramos                          INTEGER,
    dimensiones                           TEXT,
    plazo_preparacion_dias                 INTEGER,
    botellas_por_caja                       INTEGER,

    slug                                    TEXT UNIQUE,
    meta_titulo                              TEXT,
    meta_descripcion                          TEXT,

    created_at                                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_publicacion                            TIMESTAMPTZ,

    CONSTRAINT chk_vino_id_bodega UNIQUE (id, bodega_id),
    CONSTRAINT chk_vino_precio CHECK (precio IS NULL OR precio > 0),
    CONSTRAINT chk_stock_no_negativo CHECK (stock_disponible >= 0 AND stock_reservado >= 0 AND stock_minimo >= 0),
    CONSTRAINT chk_vino_medidas CHECK (
        (volumen_ml IS NULL OR volumen_ml > 0) AND
        (peso_gramos IS NULL OR peso_gramos > 0) AND
        (botellas_por_caja IS NULL OR botellas_por_caja > 0) AND
        (plazo_preparacion_dias IS NULL OR plazo_preparacion_dias >= 0)
    )
);

CREATE INDEX idx_vino_bodega_id ON vino(bodega_id);
CREATE INDEX idx_vino_estado ON vino(estado);

-- ---------------------------------------------------------------------
-- 6. IMAGEN  (polimórfica: vino | bodega)
-- Objetivo: gestiona los recursos gráficos del marketplace, asociados
--   principalmente a vinos y bodegas.
-- Relaciones: polimórfica hacia vino o bodega vía (tipo_entidad,
--   entidad_id); no lleva FK física a cada tabla para evitar duplicar
--   el modelo por cada entidad ilustrable.
-- Reglas de negocio: solo puede existir una imagen principal por
--   entidad (constraint uq_imagen_principal); el texto ALT es
--   obligatorio para SEO; un vino requiere al menos una imagen antes
--   de publicarse (regla aplicada a nivel de aplicación, no de BD).
-- ---------------------------------------------------------------------
CREATE TABLE imagen (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_entidad     tipo_entidad_imagen NOT NULL,
    entidad_id       UUID NOT NULL,

    nombre_archivo   TEXT,
    url              TEXT NOT NULL,
    formato          TEXT,
    tamanio_bytes    INTEGER,
    resolucion       TEXT,

    es_principal     BOOLEAN NOT NULL DEFAULT FALSE,
    orden            INTEGER NOT NULL DEFAULT 0,
    alt_text         TEXT NOT NULL,
    activa           BOOLEAN NOT NULL DEFAULT TRUE,

    fecha_subida      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    subido_por          UUID REFERENCES usuario(id)
);

CREATE INDEX idx_imagen_entidad ON imagen(tipo_entidad, entidad_id);
-- Solo una imagen principal por entidad:
CREATE UNIQUE INDEX uq_imagen_principal ON imagen(tipo_entidad, entidad_id) WHERE es_principal;

-- ---------------------------------------------------------------------
-- 7. DIRECCION  (polimórfica: comprador | bodega)
-- Objetivo: direcciones de envío y facturación reutilizables de
--   compradores y bodegas.
-- Relaciones: polimórfica hacia comprador o bodega vía
--   (propietario_tipo, propietario_id) · referenciada desde pedido,
--   que además guarda una copia congelada (ver tabla pedido).
-- Reglas de negocio: solo puede existir una dirección principal por
--   propietario (constraint uq_direccion_principal); una dirección
--   inactiva no puede seleccionarse en nuevas compras.
-- ---------------------------------------------------------------------
CREATE TABLE direccion (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    propietario_tipo      tipo_propietario_dir NOT NULL,
    propietario_id        UUID NOT NULL,

    nombre_identificativo  TEXT,
    destinatario            TEXT NOT NULL,
    empresa                 TEXT,
    direccion                TEXT NOT NULL,
    direccion_adicional       TEXT,
    codigo_postal              TEXT NOT NULL,
    ciudad                      TEXT NOT NULL,
    provincia                   TEXT,
    pais                         TEXT NOT NULL,

    persona_contacto               TEXT,
    telefono                       TEXT,
    email                           TEXT,

    es_envio                        BOOLEAN NOT NULL DEFAULT TRUE,
    es_facturacion                   BOOLEAN NOT NULL DEFAULT FALSE,
    es_principal                      BOOLEAN NOT NULL DEFAULT FALSE,
    activa                             BOOLEAN NOT NULL DEFAULT TRUE,

    created_at                          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_direccion_propietario ON direccion(propietario_tipo, propietario_id);
CREATE UNIQUE INDEX uq_direccion_principal ON direccion(propietario_tipo, propietario_id) WHERE es_principal;

-- ---------------------------------------------------------------------
-- 8. CARRITO
-- Objetivo: selección temporal de vinos de un comprador antes de
--   confirmar el pedido; puede incluir vinos de varias bodegas.
-- Relaciones: N:1 con comprador · 1:N con carrito_item · da lugar a 1
--   pedido cuando se confirma la compra.
-- Reglas de negocio: un comprador solo puede tener un carrito activo
--   a la vez (constraint uq_carrito_activo_por_comprador); un carrito
--   convertido en pedido deja de poder modificarse.
-- ---------------------------------------------------------------------
CREATE TABLE carrito (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comprador_id        UUID NOT NULL REFERENCES comprador(usuario_id),
    estado              estado_carrito NOT NULL DEFAULT 'activo',

    num_productos        INTEGER NOT NULL DEFAULT 0,
    num_botellas          INTEGER NOT NULL DEFAULT 0,
    subtotal               NUMERIC(10,2) NOT NULL DEFAULT 0,
    gastos_envio            NUMERIC(10,2) NOT NULL DEFAULT 0,
    descuentos               NUMERIC(10,2) NOT NULL DEFAULT 0,
    total                     NUMERIC(10,2) NOT NULL DEFAULT 0,

    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_conversion              TIMESTAMPTZ,

    CONSTRAINT chk_carrito_contadores CHECK (num_productos >= 0 AND num_botellas >= 0),
    CONSTRAINT chk_carrito_importes CHECK (
        subtotal >= 0 AND gastos_envio >= 0 AND descuentos >= 0 AND total >= 0
    ),
    CONSTRAINT chk_carrito_total CHECK (total = subtotal + gastos_envio - descuentos),
    CONSTRAINT uq_carrito_id_comprador UNIQUE (id, comprador_id)
);

-- Un único carrito activo por comprador:
CREATE UNIQUE INDEX uq_carrito_activo_por_comprador ON carrito(comprador_id) WHERE estado = 'activo';

-- ---------------------------------------------------------------------
-- 9. CARRITO_ITEM
-- Objetivo: línea de producto dentro de un carrito de compra.
-- Relaciones: N:1 con carrito · N:1 con vino.
-- Reglas de negocio: un vino solo puede aparecer una vez por carrito
--   (constraint uq_carrito_vino; si se repite, se incrementa cantidad
--   a nivel de aplicación); la cantidad nunca es inferior a una
--   botella (constraint chk_cantidad_minima); el precio se revalida
--   en el checkout, no se da por bueno el guardado en esta tabla.
-- ---------------------------------------------------------------------
CREATE TABLE carrito_item (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carrito_id        UUID NOT NULL REFERENCES carrito(id) ON DELETE CASCADE,
    vino_id           UUID NOT NULL REFERENCES vino(id),

    cantidad           INTEGER NOT NULL DEFAULT 1,
    precio_unitario     NUMERIC(10,2) NOT NULL,
    importe_total        NUMERIC(10,2) NOT NULL,
    estado                estado_carrito_item NOT NULL DEFAULT 'disponible',

    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_cantidad_minima CHECK (cantidad >= 1),
    CONSTRAINT chk_carrito_item_importes CHECK (
        precio_unitario >= 0 AND importe_total >= 0 AND importe_total = precio_unitario * cantidad
    ),
    CONSTRAINT uq_carrito_vino UNIQUE (carrito_id, vino_id)
);

-- ---------------------------------------------------------------------
-- 10. CARRITO_FUSION
-- Objetivo: ledger técnico inmutable que registra cada instantánea local
--   fusionada tras autenticación y su resultado, sin persistir carritos
--   anónimos ni añadir funcionalidad de producto.
-- Relaciones: N:1 con comprador · N:1 con carrito.
-- Reglas: fusion_id es único por comprador; el mismo payload devuelve el
--   resultado guardado y uno distinto con igual clave se rechaza. El
--   servidor calcula SHA-256 hexadecimal sobre JSON canónico con items
--   ordenados por vino_id y cantidades enteras normalizadas. La transacción
--   bloquea el carrito y líneas afectadas antes de leer/calcular/escribir.
-- ---------------------------------------------------------------------
CREATE TABLE carrito_fusion (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comprador_id    UUID NOT NULL REFERENCES comprador(usuario_id),
    carrito_id      UUID NOT NULL,
    fusion_id       UUID NOT NULL,
    payload_hash    TEXT NOT NULL,
    resultado       JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_carrito_fusion_carrito_comprador
        FOREIGN KEY (carrito_id, comprador_id)
        REFERENCES carrito(id, comprador_id),
    CONSTRAINT uq_carrito_fusion_comprador UNIQUE (comprador_id, fusion_id),
    CONSTRAINT chk_carrito_fusion_payload_hash
        CHECK (payload_hash ~ '^[0-9a-f]{64}$'),
    CONSTRAINT chk_carrito_fusion_resultado_objeto CHECK (
        jsonb_typeof(resultado) = 'object' AND
        resultado ->> 'version' = '1' AND
        jsonb_typeof(resultado -> 'carrito') = 'object' AND
        jsonb_typeof(resultado -> 'lineas') = 'array'
    )
);

CREATE INDEX idx_carrito_fusion_carrito_id ON carrito_fusion(carrito_id);

-- ---------------------------------------------------------------------
-- 11. PEDIDO
-- Objetivo: compra confirmada de un comprador; agrupa todos los
--   productos adquiridos, sea cual sea la bodega vendedora.
-- Relaciones: N:1 con comprador · 1:1 con pago · 1:N con subpedido
--   (uno por bodega implicada) · 1:N con pedido_item.
-- Reglas de negocio: numero_pedido debe ser único; un pedido pagado no
--   puede modificarse; las direcciones de envío/facturación quedan
--   congeladas al confirmar (por eso se guarda también el snapshot en
--   JSONB, además de la FK de referencia a direccion).
-- ---------------------------------------------------------------------
CREATE TABLE pedido (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_pedido            TEXT NOT NULL UNIQUE,
    comprador_id             UUID NOT NULL REFERENCES comprador(usuario_id),
    carrito_id               UUID NOT NULL UNIQUE REFERENCES carrito(id),

    subtotal                  NUMERIC(10,2) NOT NULL,
    gastos_envio                NUMERIC(10,2) NOT NULL DEFAULT 0,
    impuestos                    NUMERIC(10,2) NOT NULL DEFAULT 0,
    descuentos                    NUMERIC(10,2) NOT NULL DEFAULT 0,
    total                           NUMERIC(10,2) NOT NULL,

    -- El estado y los datos económicos del pago viven exclusivamente en pago.
    -- Direcciones: FK de referencia + snapshot congelado (la dirección
    -- puede cambiar después; el pedido conserva los datos usados).
    direccion_envio_id                     UUID NOT NULL REFERENCES direccion(id),
    direccion_envio_snapshot                 JSONB NOT NULL,
    direccion_facturacion_id                   UUID NOT NULL REFERENCES direccion(id),
    direccion_facturacion_snapshot               JSONB NOT NULL,

    estado                                        estado_pedido NOT NULL DEFAULT 'pendiente_pago',

    created_at                                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_cierre                                      TIMESTAMPTZ,
    updated_at                                          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_pedido_importes CHECK (
        subtotal >= 0 AND gastos_envio >= 0 AND impuestos >= 0 AND descuentos >= 0 AND total >= 0
    ),
    CONSTRAINT chk_pedido_total CHECK (total = subtotal + gastos_envio + impuestos - descuentos)
);

CREATE INDEX idx_pedido_comprador_id ON pedido(comprador_id);
CREATE INDEX idx_pedido_estado ON pedido(estado);

-- ---------------------------------------------------------------------
-- 12. PAGO  (1:1 con pedido)
-- Objetivo: registra la información económica de una compra, desde la
--   autorización del cobro único hasta el reparto entre bodegas y la
--   comisión del marketplace.
-- Relaciones: 1:1 con pedido · 1:N con subpedido (cada subpedido
--   representa la porción del pago que corresponde a una bodega).
-- Reglas de negocio: un pedido solo puede tener un pago activo; el
--   importe total debe coincidir con el pedido; total_repartido nunca
--   puede superar total_cobrado (constraint
--   chk_reparto_no_supera_cobrado).
-- Nota (Contradicción 2, corregida): NO existe FK directa a
--   cuenta_stripe_connect — un pago puede repartirse entre varias
--   cuentas Stripe, una por bodega. El reparto real se resuelve vía
--   subpedido → bodega → cuenta_stripe_connect.
-- ---------------------------------------------------------------------
CREATE TABLE pago (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id             UUID NOT NULL UNIQUE REFERENCES pedido(id),

    referencia_stripe      TEXT UNIQUE,
    referencia_interna       TEXT,
    stripe_checkout_session_id TEXT UNIQUE,
    stripe_checkout_expires_at TIMESTAMPTZ,

    subtotal                  NUMERIC(10,2) NOT NULL,
    gastos_envio                 NUMERIC(10,2) NOT NULL DEFAULT 0,
    impuestos                      NUMERIC(10,2) NOT NULL DEFAULT 0,
    comision_marketplace              NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_cobrado                       NUMERIC(10,2) NOT NULL,
    total_repartido                       NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_reembolsado                       NUMERIC(10,2) NOT NULL DEFAULT 0,

    metodo_pago                               TEXT,
    moneda                                      TEXT DEFAULT 'EUR',
    estado                                        estado_pago NOT NULL DEFAULT 'pendiente',

    fecha_autorizacion                              TIMESTAMPTZ,
    fecha_captura                                     TIMESTAMPTZ,
    fecha_liquidacion                                   TIMESTAMPTZ,
    fecha_reembolso                                       TIMESTAMPTZ,

    created_at                                              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                                                TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_pago_id_pedido UNIQUE (id, pedido_id),
    CONSTRAINT chk_pago_importes CHECK (
        subtotal >= 0 AND gastos_envio >= 0 AND impuestos >= 0 AND
        comision_marketplace >= 0 AND total_cobrado >= 0 AND
        total_repartido >= 0 AND total_reembolsado >= 0
    ),
    CONSTRAINT chk_reparto_no_supera_cobrado CHECK (total_repartido <= total_cobrado),
    CONSTRAINT chk_reembolso_no_supera_cobrado CHECK (total_reembolsado <= total_cobrado),
    CONSTRAINT chk_checkout_session_coherente CHECK (
        stripe_checkout_session_id IS NULL OR stripe_checkout_expires_at IS NOT NULL
    )
);

-- ---------------------------------------------------------------------
-- 13. EVENTO_WEBHOOK_STRIPE
-- Ledger técnico mínimo para garantizar la idempotencia de API-029.
-- No añade funcionalidad de producto.
-- ---------------------------------------------------------------------
CREATE TABLE evento_webhook_stripe (
    stripe_event_id TEXT PRIMARY KEY,
    tipo_evento     TEXT NOT NULL,
    pago_id         UUID REFERENCES pago(id),
    recibido_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    procesado_at    TIMESTAMPTZ,
    resultado       resultado_auditoria NOT NULL DEFAULT 'correcto',

    CONSTRAINT chk_webhook_tipo_no_vacio CHECK (btrim(tipo_evento) <> ''),
    CONSTRAINT chk_webhook_procesado CHECK (procesado_at IS NULL OR procesado_at >= recibido_at)
);

CREATE INDEX idx_webhook_stripe_pago_id ON evento_webhook_stripe(pago_id);


-- ---------------------------------------------------------------------
-- 13A. CANCELACION_PEDIDO
-- Ledger único por Pedido para coordinar la cancelación contractual,
-- el reembolso Stripe, la restitución de stock y los reintentos seguros.
-- No sustituye a Incidencia ni amplía el soporte del MVP.
-- ---------------------------------------------------------------------
CREATE TABLE cancelacion_pedido (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id             UUID NOT NULL UNIQUE REFERENCES pedido(id),
    pago_id               UUID NOT NULL,
    usuario_id            UUID NOT NULL REFERENCES usuario(id),
    estado                estado_cancelacion_pedido NOT NULL DEFAULT 'procesando',
    importe               NUMERIC(10,2) NOT NULL,
    stripe_refund_id      TEXT UNIQUE,
    stripe_refund_status  TEXT,
    intentos              INTEGER NOT NULL DEFAULT 1,
    ultimo_error          TEXT,
    solicitada_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    completada_at         TIMESTAMPTZ,
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_cancelacion_pago_pedido
        FOREIGN KEY (pago_id, pedido_id) REFERENCES pago(id, pedido_id),
    CONSTRAINT chk_cancelacion_importe CHECK (importe >= 0),
    CONSTRAINT chk_cancelacion_intentos CHECK (intentos >= 1),
    CONSTRAINT chk_cancelacion_refund_status CHECK (
        stripe_refund_status IS NULL OR
        stripe_refund_status IN ('pending','requires_action','succeeded','failed','canceled')
    ),
    CONSTRAINT chk_cancelacion_completada_fecha CHECK (
        completada_at IS NULL OR completada_at >= solicitada_at
    ),
    CONSTRAINT chk_cancelacion_completada_stripe CHECK (
        estado <> 'completada' OR stripe_refund_status = 'succeeded'
    )
);

CREATE INDEX idx_cancelacion_pedido_pago_id ON cancelacion_pedido(pago_id);
CREATE INDEX idx_cancelacion_pedido_estado ON cancelacion_pedido(estado);

-- ---------------------------------------------------------------------
-- 14. SUBPEDIDO  (una fila por bodega dentro de un pedido)
-- Objetivo: parte de un pedido correspondiente a una única bodega;
--   permite que cada bodega gestione de forma independiente su
--   preparación, envío e incidencias.
-- Relaciones: N:1 con pedido · N:1 con bodega · N:1 con pago · 1:N con
--   pedido_item.
-- Reglas de negocio: pertenece a una única bodega y un único pedido;
--   el estado del pedido depende del estado conjunto de sus
--   subpedidos; un subpedido entregado no puede volver a preparación.
-- Decisión CTO: subpedido.estado es la ÚNICA fuente de verdad del
--   flujo logístico completo (pendiente → aceptado → en_preparacion →
--   enviado → entregado / cancelado / incidencia). pedido_item ya no
--   duplica estos estados (ver tabla pedido_item).
-- ---------------------------------------------------------------------
CREATE TABLE subpedido (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id              UUID NOT NULL REFERENCES pedido(id),
    bodega_id              UUID NOT NULL REFERENCES bodega(id),
    pago_id                UUID NOT NULL,

    subtotal                 NUMERIC(10,2) NOT NULL,
    gastos_envio                NUMERIC(10,2) NOT NULL DEFAULT 0,
    impuestos                     NUMERIC(10,2) NOT NULL DEFAULT 0,
    comision_marketplace             NUMERIC(10,2) NOT NULL DEFAULT 0,
    total                              NUMERIC(10,2) NOT NULL,

    transportista                        TEXT,
    numero_seguimiento                     TEXT,
    fecha_preparacion                        TIMESTAMPTZ,
    fecha_envio                                TIMESTAMPTZ,
    fecha_entrega_prevista                       TIMESTAMPTZ,
    fecha_entrega_real                             TIMESTAMPTZ,

    estado                                           estado_subpedido NOT NULL DEFAULT 'pendiente',

    created_at                                         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                                           TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_ultimo_cambio_estado                             TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_subpedido_pago_pedido
        FOREIGN KEY (pago_id, pedido_id) REFERENCES pago(id, pedido_id),
    CONSTRAINT uq_subpedido_pedido_bodega UNIQUE (pedido_id, bodega_id),
    CONSTRAINT uq_subpedido_id_pedido_bodega UNIQUE (id, pedido_id, bodega_id),
    CONSTRAINT chk_subpedido_importes CHECK (
        subtotal >= 0 AND gastos_envio >= 0 AND impuestos >= 0 AND
        comision_marketplace >= 0 AND total >= 0
    )
);

CREATE INDEX idx_subpedido_pedido_id ON subpedido(pedido_id);
CREATE INDEX idx_subpedido_bodega_id ON subpedido(bodega_id);
CREATE INDEX idx_subpedido_pago_id ON subpedido(pago_id);

-- ---------------------------------------------------------------------
-- 15. PEDIDO_ITEM
-- Objetivo: línea de producto dentro de un pedido; conserva una copia
--   congelada (snapshot) del vino en el momento de la compra.
-- Relaciones: N:1 pedido · N:1 subpedido · N:1 vino.
-- Reglas de negocio: el precio y los datos del vino quedan congelados
--   tras confirmar el pedido y nunca cambian después; la cantidad debe
--   ser mayor que cero; un pedido_item nunca cambia de bodega.
-- Decisión CTO (cierre de Contradicción 4): pedido_item NO lleva estado
--   logístico. Los estados pendiente/preparación/enviado/entregado son
--   EXCLUSIVOS de subpedido, que es la única fuente de verdad del flujo
--   logístico. pedido_item solo distingue normal / cancelado / devuelto,
--   como excepción de línea dentro de un subpedido que sigue su curso.
-- ---------------------------------------------------------------------
CREATE TABLE pedido_item (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id              UUID NOT NULL REFERENCES pedido(id),
    subpedido_id           UUID NOT NULL REFERENCES subpedido(id),
    vino_id                UUID NOT NULL,
    bodega_id              UUID NOT NULL,

    -- Snapshot del producto en el momento de la compra (no cambia después)
    nombre_vino_snapshot     TEXT NOT NULL,
    anada_snapshot             INTEGER,
    bodega_snapshot              TEXT NOT NULL,
    precio_unitario                NUMERIC(10,2) NOT NULL,
    cantidad                         INTEGER NOT NULL,
    importe_total                      NUMERIC(10,2) NOT NULL,

    estado                                estado_pedido_item NOT NULL DEFAULT 'normal',

    created_at                              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                                 TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_item_subpedido_pedido_bodega
        FOREIGN KEY (subpedido_id, pedido_id, bodega_id)
        REFERENCES subpedido(id, pedido_id, bodega_id),
    CONSTRAINT fk_item_vino_bodega
        FOREIGN KEY (vino_id, bodega_id) REFERENCES vino(id, bodega_id),
    CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0),
    CONSTRAINT chk_pedido_item_importes CHECK (
        precio_unitario >= 0 AND importe_total >= 0 AND importe_total = precio_unitario * cantidad
    )
);

CREATE INDEX idx_pedido_item_pedido_id ON pedido_item(pedido_id);
CREATE INDEX idx_pedido_item_subpedido_id ON pedido_item(subpedido_id);

-- ---------------------------------------------------------------------
-- 16. INCIDENCIA
-- Objetivo: registrar un problema operativo básico del MVP relacionado
--   con un pedido, subpedido, bodega o vino, para su gestión por
--   administración.
-- Alcance: registro, clasificación, estado, descripción, relaciones y
--   trazabilidad mínima. No implementa tickets, chat, CRM ni soporte
--   avanzado.
-- Trazabilidad: los cambios se registran en auditoria usando
--   tipo_entidad = 'incidencia' y entidad_id = incidencia.id.
-- ---------------------------------------------------------------------
CREATE TABLE incidencia (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo              TEXT NOT NULL,
    estado            estado_incidencia NOT NULL DEFAULT 'abierta',
    fecha             TIMESTAMPTZ NOT NULL DEFAULT now(),
    descripcion       TEXT NOT NULL,

    pedido_id         UUID REFERENCES pedido(id),
    subpedido_id      UUID REFERENCES subpedido(id),
    bodega_id         UUID REFERENCES bodega(id),
    vino_id           UUID REFERENCES vino(id),

    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_incidencia_tipo_no_vacio CHECK (btrim(tipo) <> ''),
    CONSTRAINT chk_incidencia_descripcion_no_vacia CHECK (btrim(descripcion) <> ''),
    CONSTRAINT chk_incidencia_relacion
        CHECK (
            pedido_id IS NOT NULL OR
            subpedido_id IS NOT NULL OR
            bodega_id IS NOT NULL OR
            vino_id IS NOT NULL
        )
);

CREATE INDEX idx_incidencia_estado ON incidencia(estado);
CREATE INDEX idx_incidencia_fecha ON incidencia(fecha);
CREATE INDEX idx_incidencia_pedido_id ON incidencia(pedido_id) WHERE pedido_id IS NOT NULL;
CREATE INDEX idx_incidencia_subpedido_id ON incidencia(subpedido_id) WHERE subpedido_id IS NOT NULL;
CREATE INDEX idx_incidencia_bodega_id ON incidencia(bodega_id) WHERE bodega_id IS NOT NULL;
CREATE INDEX idx_incidencia_vino_id ON incidencia(vino_id) WHERE vino_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- 17. NOTIFICACION
-- Objetivo: registra todas las comunicaciones automáticas enviadas a
--   compradores, bodegas y administradores.
-- Relaciones: N:1 con usuario · N:1 opcional con pedido · N:1 opcional
--   con subpedido.
-- Reglas de negocio: toda notificación pertenece a un usuario; nunca
--   se eliminan físicamente; cada envío queda asociado al evento que
--   lo originó (evento_origen).
-- ---------------------------------------------------------------------
CREATE TABLE notificacion (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id          UUID NOT NULL REFERENCES usuario(id),
    tipo_notificacion   TEXT NOT NULL,

    asunto               TEXT,
    plantilla             TEXT,
    contenido               TEXT,

    canal                     canal_notificacion NOT NULL DEFAULT 'email',
    estado                      estado_notificacion NOT NULL DEFAULT 'pendiente',
    fecha_envio                   TIMESTAMPTZ,
    fecha_entrega                    TIMESTAMPTZ,
    fecha_lectura                      TIMESTAMPTZ,  -- futuro

    pedido_id                            UUID REFERENCES pedido(id),
    subpedido_id                            UUID REFERENCES subpedido(id),
    evento_origen                             TEXT,

    created_at                                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notificacion_usuario_id ON notificacion(usuario_id);
CREATE UNIQUE INDEX uq_notificacion_cancelacion_pedido
    ON notificacion(pedido_id, evento_origen)
    WHERE evento_origen = 'API-051';

-- ---------------------------------------------------------------------
-- 18. AUDITORIA  (polimórfica; nunca se modifica ni se elimina)
-- Objetivo: registra todos los eventos relevantes del marketplace para
--   garantizar trazabilidad, seguridad y soporte ante incidencias.
-- Relaciones: polimórfica hacia cualquier entidad del sistema vía
--   (tipo_entidad, entidad_id) · N:1 opcional con usuario.
-- Reglas de negocio: ningún registro puede modificarse ni eliminarse;
--   toda operación crítica, autenticación o cambio de estado genera
--   una entrada de auditoría.
-- ---------------------------------------------------------------------
CREATE TABLE auditoria (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id        UUID REFERENCES usuario(id),
    tipo_entidad      TEXT NOT NULL,
    entidad_id        UUID,

    accion             TEXT NOT NULL,
    valor_anterior       JSONB,
    valor_nuevo            JSONB,
    descripcion              TEXT,

    ip_address                 INET,
    user_agent                   TEXT,
    sistema                        TEXT,

    fecha_hora                      TIMESTAMPTZ NOT NULL DEFAULT now(),
    resultado                          resultado_auditoria NOT NULL DEFAULT 'correcto'
);

CREATE INDEX idx_auditoria_entidad ON auditoria(tipo_entidad, entidad_id);
CREATE INDEX idx_auditoria_usuario_id ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha_hora);

-- ---------------------------------------------------------------------
-- REGLAS TRANSVERSALES, TRIGGERS E ÍNDICES DE INTEGRIDAD
-- ---------------------------------------------------------------------

CREATE UNIQUE INDEX uq_usuario_email_normalizado ON usuario(lower(email));

CREATE INDEX idx_carrito_comprador_id ON carrito(comprador_id);
CREATE INDEX idx_carrito_item_carrito_id ON carrito_item(carrito_id);
CREATE INDEX idx_carrito_item_vino_id ON carrito_item(vino_id);
CREATE INDEX idx_pedido_item_vino_id ON pedido_item(vino_id);
CREATE INDEX idx_pedido_item_bodega_id ON pedido_item(bodega_id);
CREATE INDEX idx_notificacion_pedido_id ON notificacion(pedido_id) WHERE pedido_id IS NOT NULL;
CREATE INDEX idx_notificacion_subpedido_id ON notificacion(subpedido_id) WHERE subpedido_id IS NOT NULL;
CREATE INDEX idx_bodega_aprobada_por ON bodega(aprobada_por) WHERE aprobada_por IS NOT NULL;
CREATE INDEX idx_bodega_updated_by ON bodega(updated_by) WHERE updated_by IS NOT NULL;
CREATE INDEX idx_pedido_estado_created ON pedido(estado, created_at);
CREATE INDEX idx_subpedido_bodega_estado ON subpedido(bodega_id, estado);
CREATE INDEX idx_vino_bodega_estado ON vino(bodega_id, estado);
CREATE INDEX idx_incidencia_estado_fecha ON incidencia(estado, fecha DESC);

CREATE OR REPLACE FUNCTION fn_actualizar_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bodega_updated_at BEFORE UPDATE ON bodega
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_usuario_updated_at BEFORE UPDATE ON usuario
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_comprador_updated_at BEFORE UPDATE ON comprador
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_cuenta_stripe_updated_at BEFORE UPDATE ON cuenta_stripe_connect
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_vino_updated_at BEFORE UPDATE ON vino
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_imagen_updated_at BEFORE UPDATE ON imagen
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_direccion_updated_at BEFORE UPDATE ON direccion
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_carrito_updated_at BEFORE UPDATE ON carrito
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_carrito_item_updated_at BEFORE UPDATE ON carrito_item
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_pedido_updated_at BEFORE UPDATE ON pedido
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_pago_updated_at BEFORE UPDATE ON pago
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_subpedido_updated_at BEFORE UPDATE ON subpedido
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_pedido_item_updated_at BEFORE UPDATE ON pedido_item
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_incidencia_updated_at BEFORE UPDATE ON incidencia
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();
CREATE TRIGGER trg_notificacion_updated_at BEFORE UPDATE ON notificacion
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();

CREATE OR REPLACE FUNCTION fn_proteger_coherencia_rol_usuario()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.rol = 'comprador' AND NEW.rol <> 'comprador'
       AND EXISTS (SELECT 1 FROM comprador WHERE usuario_id = OLD.id) THEN
        RAISE EXCEPTION 'No puede cambiarse el rol de un usuario vinculado a comprador';
    END IF;
    IF OLD.rol = 'administrador'
       AND (NEW.rol <> 'administrador' OR NEW.estado <> 'activo')
       AND EXISTS (SELECT 1 FROM bodega WHERE aprobada_por = OLD.id) THEN
        RAISE EXCEPTION 'No puede retirarse el rol activo de un administrador que figura como aprobador';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_proteger_coherencia_rol_usuario
BEFORE UPDATE OF rol, estado ON usuario
FOR EACH ROW EXECUTE FUNCTION fn_proteger_coherencia_rol_usuario();

CREATE OR REPLACE FUNCTION fn_validar_rol_comprador()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM usuario
        WHERE id = NEW.usuario_id AND rol = 'comprador'
    ) THEN
        RAISE EXCEPTION 'comprador.usuario_id debe pertenecer a un usuario con rol comprador';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_rol_comprador
BEFORE INSERT OR UPDATE OF usuario_id ON comprador
FOR EACH ROW EXECUTE FUNCTION fn_validar_rol_comprador();

CREATE OR REPLACE FUNCTION fn_validar_aprobador_bodega()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.aprobada_por IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM usuario
        WHERE id = NEW.aprobada_por AND rol = 'administrador' AND estado = 'activo'
    ) THEN
        RAISE EXCEPTION 'bodega.aprobada_por debe ser un administrador activo';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_aprobador_bodega
BEFORE INSERT OR UPDATE OF aprobada_por ON bodega
FOR EACH ROW EXECUTE FUNCTION fn_validar_aprobador_bodega();

CREATE OR REPLACE FUNCTION fn_validar_imagen_entidad()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.tipo_entidad = 'vino' AND NOT EXISTS (SELECT 1 FROM vino WHERE id = NEW.entidad_id) THEN
        RAISE EXCEPTION 'La imagen referencia un vino inexistente';
    ELSIF NEW.tipo_entidad = 'bodega' AND NOT EXISTS (SELECT 1 FROM bodega WHERE id = NEW.entidad_id) THEN
        RAISE EXCEPTION 'La imagen referencia una bodega inexistente';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_imagen_entidad
BEFORE INSERT OR UPDATE OF tipo_entidad, entidad_id ON imagen
FOR EACH ROW EXECUTE FUNCTION fn_validar_imagen_entidad();

CREATE OR REPLACE FUNCTION fn_validar_direccion_propietario()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.propietario_tipo = 'comprador'
       AND NOT EXISTS (SELECT 1 FROM comprador WHERE usuario_id = NEW.propietario_id) THEN
        RAISE EXCEPTION 'La dirección referencia un comprador inexistente';
    ELSIF NEW.propietario_tipo = 'bodega'
       AND NOT EXISTS (SELECT 1 FROM bodega WHERE id = NEW.propietario_id) THEN
        RAISE EXCEPTION 'La dirección referencia una bodega inexistente';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_direccion_propietario
BEFORE INSERT OR UPDATE OF propietario_tipo, propietario_id ON direccion
FOR EACH ROW EXECUTE FUNCTION fn_validar_direccion_propietario();

CREATE OR REPLACE FUNCTION fn_proteger_referencias_polimorficas()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_TABLE_NAME = 'bodega' THEN
        IF EXISTS (SELECT 1 FROM imagen WHERE tipo_entidad = 'bodega' AND entidad_id = OLD.id)
           OR EXISTS (SELECT 1 FROM direccion WHERE propietario_tipo = 'bodega' AND propietario_id = OLD.id) THEN
            RAISE EXCEPTION 'No puede eliminarse una bodega con imágenes o direcciones asociadas';
        END IF;
    ELSIF TG_TABLE_NAME = 'vino' THEN
        IF EXISTS (SELECT 1 FROM imagen WHERE tipo_entidad = 'vino' AND entidad_id = OLD.id) THEN
            RAISE EXCEPTION 'No puede eliminarse un vino con imágenes asociadas';
        END IF;
    ELSIF TG_TABLE_NAME = 'comprador' THEN
        IF EXISTS (SELECT 1 FROM direccion WHERE propietario_tipo = 'comprador' AND propietario_id = OLD.usuario_id) THEN
            RAISE EXCEPTION 'No puede eliminarse un comprador con direcciones asociadas';
        END IF;
    END IF;
    RETURN OLD;
END;
$$;

CREATE TRIGGER trg_proteger_refs_bodega BEFORE DELETE ON bodega
FOR EACH ROW EXECUTE FUNCTION fn_proteger_referencias_polimorficas();
CREATE TRIGGER trg_proteger_refs_vino BEFORE DELETE ON vino
FOR EACH ROW EXECUTE FUNCTION fn_proteger_referencias_polimorficas();
CREATE TRIGGER trg_proteger_refs_comprador BEFORE DELETE ON comprador
FOR EACH ROW EXECUTE FUNCTION fn_proteger_referencias_polimorficas();

CREATE OR REPLACE FUNCTION fn_validar_direcciones_pedido()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM direccion
        WHERE id = NEW.direccion_envio_id
          AND propietario_tipo = 'comprador'
          AND propietario_id = NEW.comprador_id
          AND activa AND es_envio
    ) THEN
        RAISE EXCEPTION 'La dirección de envío no pertenece al comprador o no está activa';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM direccion
        WHERE id = NEW.direccion_facturacion_id
          AND propietario_tipo = 'comprador'
          AND propietario_id = NEW.comprador_id
          AND activa AND es_facturacion
    ) THEN
        RAISE EXCEPTION 'La dirección de facturación no pertenece al comprador o no está activa';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_direcciones_pedido
BEFORE INSERT OR UPDATE OF comprador_id, direccion_envio_id, direccion_facturacion_id ON pedido
FOR EACH ROW EXECUTE FUNCTION fn_validar_direcciones_pedido();

CREATE OR REPLACE FUNCTION fn_validar_importe_pago_pedido()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    total_pedido NUMERIC(10,2);
BEGIN
    SELECT total INTO total_pedido FROM pedido WHERE id = NEW.pedido_id;
    IF total_pedido IS NULL THEN
        RAISE EXCEPTION 'El Pedido asociado al Pago no existe';
    END IF;
    IF NEW.total_cobrado <> total_pedido THEN
        RAISE EXCEPTION 'El importe cobrado debe coincidir con el total del Pedido';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_importe_pago_pedido
BEFORE INSERT OR UPDATE OF pedido_id, total_cobrado ON pago
FOR EACH ROW EXECUTE FUNCTION fn_validar_importe_pago_pedido();

CREATE OR REPLACE FUNCTION fn_proteger_total_pedido_con_pago()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.total IS DISTINCT FROM OLD.total
       AND EXISTS (
           SELECT 1 FROM pago
           WHERE pedido_id = OLD.id
             AND total_cobrado IS DISTINCT FROM NEW.total
       ) THEN
        RAISE EXCEPTION 'No puede modificarse el total del Pedido de forma incoherente con su Pago';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_proteger_total_pedido_con_pago
BEFORE UPDATE OF total ON pedido
FOR EACH ROW EXECUTE FUNCTION fn_proteger_total_pedido_con_pago();

CREATE OR REPLACE FUNCTION fn_validar_transicion_incidencia()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.estado = OLD.estado THEN
        RETURN NEW;
    END IF;
    IF NOT (
        (OLD.estado = 'abierta' AND NEW.estado = 'en_revision') OR
        (OLD.estado = 'en_revision' AND NEW.estado = 'resuelta') OR
        (OLD.estado = 'resuelta' AND NEW.estado = 'cerrada')
    ) THEN
        RAISE EXCEPTION 'Transición de incidencia no permitida: % -> %', OLD.estado, NEW.estado;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_transicion_incidencia
BEFORE UPDATE OF estado ON incidencia
FOR EACH ROW EXECUTE FUNCTION fn_validar_transicion_incidencia();

CREATE OR REPLACE FUNCTION fn_auditar_estado_incidencia()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.estado IS DISTINCT FROM OLD.estado THEN
        INSERT INTO auditoria (
            tipo_entidad, entidad_id, accion, valor_anterior, valor_nuevo,
            descripcion, sistema, resultado
        ) VALUES (
            'incidencia', NEW.id, 'cambio_estado',
            jsonb_build_object('estado', OLD.estado),
            jsonb_build_object('estado', NEW.estado),
            'Cambio de estado de incidencia registrado automáticamente',
            'database', 'correcto'
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auditar_estado_incidencia
AFTER UPDATE OF estado ON incidencia
FOR EACH ROW EXECUTE FUNCTION fn_auditar_estado_incidencia();

CREATE OR REPLACE FUNCTION fn_proteger_carrito_fusion()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'Los registros de carrito_fusion son inmutables';
END;
$$;

CREATE TRIGGER trg_proteger_carrito_fusion
BEFORE UPDATE OR DELETE ON carrito_fusion
FOR EACH ROW EXECUTE FUNCTION fn_proteger_carrito_fusion();

CREATE OR REPLACE FUNCTION fn_proteger_auditoria()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'Los registros de auditoría son inmutables';
END;
$$;

CREATE TRIGGER trg_proteger_auditoria
BEFORE UPDATE OR DELETE ON auditoria
FOR EACH ROW EXECUTE FUNCTION fn_proteger_auditoria();

-- =====================================================================
-- Fin del esquema — 19 tablas. La versión 1.4 añade el ledger inmutable
-- de fusión de carrito autorizado por DLOG 0017.
-- =====================================================================
