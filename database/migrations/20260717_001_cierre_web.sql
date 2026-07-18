-- TERALYA — Migración incremental 20260717_001
-- Cierra condiciones de envío por bodega y cancelación contractual API-051.
-- Idempotente y compatible con INF-05 v1.4.

BEGIN;

DO $$
BEGIN
    CREATE TYPE estado_cancelacion_pedido AS ENUM ('procesando', 'completada', 'fallida');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE bodega
    ADD COLUMN IF NOT EXISTS plazo_entrega_estimado TEXT,
    ADD COLUMN IF NOT EXISTS coste_envio_descripcion TEXT,
    ADD COLUMN IF NOT EXISTS restricciones_entrega TEXT,
    ADD COLUMN IF NOT EXISTS condiciones_empaquetado TEXT;

CREATE TABLE IF NOT EXISTS cancelacion_pedido (
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

CREATE INDEX IF NOT EXISTS idx_cancelacion_pedido_pago_id
    ON cancelacion_pedido(pago_id);
CREATE INDEX IF NOT EXISTS idx_cancelacion_pedido_estado
    ON cancelacion_pedido(estado);

CREATE UNIQUE INDEX IF NOT EXISTS uq_notificacion_cancelacion_pedido
    ON notificacion(pedido_id, evento_origen)
    WHERE evento_origen = 'API-051';

COMMIT;
