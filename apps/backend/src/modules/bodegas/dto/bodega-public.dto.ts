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
  paises_envio?: string[];
  plazo_preparacion_dias?: number;
  plazo_entrega_estimado?: string;
  coste_envio_descripcion?: string;
  transportista_habitual?: string;
  restricciones_entrega?: string;
  condiciones_empaquetado?: string;
  capacidad_internacional?: boolean;
}
