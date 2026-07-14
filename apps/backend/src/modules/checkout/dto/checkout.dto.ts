import { IsUUID } from "class-validator";
export class CheckoutRequestDto {
  @IsUUID() direccion_envio_id!: string;
  @IsUUID() direccion_facturacion_id!: string;
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
export interface OrderPrepared {
  id: string;
  numero_pedido: string;
  estado: "pendiente_pago";
  totales: {
    subtotal: string;
    gastos_envio: string;
    impuestos: "0.00";
    descuentos: string;
    total: string;
    moneda: "EUR";
  };
  direccion_envio_snapshot: AddressSnapshot;
  direccion_facturacion_snapshot: AddressSnapshot;
}
