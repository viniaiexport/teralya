import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import type { AddressSnapshot } from "../../checkout/dto/checkout.dto.js";
export type OrderState =
  | "pendiente_pago"
  | "pagado"
  | "en_preparacion"
  | "parcialmente_enviado"
  | "enviado"
  | "entregado"
  | "cancelado"
  | "devuelto";
export class OrdersQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 20;
}
export interface OrderSummary {
  id: string;
  numero_pedido: string;
  estado: OrderState;
  total: string;
  moneda: "EUR";
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
export interface BuyerSubOrderSummary {
  id: string;
  estado: string;
  total: string;
  moneda: "EUR";
}
export interface OrderBuyerDetail extends OrderSummary {
  totales: {
    subtotal: string;
    gastos_envio: string;
    impuestos: string;
    descuentos: string;
    total: string;
    moneda: "EUR";
  };
  direccion_envio_snapshot: AddressSnapshot;
  direccion_facturacion_snapshot: AddressSnapshot;
  lineas: OrderLine[];
  subpedidos?: BuyerSubOrderSummary[];
}
export interface PageOrderSummary {
  items: OrderSummary[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}
