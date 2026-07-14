import { IsUUID } from "class-validator";
export class CheckoutSessionRequestDto {
  @IsUUID() pedido_id!: string;
}
export interface CheckoutSessionDto {
  pedido_id: string;
  checkout_url: string;
  session_expires_at: string;
  reused: boolean;
}
