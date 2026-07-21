import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../../common/database/database.service.js';

export type EstadoUsuario = 'pendiente_verificacion' | 'activo' | 'suspendido' | 'bloqueado' | 'eliminado';
export type RolUsuario = 'comprador' | 'bodega' | 'administrador';
export type EstadoBodega = 'borrador' | 'pendiente_revision' | 'aprobada' | 'activa' | 'suspendida' | 'archivada';

export interface CompradorRegistrado {
  id: string;
  email: string;
  idioma: string;
  estado: EstadoUsuario;
}

export interface UsuarioAutenticacion {
  id: string;
  email: string;
  passwordHash: string;
  nombre: string | null;
  apellidos: string | null;
  idioma: string;
  rol: RolUsuario;
  bodegaId: string | null;
  estado: EstadoUsuario;
  cuentaBloqueada: boolean;
  intentosFallidos: number;
  bodegaEstado: EstadoBodega | null;
}

export interface RegistrarCompradorInput {
  email: string;
  passwordHash: string;
  nombre: string;
  apellidos: string;
  idioma: string;
  fechaNacimiento: string;
  declaracionMayoriaEdad: true;
  aceptacionCondicionesAlcohol: true;
  versionCondicionesAlcohol: string;
}

const UNIQUE_VIOLATION = '23505';

export class EmailYaRegistradoError extends Error {}

@Injectable()
export class AuthRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async registrarComprador(input: RegistrarCompradorInput): Promise<CompradorRegistrado> {
    try {
      return await this.databaseService.withTransaction(async (client: PoolClient) => {
        const usuarioResult = await client.query<{
          id: string;
          email: string;
          idioma: string;
          estado: EstadoUsuario;
        }>(
          `INSERT INTO usuario (email, password_hash, nombre, apellidos, idioma, rol, estado)
           VALUES ($1, $2, $3, $4, $5, 'comprador', 'activo')
           RETURNING id, email, idioma, estado`,
          [input.email, input.passwordHash, input.nombre, input.apellidos, input.idioma],
        );

        const usuario = usuarioResult.rows[0];
        if (usuario === undefined) {
          throw new Error('No se pudo crear el usuario.');
        }

        await client.query(
          `INSERT INTO comprador (
             usuario_id, fecha_nacimiento,
             declaracion_mayoria_edad, declaracion_mayoria_edad_at,
             aceptacion_condiciones_alcohol, aceptacion_condiciones_alcohol_at,
             version_condiciones_alcohol
           ) VALUES ($1, $2, $3, now(), $4, now(), $5)`,
          [
            usuario.id,
            input.fechaNacimiento,
            input.declaracionMayoriaEdad,
            input.aceptacionCondicionesAlcohol,
            input.versionCondicionesAlcohol,
          ],
        );

        return usuario;
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new EmailYaRegistradoError('El email ya está registrado.');
      }
      throw error;
    }
  }

  async buscarUsuarioPorEmail(email: string): Promise<UsuarioAutenticacion | null> {
    const rows = await this.databaseService.query<UsuarioAutenticacion>(
      `SELECT u.id,
              u.email,
              u.password_hash AS "passwordHash",
              u.nombre,
              u.apellidos,
              COALESCE(u.idioma, 'es') AS idioma,
              u.rol,
              u.bodega_id AS "bodegaId",
              u.estado,
              u.cuenta_bloqueada AS "cuentaBloqueada",
              u.intentos_fallidos AS "intentosFallidos",
              b.estado AS "bodegaEstado"
         FROM usuario u
         LEFT JOIN bodega b ON b.id = u.bodega_id
        WHERE lower(u.email) = lower($1)
        LIMIT 1`,
      [email],
    );

    return rows[0] ?? null;
  }

  async registrarRechazoAutenticacion(usuarioId: string | null, incrementarIntentos: boolean): Promise<void> {
    await this.databaseService.withTransaction(async (client: PoolClient) => {
      if (usuarioId !== null && incrementarIntentos) {
        await client.query(
          'UPDATE usuario SET intentos_fallidos = intentos_fallidos + 1 WHERE id = $1',
          [usuarioId],
        );
      }
      await this.insertarAuditoria(client, usuarioId, 'error');
    });
  }

  async registrarAccesoCorrecto(usuarioId: string): Promise<void> {
    await this.databaseService.withTransaction(async (client: PoolClient) => {
      await client.query(
        'UPDATE usuario SET fecha_ultimo_acceso = now(), intentos_fallidos = 0 WHERE id = $1',
        [usuarioId],
      );
      await this.insertarAuditoria(client, usuarioId, 'correcto');
    });
  }

  private async insertarAuditoria(
    client: PoolClient,
    usuarioId: string | null,
    resultado: 'correcto' | 'error',
  ): Promise<void> {
    await client.query(
      `INSERT INTO auditoria (
         usuario_id, tipo_entidad, entidad_id, accion, descripcion, sistema, resultado
       ) VALUES ($1, 'usuario', $1, 'inicio_sesion', $2, 'backend', $3)`,
      [
        usuarioId,
        resultado === 'correcto'
          ? 'Inicio de sesión correcto.'
          : 'Intento de inicio de sesión rechazado.',
        resultado,
      ],
    );
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === UNIQUE_VIOLATION;
  }
}
