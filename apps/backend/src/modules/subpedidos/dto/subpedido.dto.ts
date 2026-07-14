export const SUBORDER_STATES = ['pendiente', 'aceptado', 'en_preparacion', 'enviado', 'entregado', 'cancelado', 'incidencia'] as const;
export type SubOrderState = (typeof SUBORDER_STATES)[number];

export interface SubOrderSummary {
  id: string;
  pedido_id: string;
  estado: SubOrderState;
  total: string;
  moneda: 'EUR';
  fecha_ultimo_cambio_estado: string;
}
export interface OrderLine { id:string; vino_id:string; nombre_vino:string; bodega:string; precio_unitario:string; cantidad:number; importe_total:string; anada?:number }
export interface AddressSnapshot { nombre_destinatario:string; direccion:string; codigo_postal:string; ciudad:string; pais:string; empresa?:string; direccion_adicional?:string; provincia?:string; persona_contacto?:string; telefono?:string; email?:string }
export interface Tracking { transportista?:string; numero_seguimiento?:string; fecha_preparacion?:string; fecha_envio?:string; fecha_entrega_prevista?:string; fecha_entrega_real?:string }
export interface SubOrderDetail extends SubOrderSummary {
  totales: { subtotal:string; gastos_envio:string; impuestos:string; total:string; moneda:'EUR' };
  lineas: OrderLine[];
  direccion_envio_snapshot: AddressSnapshot;
  tracking: Tracking;
  pedido_estado?: 'pendiente_pago'|'pagado'|'en_preparacion'|'parcialmente_enviado'|'enviado'|'entregado'|'cancelado'|'devuelto';
}
export interface PageSubOrderSummary { items:SubOrderSummary[]; page:number; page_size:number; total_items:number; total_pages:number }
