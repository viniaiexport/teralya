export interface BodegaSelf {
  id: string;
  nombre_comercial: string;
  estado: 'borrador' | 'pendiente_revision' | 'aprobada' | 'activa' | 'suspendida' | 'archivada';
  created_at: string;
  updated_at: string;
  razon_social?: string;
  cif_vat?: string;
  email_principal?: string;
  telefono?: string;
  persona_contacto?: string;
  codigo_postal?: string;
  ciudad?: string;
  pais_contacto?: string;
}
