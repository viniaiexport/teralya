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

export type EstadoBodega = 'borrador' | 'pendiente_revision' | 'aprobada' | 'activa' | 'suspendida' | 'archivada';

export interface BodegaPerfil {
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
  paises_envio: string[] | null;
  plazo_preparacion_dias: number | null;
  plazo_entrega_estimado: string | null;
  coste_envio_descripcion: string | null;
  transportista_habitual: string | null;
  restricciones_entrega: string | null;
  condiciones_empaquetado: string | null;
  capacidad_internacional: boolean | null;
}

export interface VinoResumenPublico {
  id: string;
  nombre_comercial: string;
  precio: string;
  moneda: 'EUR';
  disponible_venta: boolean;
  slug: string | null;
  tipo_vino: string | null;
  anada: number | null;
  region: string | null;
  denominacion_origen: string | null;
}

export interface BodegaPublicaRecord {
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
  paises_envio: string[] | null;
  plazo_preparacion_dias: number | null;
  plazo_entrega_estimado: string | null;
  coste_envio_descripcion: string | null;
  transportista_habitual: string | null;
  restricciones_entrega: string | null;
  condiciones_empaquetado: string | null;
  capacidad_internacional: boolean | null;
  vinos: VinoResumenPublico[];
}

export type ActualizarPerfilBodegaInput = Partial<Pick<BodegaPerfil,
  | 'nombre_comercial' | 'historia' | 'filosofia' | 'region' | 'pais'
  | 'denominacion_origen' | 'anio_fundacion' | 'web' | 'video_url'
  | 'email_principal' | 'telefono' | 'persona_contacto' | 'logo_url'
  | 'imagen_principal_url' | 'paises_envio' | 'plazo_preparacion_dias'
  | 'plazo_entrega_estimado' | 'coste_envio_descripcion' | 'transportista_habitual'
  | 'restricciones_entrega' | 'condiciones_empaquetado' | 'capacidad_internacional'>>;

const PERFIL_COLUMNS = `id, nombre_comercial, slug, logo_url, imagen_principal_url,
  historia, filosofia, region, pais, denominacion_origen, anio_fundacion, web, video_url,
  estado, created_at, updated_at, razon_social, cif_vat, email_principal, telefono,
  persona_contacto, direccion_fisica, codigo_postal, ciudad, provincia, pais_contacto,
  paises_envio, plazo_preparacion_dias, plazo_entrega_estimado, coste_envio_descripcion,
  transportista_habitual, restricciones_entrega, condiciones_empaquetado, capacidad_internacional`;

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

  async obtenerPerfil(id: string): Promise<BodegaPerfil | null> {
    const result = await this.databaseService.query<BodegaPerfil>(
      `SELECT ${PERFIL_COLUMNS} FROM bodega WHERE id = $1`,
      [id],
    );
    return result[0] ?? null;
  }

  async obtenerPublica(id: string): Promise<BodegaPublicaRecord | null> {
    const bodegas = await this.databaseService.query<Omit<BodegaPublicaRecord, 'vinos'>>(
      `SELECT id, nombre_comercial, slug, logo_url, imagen_principal_url, historia, filosofia,
              region, pais, denominacion_origen, anio_fundacion, web, video_url,
              paises_envio, plazo_preparacion_dias, plazo_entrega_estimado, coste_envio_descripcion,
              transportista_habitual, restricciones_entrega, condiciones_empaquetado, capacidad_internacional
         FROM bodega
        WHERE id = $1 AND estado IN ('aprobada', 'activa')`,
      [id],
    );
    const bodega = bodegas[0];
    if (bodega === undefined) return null;

    const vinos = await this.databaseService.query<VinoResumenPublico>(
      `SELECT id, nombre_comercial, precio::text AS precio, moneda, disponible_venta,
              slug, tipo_vino, anada, region, denominacion_origen
         FROM vino
        WHERE bodega_id = $1 AND estado = 'publicado'
        ORDER BY nombre_comercial ASC, id ASC`,
      [id],
    );
    return { ...bodega, vinos };
  }

  async actualizarPerfil(id: string, input: ActualizarPerfilBodegaInput): Promise<BodegaPerfil | null> {
    const entries = Object.entries(input);
    const assignments = entries.map(([column], index) => `${column} = $${String(index + 2)}`);
    try {
      const result = await this.databaseService.query<BodegaPerfil>(
        `UPDATE bodega SET ${assignments.join(', ')}, updated_at = now()
          WHERE id = $1 AND estado IN ('aprobada', 'activa')
          RETURNING ${PERFIL_COLUMNS}`,
        [id, ...entries.map(([, value]) => value)],
      );
      return result[0] ?? null;
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
