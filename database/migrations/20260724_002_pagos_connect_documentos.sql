-- TERALYA — Migración incremental 20260724_002
-- Stripe Connect: reparto 15/85, reversión y documentos económicos mínimos.
-- Idempotente y compatible con INF-05 v1.5.

BEGIN;

ALTER TABLE subpedido
    ADD COLUMN IF NOT EXISTS descuentos NUMERIC(10,2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS transferencia_stripe (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pago_id                    UUID NOT NULL REFERENCES pago(id),
    subpedido_id               UUID NOT NULL UNIQUE REFERENCES subpedido(id),
    bodega_id                  UUID NOT NULL REFERENCES bodega(id),
    cuenta_stripe_connect_id   UUID NOT NULL REFERENCES cuenta_stripe_connect(id),
    stripe_transfer_id         TEXT UNIQUE,
    importe                    NUMERIC(10,2) NOT NULL,
    moneda                     TEXT NOT NULL DEFAULT 'EUR',
    estado                     TEXT NOT NULL DEFAULT 'pendiente',
    intentos                   INTEGER NOT NULL DEFAULT 0,
    ultimo_error               TEXT,
    transferida_at             TIMESTAMPTZ,
    stripe_reversal_id         TEXT UNIQUE,
    reversion_estado           TEXT,
    revertida_at               TIMESTAMPTZ,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_transferencia_importe CHECK (importe >= 0),
    CONSTRAINT chk_transferencia_moneda CHECK (moneda = 'EUR'),
    CONSTRAINT chk_transferencia_estado CHECK (
        estado IN ('pendiente','procesando','transferida','fallida','revertida')
    ),
    CONSTRAINT chk_transferencia_intentos CHECK (intentos >= 0),
    CONSTRAINT chk_transferencia_reversion_estado CHECK (
        reversion_estado IS NULL OR
        reversion_estado IN ('pendiente','completada','fallida')
    ),
    CONSTRAINT chk_transferencia_confirmada CHECK (
        estado NOT IN ('transferida','revertida') OR stripe_transfer_id IS NOT NULL
    ),
    CONSTRAINT chk_transferencia_revertida CHECK (
        estado <> 'revertida' OR stripe_reversal_id IS NOT NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_transferencia_stripe_pago
    ON transferencia_stripe(pago_id);
CREATE INDEX IF NOT EXISTS idx_transferencia_stripe_estado
    ON transferencia_stripe(estado, updated_at);

CREATE TABLE IF NOT EXISTS serie_documental (
    tipo              TEXT NOT NULL,
    ejercicio         INTEGER NOT NULL,
    ultimo_numero     BIGINT NOT NULL DEFAULT 0,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (tipo, ejercicio),
    CONSTRAINT chk_serie_documental_tipo CHECK (
        tipo IN ('justificante_cliente','liquidacion_bodega','factura_comision')
    ),
    CONSTRAINT chk_serie_documental_numero CHECK (ultimo_numero >= 0)
);

CREATE TABLE IF NOT EXISTS documento_economico (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo                TEXT NOT NULL,
    numero_documento    TEXT NOT NULL UNIQUE,
    pedido_id           UUID NOT NULL REFERENCES pedido(id),
    pago_id             UUID NOT NULL REFERENCES pago(id),
    subpedido_id        UUID REFERENCES subpedido(id),
    bodega_id           UUID REFERENCES bodega(id),
    emisor_snapshot     JSONB NOT NULL,
    receptor_snapshot   JSONB NOT NULL,
    importes_snapshot   JSONB NOT NULL,
    moneda              TEXT NOT NULL DEFAULT 'EUR',
    leyenda             TEXT NOT NULL,
    emitido_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    anulado_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_documento_economico_tipo CHECK (
        tipo IN ('justificante_cliente','liquidacion_bodega','factura_comision')
    ),
    CONSTRAINT chk_documento_economico_moneda CHECK (moneda = 'EUR'),
    CONSTRAINT chk_documento_economico_ambito CHECK (
        (tipo = 'justificante_cliente' AND subpedido_id IS NULL AND bodega_id IS NULL) OR
        (tipo IN ('liquidacion_bodega','factura_comision') AND subpedido_id IS NOT NULL AND bodega_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_documento_justificante_pedido
    ON documento_economico(pedido_id, tipo)
    WHERE tipo = 'justificante_cliente';
CREATE UNIQUE INDEX IF NOT EXISTS uq_documento_subpedido_tipo
    ON documento_economico(subpedido_id, tipo)
    WHERE subpedido_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documento_economico_pago
    ON documento_economico(pago_id);

COMMIT;
