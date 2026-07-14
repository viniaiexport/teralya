export const LOCAL_CART_KEY = 'teralya_guest_cart_v1';
export const CART_EVENT = 'teralya:cart-changed';
export const MAX_CART_LINES = 100;
export const MAX_QUANTITY = 999;

export interface GuestWineSnapshot {
  id: string;
  nombre: string;
  bodega: string;
  precio: string;
  imagen_url?: string;
  imagen_alt?: string;
}

export interface GuestCartItem {
  vino_id: string;
  cantidad_local: number;
  vino: GuestWineSnapshot;
}

export interface GuestCart {
  fusion_id: string;
  items: GuestCartItem[];
}

export interface WineSummary {
  id: string;
  nombre_comercial: string;
  precio: string;
  moneda: 'EUR';
  disponible_venta: boolean;
  bodega: { id: string; nombre_comercial: string };
  imagen_principal?: { url: string; alt_text: string };
}

export interface CartItem {
  id: string;
  vino: WineSummary;
  cantidad: number;
  precio_unitario: string;
  importe_total: string;
  estado: 'disponible' | 'sin_stock' | 'descatalogado' | 'precio_modificado';
}

export interface Cart {
  id: string;
  estado: 'activo' | 'convertido' | 'abandonado' | 'cancelado';
  items: CartItem[];
  num_productos: number;
  num_botellas: number;
  subtotal: string;
  gastos_envio: string;
  descuentos: string;
  total: string;
  moneda: 'EUR';
  updated_at: string;
}

export interface FusionLine {
  vino_id: string;
  estado: 'fusionada' | 'limitada' | 'descartada';
  cantidad_resultante?: number;
  motivo?: string;
}

export interface CartMutationResponse {
  carrito: Cart;
  fusion?: FusionLine[];
}

export interface CartActionResult {
  ok: boolean;
  carrito?: Cart;
  fusion?: FusionLine[];
  message?: string;
  requestId?: string;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isQuantity(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 1 && value <= MAX_QUANTITY;
}
