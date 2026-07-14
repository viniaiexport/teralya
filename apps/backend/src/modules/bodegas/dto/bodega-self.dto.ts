export interface BodegaSelf {
  id: string;
  nombre_comercial: string;
  slug?: string;
  logo_url?: string;
  imagen_principal_url?: string;
  historia?: string;
  filosofia?: string;
  region?: string;
  pais?: string;
  denominacion_origen?: string;
  anio_fundacion?: number;
  web?: string;
  video_url?: string;
  estado: 'borrador' | 'pendiente_revision' | 'aprobada' | 'activa' | 'suspendida' | 'archivada';
  created_at: string;
  updated_at: string;
  razon_social?: string;
  cif_vat?: string;
  email_principal?: string;
  telefono?: string;
  persona_contacto?: string;
  direccion_fisica?: string;
  codigo_postal?: string;
  ciudad?: string;
  provincia?: string;
  pais_contacto?: string;
}
