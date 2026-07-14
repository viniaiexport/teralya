export const STRIPE_EVENT_TYPES = ['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired'] as const;
export type StripeEventType=(typeof STRIPE_EVENT_TYPES)[number];
export interface StripeCheckoutObject { id:string; payment_status:'paid'|'unpaid'|'no_payment_required'; amount_total:number; currency:string; metadata:Record<string,unknown> }
export interface StripeWebhookEvent { id:string; type:StripeEventType; livemode:boolean; data:{object:StripeCheckoutObject} }
export interface WebhookAck { event_id:string; status:'processed'|'duplicate'|'ignored'; pedido_id?:string; pago_estado?:'pendiente'|'autorizado'|'pagado'|'parcialmente_reembolsado'|'reembolsado'|'fallido'|'cancelado'; pedido_estado?:'pendiente_pago'|'pagado'|'en_preparacion'|'parcialmente_enviado'|'enviado'|'entregado'|'cancelado'|'devuelto' }
