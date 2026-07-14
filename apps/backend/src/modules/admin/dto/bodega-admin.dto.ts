import type { EstadoBodega } from '../../bodegas/bodegas.repository.js';

/** Proyección pública del contrato BodegaAdmin; excluye campos comerciales internos. */
export interface BodegaAdmin {
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
  estado: EstadoBodega;
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
  fecha_alta?: string;
  fecha_aprobacion?: string;
}

export type BodegaAdminSummary = Pick<
  BodegaAdmin,
  'id' | 'nombre_comercial' | 'estado' | 'created_at'
> & Pick<Partial<BodegaAdmin>, 'razon_social' | 'cif_vat' | 'pais_contacto'>;

export interface PageBodegaAdminSummary {
  items: BodegaAdminSummary[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}
