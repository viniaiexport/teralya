import type { AddressUse } from './address-request.dto.js';
export interface AddressDto {
  id: string; uso: AddressUse; nombre_destinatario: string; direccion: string; codigo_postal: string;
  ciudad: string; pais: string; nombre_identificativo?: string; empresa?: string; direccion_adicional?: string;
  provincia?: string; persona_contacto?: string; telefono?: string; email?: string; es_principal: boolean;
  activa: boolean; created_at: string; updated_at: string;
}
