import type { Page } from '@/lib/orders/contracts';

export type WineryState = 'borrador'|'pendiente_revision'|'aprobada'|'activa'|'suspendida'|'archivada';
export type WineState = 'borrador'|'pendiente_revision'|'publicado'|'oculto'|'archivado';

export interface WineryProfile {
  id:string; nombre_comercial:string; estado:WineryState; created_at:string; updated_at:string;
  slug?:string; logo_url?:string; imagen_principal_url?:string; historia?:string; filosofia?:string; region?:string; pais?:string; denominacion_origen?:string; anio_fundacion?:number; web?:string; video_url?:string;
  razon_social?:string; cif_vat?:string; email_principal?:string; telefono?:string; persona_contacto?:string; direccion_fisica?:string; codigo_postal?:string; ciudad?:string; provincia?:string; pais_contacto?:string;
  paises_envio?:string[]; plazo_preparacion_dias?:number; plazo_entrega_estimado?:string; coste_envio_descripcion?:string; transportista_habitual?:string; restricciones_entrega?:string; condiciones_empaquetado?:string; capacidad_internacional?:boolean;
}

export type WineryProfilePatch = Partial<Pick<WineryProfile,'nombre_comercial'|'historia'|'filosofia'|'region'|'pais'|'denominacion_origen'|'anio_fundacion'|'web'|'video_url'|'email_principal'|'telefono'|'persona_contacto'|'logo_url'|'imagen_principal_url'|'paises_envio'|'plazo_preparacion_dias'|'plazo_entrega_estimado'|'coste_envio_descripcion'|'transportista_habitual'|'restricciones_entrega'|'condiciones_empaquetado'|'capacidad_internacional'>>;

export type WineImageContentType = 'image/jpeg'|'image/png'|'image/webp';
export interface ImageSummary { id:string; url:string; es_principal:boolean; orden:number; alt_text:string; resolucion?:string }
export interface WineImage extends ImageSummary { formato:'jpeg'|'png'|'webp'; activa:boolean; fecha_subida:string; updated_at:string; nombre_archivo?:string; tamanio_bytes?:number }
export interface ImageUploadRequest { upload_id:string; nombre_archivo:string; content_type:WineImageContentType; tamanio_bytes:number; checksum_sha256:string }
export interface ImageUploadAuthorization { upload_id:string; upload_url:string; method:'PUT'; required_headers:{'Content-Type':WineImageContentType;'x-amz-checksum-sha256':string;'If-None-Match':'*'}; confirmation_token:string; upload_expires_at:string; confirmation_expires_at:string }
export interface ImageConfirmRequest { upload_id:string; confirmation_token:string; alt_text:string; orden?:number; es_principal?:boolean }
export interface ImagePatchRequest { alt_text?:string; orden?:number; es_principal?:boolean }
export interface ImageActionResult<T=undefined> { ok:boolean; data?:T; message?:string; requestId?:string }
export interface WineInput {
  nombre_comercial:string; precio:string; moneda:'EUR'; stock_disponible:number; disponible_venta:boolean;
  sku?:string; tipo_vino?:string; anada?:number; pais?:string; region?:string; denominacion_origen?:string; variedades_uva?:string[]; crianza?:string; meses_crianza?:number; graduacion_alcoholica?:string; volumen_ml?:number; descripcion_corta?:string; descripcion_completa?:string; nota_cata?:string; maridaje?:string; temperatura_servicio?:string; certificaciones?:string[]; premios?:string[]; produccion_limitada?:boolean; peso_gramos?:number; plazo_preparacion_dias?:number; botellas_por_caja?:number;
}
export interface WineOwnSummary { id:string; nombre_comercial:string; estado:WineState; stock_disponible:number; disponible_venta:boolean; updated_at:string; sku?:string; precio?:string; moneda?:'EUR'; imagen_principal?:ImageSummary }
export interface WineOwnDetail extends WineInput { id:string; estado:WineState; stock_reservado:number; stock_minimo:number; created_at:string; updated_at:string; imagenes:ImageSummary[]; bodega:{id:string;nombre_comercial:string}; slug?:string; imagen_principal?:ImageSummary }
export type WineOwnPage = Page<WineOwnSummary>;

const wineLabels:Record<WineState,string>={borrador:'Borrador',pendiente_revision:'Pendiente de revisión',publicado:'Publicado',oculto:'Oculto',archivado:'Archivado'};
export function wineStateLabel(state:WineState):string{return wineLabels[state]}
