import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service.js";
export interface ConfirmationRecord {
  pedido_id: string;
  comprador_id: string;
  numero_pedido: string;
  pedido_estado: string;
  pago_estado: string | null;
  confirmado_at: Date | string | null;
}
export type ConfirmationResult =
  | { kind: "found"; record: ConfirmationRecord }
  | { kind: "foreign" }
  | { kind: "missing" };
@Injectable()
export class CheckoutConfirmationRepository {
  constructor(private readonly database: DatabaseService) {}
  async obtener(owner: string, id: string): Promise<ConfirmationResult> {
    const rows = await this.database.query<ConfirmationRecord>(
      `SELECT p.id AS pedido_id,p.comprador_id,p.numero_pedido,p.estado AS pedido_estado,pg.estado AS pago_estado,coalesce(pg.fecha_captura,p.fecha_cierre,pg.updated_at) AS confirmado_at FROM pedido p LEFT JOIN pago pg ON pg.pedido_id=p.id WHERE p.id=$1`,
      [id],
    );
    const row = rows[0];
    if (row === undefined) return { kind: "missing" };
    if (row.comprador_id !== owner) return { kind: "foreign" };
    if (
      row.pedido_estado !== "pagado" ||
      row.pago_estado !== "pagado" ||
      row.confirmado_at === null
    )
      return { kind: "missing" };
    return { kind: "found", record: row };
  }
}
