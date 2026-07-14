import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../../common/database/database.service.js';

export interface UsuarioRecuperacion {
  id: string;
  email: string;
}

export interface SolicitudRecuperacionCreada {
  solicitudId: string;
  notificacionId: string;
}

@Injectable()
export class PasswordRecoveryRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async buscarUsuarioPorEmail(email: string): Promise<UsuarioRecuperacion | null> {
    const rows = await this.databaseService.query<UsuarioRecuperacion>(
      'SELECT id, email FROM usuario WHERE lower(email) = lower($1) LIMIT 1',
      [email],
    );
    return rows[0] ?? null;
  }

  async crearSolicitud(
    usuarioId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<SolicitudRecuperacionCreada> {
    return this.databaseService.withTransaction(async (client: PoolClient) => {
      // Serializa todas las rotaciones de token del mismo usuario para que dos
      // solicitudes concurrentes no puedan dejar más de una fila pendiente.
      await client.query('SELECT id FROM usuario WHERE id = $1 FOR UPDATE', [usuarioId]);

      await client.query(
        `UPDATE solicitud_recuperacion_password
            SET estado = 'expirada'
          WHERE usuario_id = $1 AND estado = 'pendiente' AND expires_at <= now()`,
        [usuarioId],
      );
      await client.query(
        `UPDATE solicitud_recuperacion_password
            SET estado = 'cancelada'
          WHERE usuario_id = $1 AND estado = 'pendiente' AND expires_at > now()`,
        [usuarioId],
      );

      const solicitudResult = await client.query<{ id: string }>(
        `INSERT INTO solicitud_recuperacion_password (usuario_id, token_hash, expires_at)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [usuarioId, tokenHash, expiresAt],
      );
      const solicitudId = solicitudResult.rows[0]?.id;
      if (solicitudId === undefined) {
        throw new Error('No se pudo crear la solicitud de recuperación.');
      }

      const notificacionResult = await client.query<{ id: string }>(
        `INSERT INTO notificacion (
           usuario_id, tipo_notificacion, asunto, plantilla, contenido,
           canal, estado, evento_origen
         ) VALUES (
           $1, 'recuperacion_password', 'Recupera tu acceso a Teralya',
           'password_recovery', NULL, 'email', 'pendiente', 'auth.password_recovery'
         )
         RETURNING id`,
        [usuarioId],
      );
      const notificacionId = notificacionResult.rows[0]?.id;
      if (notificacionId === undefined) {
        throw new Error('No se pudo registrar la notificación de recuperación.');
      }

      await client.query(
        `INSERT INTO auditoria (
           usuario_id, tipo_entidad, entidad_id, accion, descripcion, sistema, resultado
         ) VALUES (
           $1, 'solicitud_recuperacion_password', $2, 'solicitud_recuperacion',
           'Solicitud de recuperación aceptada.', 'backend', 'correcto'
         )`,
        [usuarioId, solicitudId],
      );

      return { solicitudId, notificacionId };
    });
  }

  async registrarSolicitudSinCuenta(): Promise<void> {
    await this.databaseService.query(
      `INSERT INTO auditoria (
         usuario_id, tipo_entidad, entidad_id, accion, descripcion, sistema, resultado
       ) VALUES (
         NULL, 'usuario', NULL, 'solicitud_recuperacion',
         'Solicitud de recuperación aceptada sin cuenta asociada.', 'backend', 'correcto'
       )`,
    );
  }

  async marcarNotificacionEnviada(notificacionId: string): Promise<void> {
    await this.databaseService.query(
      `UPDATE notificacion
          SET estado = 'enviada', fecha_envio = now()
        WHERE id = $1`,
      [notificacionId],
    );
  }

  async marcarEnvioFallido(
    usuarioId: string,
    solicitudId: string,
    notificacionId: string,
  ): Promise<void> {
    await this.databaseService.withTransaction(async (client: PoolClient) => {
      await client.query(
        `UPDATE solicitud_recuperacion_password
            SET estado = 'cancelada'
          WHERE id = $1 AND estado = 'pendiente'`,
        [solicitudId],
      );
      await client.query(
        `UPDATE notificacion
            SET estado = 'fallida'
          WHERE id = $1`,
        [notificacionId],
      );
      await client.query(
        `INSERT INTO auditoria (
           usuario_id, tipo_entidad, entidad_id, accion, descripcion, sistema, resultado
         ) VALUES (
           $1, 'solicitud_recuperacion_password', $2, 'envio_recuperacion',
           'No se pudieron entregar las instrucciones de recuperación.',
           'backend', 'error'
         )`,
        [usuarioId, solicitudId],
      );
    });
  }
}
