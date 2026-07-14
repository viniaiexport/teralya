export interface BodegaSummaryPublic {
  id: string;
  nombre_comercial: string;
  slug?: string;
  logo_url?: string;
  region?: string;
  pais?: string;
  denominacion_origen?: string;
}

export interface WineSummaryPublic {
  id: string;
  nombre_comercial: string;
  precio: string;
  moneda: 'EUR';
  disponible_venta: boolean;
  bodega: BodegaSummaryPublic;
  slug?: string;
  tipo_vino?: string;
  anada?: number;
  region?: string;
  denominacion_origen?: string;
}

export interface BodegaPublic {
  id: string;
  nombre_comercial: string;
  vinos: WineSummaryPublic[];
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
}
