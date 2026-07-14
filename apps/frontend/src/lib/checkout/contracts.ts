export type AddressUse = 'envio' | 'facturacion' | 'ambos';

export interface AddressInput {
  uso: AddressUse;
  nombre_destinatario: string;
  direccion: string;
  codigo_postal: string;
  ciudad: string;
  pais: string;
  nombre_identificativo?: string;
  empresa?: string;
  direccion_adicional?: string;
  provincia?: string;
  persona_contacto?: string;
  telefono?: string;
  email?: string;
  es_principal?: boolean;
}

export interface Address extends AddressInput {
  id: string;
  es_principal: boolean;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressSnapshot {
  nombre_destinatario: string;
  direccion: string;
  codigo_postal: string;
  ciudad: string;
  pais: string;
  empresa?: string;
  direccion_adicional?: string;
  provincia?: string;
  persona_contacto?: string;
  telefono?: string;
  email?: string;
}

export interface MoneyBreakdown {
  subtotal: string;
  gastos_envio: string;
  impuestos: string;
  descuentos: string;
  total: string;
  moneda: 'EUR';
}

export interface OrderPrepared {
  id: string;
  numero_pedido: string;
  estado: 'pendiente_pago';
  totales: MoneyBreakdown;
  direccion_envio_snapshot: AddressSnapshot;
  direccion_facturacion_snapshot: AddressSnapshot;
}

export interface CheckoutSession {
  pedido_id: string;
  checkout_url: string;
  session_expires_at: string;
  reused: boolean;
}

export type PaymentState = 'pendiente' | 'autorizado' | 'pagado' | 'parcialmente_reembolsado' | 'reembolsado' | 'fallido' | 'cancelado';
export type OrderState = 'pendiente_pago' | 'pagado' | 'en_preparacion' | 'parcialmente_enviado' | 'enviado' | 'entregado' | 'cancelado' | 'devuelto';

export interface OrderConfirmation {
  pedido_id: string;
  numero_pedido: string;
  pago_estado: PaymentState;
  pedido_estado: OrderState;
  confirmado_at?: string;
}

export interface CheckoutActionState {
  fieldErrors: Record<string, string[]>;
  formError?: string;
  requestId?: string;
  success?: string;
}

export const initialCheckoutState: CheckoutActionState = { fieldErrors: {} };

export function formatEuro(value: string): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount) : value;
}

export function addressLabel(address: Address): string {
  return address.nombre_identificativo ?? `${address.direccion}, ${address.ciudad}`;
}
