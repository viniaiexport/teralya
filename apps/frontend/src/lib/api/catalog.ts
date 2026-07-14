import 'server-only';
import type { Route } from 'next';
import { apiRequest } from './client';

export interface ImageSummary { id:string;url:string;es_principal:boolean;orden:number;alt_text:string;resolucion?:string }
export interface BodegaSummary { id:string;nombre_comercial:string;slug?:string;logo_url?:string;region?:string;pais?:string;denominacion_origen?:string }
export interface WineSummary { id:string;nombre_comercial:string;precio:string;moneda:'EUR';disponible_venta:boolean;bodega:BodegaSummary;slug?:string;tipo_vino?:string;anada?:number;region?:string;denominacion_origen?:string;imagen_principal?:ImageSummary }
export interface WinePublicDetail extends WineSummary { imagenes:ImageSummary[];pais?:string;variedades_uva?:string[];crianza?:string;meses_crianza?:number;graduacion_alcoholica?:string;volumen_ml?:number;descripcion_corta?:string;descripcion_completa?:string;nota_cata?:string;maridaje?:string;temperatura_servicio?:string;certificaciones?:string[];premios?:string[];produccion_limitada?:boolean }
export interface BodegaPublic extends BodegaSummary { vinos:WineSummary[];imagen_principal_url?:string;historia?:string;filosofia?:string;anio_fundacion?:number;web?:string;video_url?:string }
export interface PageWineSummary { items:WineSummary[];page:number;page_size:number;total_items:number;total_pages:number }
export interface CatalogFilters { q?:string;tipo_vino?:string;region?:string;denominacion_origen?:string;precio_min?:string;precio_max?:string;page?:number;page_size?:number }
type SearchValues=Record<string,string|string[]|undefined>;
const textLimits={q:120,tipo_vino:80,region:160,denominacion_origen:160} as const;
const moneyPattern=/^(0|[1-9][0-9]{0,7})\.[0-9]{2}$/;
function first(value:string|string[]|undefined):string|undefined{return Array.isArray(value)?value[0]:value}
function cleanText(value:string|string[]|undefined,maximum:number):string|undefined{const normalized=first(value)?.trim();return normalized===undefined||normalized.length===0?undefined:normalized.slice(0,maximum)}
function positiveInteger(value:string|string[]|undefined,maximum?:number):number|undefined{const normalized=first(value);if(normalized===undefined||!/^\d+$/.test(normalized))return undefined;const parsed=Number(normalized);return !Number.isSafeInteger(parsed)||parsed<1||(maximum!==undefined&&parsed>maximum)?undefined:parsed}
export function catalogFiltersFromSearch(values:SearchValues):CatalogFilters{const filters:CatalogFilters={};for(const[key,maximum]of Object.entries(textLimits) as [keyof typeof textLimits,number][]){const value=cleanText(values[key],maximum);if(value!==undefined)filters[key]=value}for(const key of ['precio_min','precio_max'] as const){const value=first(values[key]);if(value!==undefined&&moneyPattern.test(value))filters[key]=value}const page=positiveInteger(values.page);const pageSize=positiveInteger(values.page_size,100);if(page!==undefined&&page!==1)filters.page=page;if(pageSize!==undefined&&pageSize!==20)filters.page_size=pageSize;return filters}
export function buildCatalogPath(filters:CatalogFilters):`/vinos${string}`{const query=new URLSearchParams();for(const key of ['q','tipo_vino','region','denominacion_origen','precio_min','precio_max'] as const){const value=filters[key]?.trim();if(value!==undefined&&value!=='')query.set(key,value)}if(filters.page!==undefined&&filters.page!==1)query.set('page',String(filters.page));if(filters.page_size!==undefined&&filters.page_size!==20)query.set('page_size',String(filters.page_size));const serialized=query.toString();return serialized===''?'/vinos':`/vinos?${serialized}`}
export function catalogHref(filters:CatalogFilters,page:number):Route{return buildCatalogPath({...filters,page}) as Route}
export function wineHref(id:string):Route{return `/vinos/${encodeURIComponent(id)}` as Route}
export function wineryHref(id:string):Route{return `/bodegas/${encodeURIComponent(id)}` as Route}
export function formatEuro(value:string):string{const amount=Number(value);return Number.isFinite(amount)?new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(amount):value}
export function getCatalog(filters:CatalogFilters):Promise<PageWineSummary>{return apiRequest<PageWineSummary>(buildCatalogPath(filters),{method:'GET',cache:'no-store'})}
export function getPublicWine(id:string):Promise<WinePublicDetail>{return apiRequest<WinePublicDetail>(`/vinos/${encodeURIComponent(id)}`,{method:'GET',cache:'no-store'})}
export function getPublicWinery(id:string):Promise<BodegaPublic>{return apiRequest<BodegaPublic>(`/bodegas/${encodeURIComponent(id)}`,{method:'GET',cache:'no-store'})}
