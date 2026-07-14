import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../../common/database/database.service.js';
import type { EstadoBodega } from '../bodegas/bodegas.repository.js';

export interface BodegaAdminRecord {
  id: string;
  nombre_comercial: string;
  slug: string | null;
  logo_url: string | null;
  imagen_principal_url: string | null;
  historia: string | null;
  filosofia: string | null;
  region: string | null;
  pais: string | null;
  denominacion_origen: string | null;
  anio_fundacion: number | null;
  web: string | null;
  video_url: string | null;
  estado: EstadoBodega;
  created_at: Date | string;
  updated_at: Date | string;
  razon_social: string | null;
  cif_vat: string | null;
  email_principal: string | null;
  telefono: string | null;
  persona_contacto: string | null;
  direccion_fisica: string | null;
  codigo_postal: string | null;
  ciudad: string | null;
  provincia: string | null;
  pais_contacto: string | null;
  fecha_alta: Date | string | null;
  fecha_aprobacion: Date | string | null;
}

export type ValidarBodegaResult =
  | { kind: 'ok'; bodega: BodegaAdminRecord }
  | { kind: 'not_found' }
  | { kind: 'invalid_state' }
  | { kind: 'incomplete' };

export interface BodegasPendientesPage {
  items: BodegaAdminRecord[];
  totalItems: number;
}

const ADMIN_COLUMNS = `id, nombre_comercial, slug, logo_url, imagen_principal_url,
  historia, filosofia, region, pais, denominacion_origen, anio_fundacion, web, video_url,
  estado, created_at, updated_at, razon_social, cif_vat, email_principal, telefono,
  persona_contacto, direccion_fisica, codigo_postal, ciudad, provincia, pais_contacto,
  fecha_alta, fecha_aprobacion`;

@Injectable()
export class AdminBodegasRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async listarPendientes(page: number, pageSize: number): Promise<BodegasPendientesPage> {
    type PageRow = Partial<BodegaAdminRecord> & { total_items: string | number };
    const rows = await this.databaseService.query<PageRow>(
      `WITH filtradas AS (
         SELECT ${ADMIN_COLUMNS}
           FROM bodega
          WHERE estado = 'pendiente_revision'
       ), pagina AS (
         SELECT * FROM filtradas
          ORDER BY created_at ASC, id ASC
          LIMIT $1 OFFSET $2
       )
       SELECT pagina.*, total.total_items
         FROM (SELECT count(*)::bigint AS total_items FROM filtradas) total
         LEFT JOIN pagina ON true
        ORDER BY pagina.created_at ASC NULLS LAST, pagina.id ASC NULLS LAST`,
      [pageSize, (page - 1) * pageSize],
    );
    const first = rows[0];
    const totalItems = first === undefined ? 0 : Number(first.total_items);
    const items: BodegaAdminRecord[] = rows.filter(
      (row): row is PageRow & BodegaAdminRecord => typeof row.id === 'string',
    );
    return { items, totalItems };
  }

  async obtenerDetalle(id: string): Promise<BodegaAdminRecord | null> {
    const rows = await this.databaseService.query<BodegaAdminRecord>(
      `SELECT ${ADMIN_COLUMNS} FROM bodega WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async validar(id: string, administradorId: string): Promise<ValidarBodegaResult> {
    return this.databaseService.withTransaction(async (client: PoolClient) => {
      const locked = await client.query<{
        estado: EstadoBodega;
        nombre_comercial: string | null;
        razon_social: string | null;
        cif_vat: string | null;
        email_principal: string | null;
        telefono: string | null;
        persona_contacto: string | null;
      }>(
        `SELECT estado, nombre_comercial, razon_social, cif_vat, email_principal, telefono, persona_contacto
           FROM bodega WHERE id = $1 FOR UPDATE`,
        [id],
      );
      const current = locked.rows[0];
      if (current === undefined) return { kind: 'not_found' };
      if (current.estado !== 'pendiente_revision') return { kind: 'invalid_state' };
      if (!this.hasMinimumRegistrationData(current)) return { kind: 'incomplete' };

      const updated = await client.query<BodegaAdminRecord>(
        `UPDATE bodega
            SET comision = 10.00,
                estado = 'aprobada',
                fecha_alta = COALESCE(fecha_alta, created_at),
                fecha_aprobacion = now(),
                aprobada_por = $2,
                updated_at = now(),
                updated_by = $2
          WHERE id = $1
          RETURNING ${ADMIN_COLUMNS}`,
        [id, administradorId],
      );
      const bodega = updated.rows[0];
      if (bodega === undefined) throw new Error('No se pudo aprobar la bodega bloqueada.');

      await client.query(
        `UPDATE usuario
            SET estado = 'activo', updated_at = now()
          WHERE bodega_id = $1 AND estado = 'pendiente_verificacion'`,
        [id],
      );
      await client.query(
        `INSERT INTO auditoria (
           usuario_id, tipo_entidad, entidad_id, accion, valor_anterior, valor_nuevo,
           descripcion, sistema, resultado
         ) VALUES ($1, 'bodega', $2, 'validar_bodega', $3::jsonb, $4::jsonb,
                   'Bodega validada y aprobada por administración.', 'backend', 'correcto')`,
        [
          administradorId,
          id,
          JSON.stringify({ estado: 'pendiente_revision' }),
          JSON.stringify({ estado: 'aprobada', comision: '10.00' }),
        ],
      );
      return { kind: 'ok', bodega };
    });
  }

  private hasMinimumRegistrationData(record: {
    nombre_comercial: string | null;
    razon_social: string | null;
    cif_vat: string | null;
    email_principal: string | null;
    telefono: string | null;
    persona_contacto: string | null;
  }): boolean {
    return Object.values(record).every((value) => typeof value === 'string' && value.trim().length > 0);
  }
}
