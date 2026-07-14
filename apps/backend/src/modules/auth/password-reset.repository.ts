import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../../common/database/database.service.js';

export type EstadoSolicitudRecuperacion = 'pendiente' | 'utilizada' | 'expirada' | 'cancelada';

export type ResultadoConsumoSolicitud =
  | { resultado: 'no_encontrada' }
  | { resultado: 'no_disponible' }
  | { resultado: 'restablecida'; usuarioId: string };

@Injectable()
export class PasswordResetRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async buscarUsuarioIdPorTokenHash(tokenHash: string): Promise<string | null> {
    const rows = await this.databaseService.query<{ usuario_id: string }>(
      `SELECT usuario_id
         FROM solicitud_recuperacion_password
        WHERE token_hash = $1
        LIMIT 1`,
      [tokenHash],
    );
    return rows[0]?.usuario_id ?? null;
  }

  async consumirSolicitud(
    tokenHash: string,
    nuevoPasswordHash: string,
    beforeCommit: (usuarioId: string) => Promise<void>,
  ): Promise<ResultadoConsumoSolicitud> {
    return this.databaseService.withTransaction(async (client: PoolClient) => {
      const solicitudRows = await client.query<{
        id: string;
        usuario_id: string;
        estado: EstadoSolicitudRecuperacion;
        expires_at: Date;
      }>(
        `SELECT id, usuario_id, estado, expires_at
           FROM solicitud_recuperacion_password
          WHERE token_hash = $1
          FOR UPDATE`,
        [tokenHash],
      );

      const solicitud = solicitudRows.rows[0];
      if (solicitud === undefined) {
        return { resultado: 'no_encontrada' };
      }

      const vigente =
        solicitud.estado === 'pendiente' &&
        new Date(solicitud.expires_at).getTime() > Date.now();
      if (!vigente) {
        return { resultado: 'no_disponible' };
      }

      await client.query('SELECT id FROM usuario WHERE id = $1 FOR UPDATE', [
        solicitud.usuario_id,
      ]);

      await client.query(
        `UPDATE usuario
            SET password_hash = $1, intentos_fallidos = 0
          WHERE id = $2`,
        [nuevoPasswordHash, solicitud.usuario_id],
      );

      await client.query(
        `UPDATE solicitud_recuperacion_password
            SET estado = 'utilizada', used_at = now()
          WHERE id = $1`,
        [solicitud.id],
      );

      await client.query(
        `UPDATE solicitud_recuperacion_password
            SET estado = 'cancelada'
          WHERE usuario_id = $1 AND estado = 'pendiente' AND id <> $2`,
        [solicitud.usuario_id, solicitud.id],
      );

      await client.query(
        `INSERT INTO auditoria (
           usuario_id, tipo_entidad, entidad_id, accion, descripcion, sistema, resultado
         ) VALUES (
           $1, 'solicitud_recuperacion_password', $2, 'restablecimiento_password',
           'Contraseña restablecida mediante token de recuperación.', 'backend', 'correcto'
         )`,
        [solicitud.usuario_id, solicitud.id],
      );

      // La revocación externa debe completarse antes del COMMIT. Si Redis falla,
      // la excepción revierte password, token y auditoría en PostgreSQL.
      await beforeCommit(solicitud.usuario_id);

      return { resultado: 'restablecida', usuarioId: solicitud.usuario_id };
    });
  }
}
