import { ConflictException, Injectable } from '@nestjs/common';
import { hashPassword } from '../../common/security/password.util.js';
import {
  BodegasRepository,
  EmailBodegaYaRegistradoError,
  type BodegaRegistrada,
} from './bodegas.repository.js';
import type { BodegaRegistrationRequestDto } from './dto/bodega-registration-request.dto.js';
import type { BodegaSelf } from './dto/bodega-self.dto.js';

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

  private toIsoString(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
}
