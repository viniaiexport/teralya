import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../../common/database/database.service.js';
import type { IncidentState, RelatedResourceType } from './dto/admin-incidencias.dto.js';

export interface IncidentRecord {
  id: string;
  tipo: string;
  estado: IncidentState;
  fecha: Date | string;
  descripcion: string;
  updated_at: Date | string;
  recurso_tipo: RelatedResourceType;
  recurso_id: string;
}

export interface IncidentPage {
  items: IncidentRecord[];
  total: number;
}

export type IncidentTransitionResult =
  | { kind: 'updated'; incident: IncidentRecord }
  | { kind: 'missing' }
  | { kind: 'conflict' };

const COLUMNS = `i.id,i.tipo,i.estado,i.fecha,i.descripcion,i.updated_at,
  CASE WHEN i.pedido_id IS NOT NULL THEN 'pedido'
       WHEN i.subpedido_id IS NOT NULL THEN 'subpedido'
       WHEN i.bodega_id IS NOT NULL THEN 'bodega'
       ELSE 'vino' END AS recurso_tipo,
  COALESCE(i.pedido_id,i.subpedido_id,i.bodega_id,i.vino_id) AS recurso_id`;

const NEXT_STATE: Partial<Record<IncidentState, IncidentState>> = {
  abierta: 'en_revision',
  en_revision: 'resuelta',
  resuelta: 'cerrada',
};

@Injectable()
export class AdminIncidenciasRepository {
  constructor(private readonly database: DatabaseService) {}

  async listar(
    estado: IncidentState | undefined,
    page: number,
    pageSize: number,
  ): Promise<IncidentPage> {
    const listWhere = estado === undefined ? '' : 'WHERE i.estado=$3';
    const countWhere = estado === undefined ? '' : 'WHERE i.estado=$1';
    const params: unknown[] = [pageSize, (page - 1) * pageSize];
    if (estado !== undefined) params.push(estado);
    const count = await this.database.query<{ total: string }>(
      `SELECT count(*)::text AS total FROM incidencia i ${countWhere}`,
      estado === undefined ? [] : [estado],
    );
    const items = await this.database.query<IncidentRecord>(
      `SELECT ${COLUMNS} FROM incidencia i ${listWhere} ORDER BY i.fecha DESC,i.id DESC LIMIT $1 OFFSET $2`,
      params,
    );
    return { items, total: Number(count[0]?.total ?? 0) };
  }

  async obtener(id: string): Promise<IncidentRecord | null> {
    const rows = await this.database.query<IncidentRecord>(
      `SELECT ${COLUMNS} FROM incidencia i WHERE i.id=$1`,
      [id],
    );
    return rows[0] ?? null;
  }

  transition(id: string, destino: IncidentState): Promise<IncidentTransitionResult> {
    return this.database.withTransaction(async (client) => {
      const locked = await client.query<{ estado: IncidentState }>(
        'SELECT estado FROM incidencia WHERE id=$1 FOR UPDATE',
        [id],
      );
      const current = locked.rows[0];
      if (current === undefined) return { kind: 'missing' };
      if (current.estado === destino) {
        return { kind: 'updated', incident: this.required(await this.fetchClient(client, id)) };
      }
      if (NEXT_STATE[current.estado] !== destino) return { kind: 'conflict' };
      await client.query('UPDATE incidencia SET estado=$2 WHERE id=$1', [id, destino]);
      return { kind: 'updated', incident: this.required(await this.fetchClient(client, id)) };
    });
  }

  private async fetchClient(client: PoolClient, id: string): Promise<IncidentRecord | null> {
    const rows = await client.query<IncidentRecord>(
      `SELECT ${COLUMNS} FROM incidencia i WHERE i.id=$1`,
      [id],
    );
    return rows.rows[0] ?? null;
  }

  private required(value: IncidentRecord | null): IncidentRecord {
    if (value === null) throw new Error('No se pudo recuperar la incidencia.');
    return value;
  }
}
