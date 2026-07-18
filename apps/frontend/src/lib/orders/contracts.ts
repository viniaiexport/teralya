import type { AddressSnapshot, MoneyBreakdown, OrderState } from '@/lib/checkout/contracts';

export interface Page<T> {
  items: T[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface OrderSummary {
  id: string;
  numero_pedido: string;
  estado: OrderState;
  total: string;
  moneda: 'EUR';
  created_at: string;
}

export interface OrderLine {
  id: string;
  vino_id: string;
  nombre_vino: string;
  bodega: string;
  precio_unitario: string;
  cantidad: number;
  importe_total: string;
  anada?: number;
}

export type OrderCancellationStatus = 'procesando' | 'completada' | 'fallida';
export type RefundStatus = 'pending' | 'requires_action' | 'succeeded' | 'failed' | 'canceled';

export interface OrderCancellationSummary {
  estado: OrderCancellationStatus;
  reembolso_estado?: RefundStatus;
  solicitada_at: string;
  completada_at?: string;
}

export interface OrderCancellationResult extends OrderCancellationSummary {
  pedido_id: string;
  pedido_estado: OrderState;
  pago_estado: 'pagado' | 'reembolsado';
}

export interface OrderBuyerDetail extends OrderSummary {
  puede_cancelar: boolean;
  cancelacion?: OrderCancellationSummary;
  totales: MoneyBreakdown;
  direccion_envio_snapshot: AddressSnapshot;
  direccion_facturacion_snapshot: AddressSnapshot;
  lineas: OrderLine[];
}

const orderStateLabels: Record<OrderState, string> = {
  pendiente_pago: 'Pendiente de pago',
  pagado: 'Pagado',
  en_preparacion: 'En preparación',
  parcialmente_enviado: 'Parcialmente enviado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  devuelto: 'Devuelto',
};

export function orderStateLabel(state: OrderState): string {
  return orderStateLabels[state];
}

export function formatOrderDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' }).format(date);
}
