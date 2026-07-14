import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { hashPassword } from '../../common/security/password.util.js';
import {
  BodegasRepository,
  EmailBodegaYaRegistradoError,
  type BodegaRegistrada,
  type BodegaPerfil,
  type BodegaPublicaRecord,
} from './bodegas.repository.js';
import type { BodegaProfilePatchDto } from './dto/bodega-profile-patch.dto.js';
import type { BodegaRegistrationRequestDto } from './dto/bodega-registration-request.dto.js';
import type { BodegaSelf } from './dto/bodega-self.dto.js';
import type { BodegaPublic, BodegaSummaryPublic } from './dto/bodega-public.dto.js';

@Injectable()
export class BodegasService {
  constructor(private readonly bodegasRepository: BodegasRepository) {}

  async registrar(request: BodegaRegistrationRequestDto): Promise<BodegaSelf> {
    const passwordHash = await hashPassword(request.password);
    let bodega: BodegaRegistrada;
    try {
      bodega = await this.bodegasRepository.registrar({
        nombreComercial: request.nombre_comercial,
        razonSocial: request.razon_social,
        cifVat: request.cif_vat,
        email: request.email,
        passwordHash,
        personaContacto: request.persona_contacto,
        telefono: request.telefono,
        ...(request.pais_contacto === undefined ? {} : { paisContacto: request.pais_contacto }),
        ...(request.ciudad === undefined ? {} : { ciudad: request.ciudad }),
        ...(request.codigo_postal === undefined ? {} : { codigoPostal: request.codigo_postal }),
      });
    } catch (error) {
      if (error instanceof EmailBodegaYaRegistradoError) {
        throw new ConflictException({ code: 'CONFLICT', message: 'El email ya está registrado.' });
      }
      throw error;
    }

    return {
      id: bodega.id,
      nombre_comercial: bodega.nombre_comercial,
      estado: bodega.estado,
      created_at: this.toIsoString(bodega.created_at),
      updated_at: this.toIsoString(bodega.updated_at),
      razon_social: bodega.razon_social,
      cif_vat: bodega.cif_vat,
      email_principal: bodega.email_principal,
      telefono: bodega.telefono,
      persona_contacto: bodega.persona_contacto,
      ...(bodega.pais_contacto === null ? {} : { pais_contacto: bodega.pais_contacto }),
      ...(bodega.ciudad === null ? {} : { ciudad: bodega.ciudad }),
      ...(bodega.codigo_postal === null ? {} : { codigo_postal: bodega.codigo_postal }),
    };
  }

  async obtenerPerfilPropio(bodegaId: string): Promise<BodegaSelf> {
    const bodega = await this.bodegasRepository.obtenerPerfil(bodegaId);
    if (bodega === null) {
      throw new NotFoundException({ code: 'RESOURCE_NOT_FOUND', message: 'La bodega no existe.' });
    }
    this.assertPuedeOperar(bodega);
    return this.mapPerfil(bodega);
  }

  async obtenerPublica(id: string): Promise<BodegaPublic> {
    if (!isUUID(id)) {
      throw new NotFoundException({ code: 'RESOURCE_NOT_FOUND', message: 'La bodega no existe.' });
    }
    const bodega = await this.bodegasRepository.obtenerPublica(id);
    if (bodega === null) {
      // No revelamos si existe una bodega que todavía no es pública.
      throw new NotFoundException({ code: 'RESOURCE_NOT_FOUND', message: 'La bodega no existe.' });
    }
    return this.mapPublica(bodega);
  }

  async actualizarPerfilPropio(bodegaId: string, request: BodegaProfilePatchDto): Promise<BodegaSelf> {
    if (Object.keys(request).length === 0) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Debe enviarse al menos un campo.' });
    }

    const actual = await this.bodegasRepository.obtenerPerfil(bodegaId);
    if (actual === null || !this.puedeOperar(actual)) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'La bodega no está habilitada para operar.' });
    }

    try {
      const actualizada = await this.bodegasRepository.actualizarPerfil(bodegaId, request);
      if (actualizada === null) {
        throw new ForbiddenException({ code: 'FORBIDDEN', message: 'La bodega no está habilitada para operar.' });
      }
      return this.mapPerfil(actualizada);
    } catch (error) {
      if (error instanceof EmailBodegaYaRegistradoError) {
        throw new ConflictException({ code: 'CONFLICT', message: 'El email ya está registrado.' });
      }
      throw error;
    }
  }

  private assertPuedeOperar(bodega: BodegaPerfil): void {
    if (!this.puedeOperar(bodega)) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'La bodega no está habilitada para operar.' });
    }
  }

  private puedeOperar(bodega: BodegaPerfil): boolean {
    return bodega.estado === 'aprobada' || bodega.estado === 'activa';
  }

  private mapPerfil(bodega: BodegaPerfil): BodegaSelf {
    const optional = <K extends keyof BodegaPerfil>(key: K): Partial<Record<K, NonNullable<BodegaPerfil[K]>>> =>
      bodega[key] === null ? {} : { [key]: bodega[key] } as Partial<Record<K, NonNullable<BodegaPerfil[K]>>>;
    return {
      id: bodega.id,
      nombre_comercial: bodega.nombre_comercial,
      estado: bodega.estado,
      created_at: this.toIsoString(bodega.created_at),
      updated_at: this.toIsoString(bodega.updated_at),
      ...optional('slug'), ...optional('logo_url'), ...optional('imagen_principal_url'),
      ...optional('historia'), ...optional('filosofia'), ...optional('region'), ...optional('pais'),
      ...optional('denominacion_origen'), ...optional('anio_fundacion'), ...optional('web'),
      ...optional('video_url'), ...optional('razon_social'), ...optional('cif_vat'),
      ...optional('email_principal'), ...optional('telefono'), ...optional('persona_contacto'),
      ...optional('direccion_fisica'), ...optional('codigo_postal'), ...optional('ciudad'),
      ...optional('provincia'), ...optional('pais_contacto'),
    };
  }

  private mapPublica(bodega: BodegaPublicaRecord): BodegaPublic {
    const optional = <K extends keyof BodegaPublicaRecord>(key: K): Partial<Record<K, NonNullable<BodegaPublicaRecord[K]>>> =>
      bodega[key] === null ? {} : { [key]: bodega[key] } as Partial<Record<K, NonNullable<BodegaPublicaRecord[K]>>>;
    const summary: BodegaSummaryPublic = {
      id: bodega.id,
      nombre_comercial: bodega.nombre_comercial,
      ...optional('slug'), ...optional('logo_url'), ...optional('region'), ...optional('pais'),
      ...optional('denominacion_origen'),
    };
    return {
      id: bodega.id,
      nombre_comercial: bodega.nombre_comercial,
      ...optional('slug'), ...optional('logo_url'), ...optional('imagen_principal_url'),
      ...optional('historia'), ...optional('filosofia'), ...optional('region'), ...optional('pais'),
      ...optional('denominacion_origen'), ...optional('anio_fundacion'), ...optional('web'),
      ...optional('video_url'),
      vinos: bodega.vinos.map((vino) => ({
        id: vino.id,
        nombre_comercial: vino.nombre_comercial,
        precio: vino.precio,
        moneda: vino.moneda,
        disponible_venta: vino.disponible_venta,
        bodega: summary,
        ...(vino.slug === null ? {} : { slug: vino.slug }),
        ...(vino.tipo_vino === null ? {} : { tipo_vino: vino.tipo_vino }),
        ...(vino.anada === null ? {} : { anada: vino.anada }),
        ...(vino.region === null ? {} : { region: vino.region }),
        ...(vino.denominacion_origen === null ? {} : { denominacion_origen: vino.denominacion_origen }),
      })),
    };
  }

  private toIsoString(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
}
