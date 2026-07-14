import { Injectable } from '@nestjs/common';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../../common/database/database.service.js';

const UNIQUE_VIOLATION = '23505';

export interface RegistrarBodegaInput {
  nombreComercial: string;
  razonSocial: string;
  cifVat: string;
  email: string;
  passwordHash: string;
  personaContacto: string;
  telefono: string;
  paisContacto?: string;
  ciudad?: string;
  codigoPostal?: string;
}

export interface BodegaRegistrada {
  id: string;
  nombre_comercial: string;
  estado: 'pendiente_revision';
  created_at: Date | string;
  updated_at: Date | string;
  razon_social: string;
  cif_vat: string;
  email_principal: string;
  telefono: string;
  persona_contacto: string;
  pais_contacto: string | null;
  ciudad: string | null;
  codigo_postal: string | null;
}

export class EmailBodegaYaRegistradoError extends Error {}

@Injectable()
export class BodegasRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async registrar(input: RegistrarBodegaInput): Promise<BodegaRegistrada> {
    try {
      return await this.databaseService.withTransaction(async (client: PoolClient) => {
        const bodegaResult = await client.query<BodegaRegistrada>(
          `INSERT INTO bodega (
             nombre_comercial, razon_social, cif_vat, estado, tipo,
             email_principal, telefono, persona_contacto,
             pais_contacto, ciudad, codigo_postal
           ) VALUES ($1, $2, $3, 'pendiente_revision', 'estandar', $4, $5, $6, $7, $8, $9)
           RETURNING id, nombre_comercial, estado, created_at, updated_at,
                     razon_social, cif_vat, email_principal, telefono,
                     persona_contacto, pais_contacto, ciudad, codigo_postal`,
          [
            input.nombreComercial,
            input.razonSocial,
            input.cifVat,
            input.email,
            input.telefono,
            input.personaContacto,
            input.paisContacto ?? null,
            input.ciudad ?? null,
            input.codigoPostal ?? null,
          ],
        );
        const bodega = bodegaResult.rows[0];
        if (bodega === undefined) {
          throw new Error('No se pudo crear la bodega.');
        }

        const usuarioResult = await client.query<{ id: string }>(
          `INSERT INTO usuario (
             email, password_hash, nombre, telefono, rol, bodega_id
           ) VALUES ($1, $2, $3, $4, 'bodega', $5)
           RETURNING id`,
          [input.email, input.passwordHash, input.personaContacto, input.telefono, bodega.id],
        );
        const usuario = usuarioResult.rows[0];
        if (usuario === undefined) {
          throw new Error('No se pudo crear el usuario de la bodega.');
        }

        await client.query(
          `INSERT INTO auditoria (
             usuario_id, tipo_entidad, entidad_id, accion, descripcion, sistema, resultado
           ) VALUES ($1, 'bodega', $2, 'registro_bodega',
                     'Solicitud de alta de bodega registrada.', 'backend', 'correcto')`,
          [usuario.id, bodega.id],
        );

        return bodega;
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new EmailBodegaYaRegistradoError('El email ya está registrado.');
      }
      throw error;
    }
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === UNIQUE_VIOLATION;
  }
}
