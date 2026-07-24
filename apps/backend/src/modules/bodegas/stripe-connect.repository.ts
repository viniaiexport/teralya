import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service.js";
import type { StripeConnectedAccount } from "../checkout/stripe.gateway.js";

export interface WineryConnectContext {
  id: string;
  email: string;
  estado: string;
  stripeAccountId: string | null;
}

export interface ConnectRecord {
  stripe_account_id: string;
  estado_cuenta:
    | "no_iniciada"
    | "pendiente"
    | "en_revision"
    | "activa"
    | "restringida"
    | "suspendida";
  cuenta_verificada: boolean;
  cargos_habilitados: boolean;
  cobros_habilitados: boolean;
  ultima_sincronizacion: Date | string | null;
}

@Injectable()
export class StripeConnectRepository {
  constructor(private readonly database: DatabaseService) {}

  async context(bodegaId: string): Promise<WineryConnectContext | null> {
    const rows = await this.database.query<{
      id: string;
      email_principal: string | null;
      estado: string;
      stripe_account_id: string | null;
    }>(
      `SELECT b.id,b.email_principal,b.estado,c.stripe_account_id
         FROM bodega b
         LEFT JOIN cuenta_stripe_connect c ON c.bodega_id=b.id
        WHERE b.id=$1`,
      [bodegaId],
    );
    const row = rows[0];
    if (row === undefined || row.email_principal === null) return null;
    return {
      id: row.id,
      email: row.email_principal,
      estado: row.estado,
      stripeAccountId: row.stripe_account_id,
    };
  }

  async saveAccount(
    bodegaId: string,
    account: StripeConnectedAccount,
  ): Promise<ConnectRecord> {
    const rows = await this.database.query<ConnectRecord>(
      `INSERT INTO cuenta_stripe_connect(
         bodega_id,stripe_account_id,estado_cuenta,cuenta_verificada,
         cargos_habilitados,cobros_habilitados,pais,moneda,tipo_cuenta,
         fecha_vinculacion,ultima_sincronizacion
       ) VALUES($1,$2,$3::estado_cuenta_stripe,$4,$5,$6,$7,$8,'express',now(),now())
       ON CONFLICT(bodega_id) DO UPDATE SET
         stripe_account_id=EXCLUDED.stripe_account_id,
         estado_cuenta=EXCLUDED.estado_cuenta,
         cuenta_verificada=EXCLUDED.cuenta_verificada,
         cargos_habilitados=EXCLUDED.cargos_habilitados,
         cobros_habilitados=EXCLUDED.cobros_habilitados,
         pais=EXCLUDED.pais,
         moneda=EXCLUDED.moneda,
         ultima_sincronizacion=now(),
         updated_at=now()
       RETURNING stripe_account_id,estado_cuenta,cuenta_verificada,
                 cargos_habilitados,cobros_habilitados,ultima_sincronizacion`,
      [
        bodegaId,
        account.id,
        this.state(account),
        account.detailsSubmitted,
        account.chargesEnabled,
        account.payoutsEnabled,
        account.country,
        account.defaultCurrency?.toUpperCase() ?? "EUR",
      ],
    );
    const row = rows[0];
    if (row === undefined) throw new Error("No se pudo guardar Stripe Connect.");
    return row;
  }

  async get(bodegaId: string): Promise<ConnectRecord | null> {
    const rows = await this.database.query<ConnectRecord>(
      `SELECT stripe_account_id,estado_cuenta,cuenta_verificada,
              cargos_habilitados,cobros_habilitados,ultima_sincronizacion
         FROM cuenta_stripe_connect
        WHERE bodega_id=$1`,
      [bodegaId],
    );
    return rows[0] ?? null;
  }

  private state(
    account: StripeConnectedAccount,
  ): ConnectRecord["estado_cuenta"] {
    if (account.detailsSubmitted && account.chargesEnabled && account.payoutsEnabled)
      return "activa";
    if (account.detailsSubmitted) return "en_revision";
    return "pendiente";
  }
}
