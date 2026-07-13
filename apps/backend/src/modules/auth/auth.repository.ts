import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../../common/database/database.service.js';

export type EstadoUsuario = 'pendiente_verificacion' | 'activo' | 'suspendido' | 'bloqueado' | 'eliminado';

export interface CompradorRegistrado {
  id: string;
  email: string;
  idioma: string;
  estado: EstadoUsuario;
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
           VALUES ($1, $2, $3, $4, $5, 'comprador', DEFAULT)
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

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === UNIQUE_VIOLATION;
  }
}
