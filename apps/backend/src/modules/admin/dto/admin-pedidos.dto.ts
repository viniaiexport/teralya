import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export type OrderState =
  | 'pendiente_pago'
  | 'pagado'
  | 'en_preparacion'
  | 'parcialmente_enviado'
  | 'enviado'
  | 'entregado'
  | 'cancelado'
  | 'devuelto';
export type SubOrderState =
  | 'pendiente'
  | 'aceptado'
  | 'en_preparacion'
  | 'enviado'
  | 'entregado'
  | 'cancelado'
  | 'incidencia';

export class AdminPedidosQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size = 20;
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

export interface OrderLine {
  id: string;
  vino_id: string;
  nombre_vino: string;
  bodega: string;
  precio_unitario: string;
  cantidad: number;
  importe_total: string;
  anada?: number | null;
}

export interface Tracking {
  transportista?: string;
  numero_seguimiento?: string;
  fecha_preparacion?: string;
  fecha_envio?: string;
  fecha_entrega_prevista?: string;
  fecha_entrega_real?: string;
}

export interface OrderSummary {
  id: string;
  numero_pedido: string;
  estado: OrderState;
  total: string;
  moneda: 'EUR';
  created_at: string;
}

export interface SubOrderDetail {
  id: string;
  pedido_id: string;
  estado: SubOrderState;
  total: string;
  moneda: 'EUR';
  fecha_ultimo_cambio_estado: string;
  totales: {
    subtotal: string;
    gastos_envio: string;
    impuestos: string;
    total: string;
    moneda: 'EUR';
  };
  lineas: OrderLine[];
  direccion_envio_snapshot: AddressSnapshot;
  tracking: Tracking;
  pedido_estado?: OrderState;
}

export interface OrderAdminDetail extends OrderSummary {
  totales: {
    subtotal: string;
    gastos_envio: string;
    impuestos: string;
    descuentos: string;
    total: string;
    moneda: 'EUR';
  };
  direccion_envio_snapshot: AddressSnapshot;
  direccion_facturacion_snapshot: AddressSnapshot;
  lineas: OrderLine[];
  subpedidos: SubOrderDetail[];
  comprador_id: string;
}

export interface PageOrderSummary {
  items: OrderSummary[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}
