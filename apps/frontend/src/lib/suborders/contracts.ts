import type { AddressSnapshot, OrderState } from '@/lib/checkout/contracts';
import type { OrderLine, Page } from '@/lib/orders/contracts';

export type SubOrderState = 'pendiente' | 'aceptado' | 'en_preparacion' | 'enviado' | 'entregado' | 'cancelado' | 'incidencia';

export interface SubOrderSummary {
  id: string;
  pedido_id: string;
  estado: SubOrderState;
  total: string;
  moneda: 'EUR';
  fecha_ultimo_cambio_estado: string;
}

export interface Tracking {
  transportista?: string;
  numero_seguimiento?: string;
  fecha_preparacion?: string;
  fecha_envio?: string;
  fecha_entrega_prevista?: string;
  fecha_entrega_real?: string;
}

export interface SubOrderDetail extends SubOrderSummary {
  totales: { subtotal: string; gastos_envio: string; impuestos: string; total: string; moneda: 'EUR' };
  lineas: OrderLine[];
  direccion_envio_snapshot: AddressSnapshot;
  tracking: Tracking;
  pedido_estado?: OrderState;
}

export type SubOrderPage = Page<SubOrderSummary>;

const labels: Record<SubOrderState, string> = {
  pendiente: 'Pendiente', aceptado: 'Aceptado', en_preparacion: 'En preparación', enviado: 'Enviado', entregado: 'Entregado', cancelado: 'Cancelado', incidencia: 'Con incidencia',
};

const transitions: Record<SubOrderState, readonly SubOrderState[]> = {
  pendiente: ['aceptado', 'cancelado', 'incidencia'],
  aceptado: ['en_preparacion', 'cancelado', 'incidencia'],
  en_preparacion: ['enviado', 'cancelado', 'incidencia'],
  incidencia: ['en_preparacion', 'cancelado'],
  enviado: ['entregado'],
  entregado: [],
  cancelado: [],
};

export function subOrderStateLabel(state: SubOrderState): string { return labels[state]; }
export function allowedSubOrderTransitions(state: SubOrderState): readonly SubOrderState[] { return transitions[state]; }
export function isSubOrderState(value: string): value is SubOrderState { return Object.hasOwn(labels, value); }
