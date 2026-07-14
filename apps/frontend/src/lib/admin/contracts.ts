import type { MoneyBreakdown } from '@/lib/checkout/contracts';
import type { OrderLine, OrderSummary, Page } from '@/lib/orders/contracts';
import type { SubOrderDetail } from '@/lib/suborders/contracts';

export interface AdminDashboard { ventas_dia:{importe:string;moneda:'EUR';num_pedidos:number};pedidos_pendientes:number }
export interface AdminOrderDetail extends OrderSummary { totales:MoneyBreakdown;direccion_envio_snapshot:{nombre_destinatario:string;direccion:string;codigo_postal:string;ciudad:string;pais:string;empresa?:string;direccion_adicional?:string;provincia?:string};direccion_facturacion_snapshot:{nombre_destinatario:string;direccion:string;codigo_postal:string;ciudad:string;pais:string;empresa?:string;direccion_adicional?:string;provincia?:string};lineas:OrderLine[];subpedidos:SubOrderDetail[];comprador_id?:string }
export type AdminOrderPage=Page<OrderSummary>;
