import type { MoneyBreakdown } from '@/lib/checkout/contracts';
import type { OrderLine, OrderSummary, Page } from '@/lib/orders/contracts';
import type { SubOrderDetail } from '@/lib/suborders/contracts';
import type { WineryProfile, WineryState, WineOwnDetail, WineState, ImageSummary } from '@/lib/winery/contracts';

export interface AdminDashboard { ventas_dia:{importe:string;moneda:'EUR';num_pedidos:number};pedidos_pendientes:number }
export interface AdminOrderDetail extends OrderSummary { totales:MoneyBreakdown;direccion_envio_snapshot:{nombre_destinatario:string;direccion:string;codigo_postal:string;ciudad:string;pais:string;empresa?:string;direccion_adicional?:string;provincia?:string};direccion_facturacion_snapshot:{nombre_destinatario:string;direccion:string;codigo_postal:string;ciudad:string;pais:string;empresa?:string;direccion_adicional?:string;provincia?:string};lineas:OrderLine[];subpedidos:SubOrderDetail[];comprador_id?:string }
export type AdminOrderPage=Page<OrderSummary>;
export interface AdminWinerySummary { id:string;nombre_comercial:string;estado:WineryState;created_at:string;razon_social?:string;cif_vat?:string;pais_contacto?:string }
export interface AdminWinery extends WineryProfile { fecha_alta?:string;fecha_aprobacion?:string }
export interface AdminWineSummary { id:string;nombre_comercial:string;estado:WineState;bodega:AdminWinerySummary;updated_at:string;precio?:string;moneda?:'EUR';imagen_principal?:ImageSummary }
export interface AdminWineDetail extends Omit<WineOwnDetail,'bodega'> { bodega:AdminWinerySummary }
export type AdminWineryPage=Page<AdminWinerySummary>;
export type AdminWinePage=Page<AdminWineSummary>;
export type IncidentState='abierta'|'en_revision'|'resuelta'|'cerrada';
export type RelatedResourceType='pedido'|'subpedido'|'bodega'|'vino';
export interface RelatedResource{tipo:RelatedResourceType;id:string}
export interface IncidentSummary{id:string;tipo:string;estado:IncidentState;fecha:string;recurso_relacionado:RelatedResource}
export interface IncidentDetail extends IncidentSummary{descripcion:string;updated_at:string}
export type IncidentPage=Page<IncidentSummary>;
const incidentLabels:Record<IncidentState,string>={abierta:'Abierta',en_revision:'En revisión',resuelta:'Resuelta',cerrada:'Cerrada'};
const incidentNext:Partial<Record<IncidentState,IncidentState>>={abierta:'en_revision',en_revision:'resuelta',resuelta:'cerrada'};
export function incidentStateLabel(state:IncidentState):string{return incidentLabels[state]}
export function nextIncidentState(state:IncidentState):IncidentState|undefined{return incidentNext[state]}
export function isIncidentState(value:string):value is IncidentState{return Object.hasOwn(incidentLabels,value)}
