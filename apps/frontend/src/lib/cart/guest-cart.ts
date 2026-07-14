import { CART_EVENT, LOCAL_CART_KEY, MAX_CART_LINES, MAX_QUANTITY, type GuestCart, type GuestCartItem, type GuestWineSnapshot, isQuantity, isUuid } from './contracts';

function validMoney(value: unknown): value is string {
  return typeof value === 'string' && /^(0|[1-9][0-9]{0,7})\.[0-9]{2}$/.test(value);
}

function parseItem(value: unknown): GuestCartItem | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const item = value as Partial<GuestCartItem>;
  const wine = item.vino as Partial<GuestWineSnapshot> | undefined;
  if (!isUuid(item.vino_id ?? '') || !isQuantity(item.cantidad_local ?? 0) || wine === undefined) return undefined;
  if (wine.id !== item.vino_id || typeof wine.nombre !== 'string' || wine.nombre.length < 1 || wine.nombre.length > 200) return undefined;
  if (typeof wine.bodega !== 'string' || wine.bodega.length < 1 || wine.bodega.length > 200 || !validMoney(wine.precio)) return undefined;
  if (wine.imagen_url !== undefined && (typeof wine.imagen_url !== 'string' || wine.imagen_url.length > 2048)) return undefined;
  if (wine.imagen_alt !== undefined && (typeof wine.imagen_alt !== 'string' || wine.imagen_alt.length > 300)) return undefined;
  return item as GuestCartItem;
}

export function parseGuestCart(raw: string | null): GuestCart | undefined {
  if (raw === null || raw.length > 150_000) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return undefined;
    const cart = value as Partial<GuestCart>;
    if (!isUuid(cart.fusion_id ?? '') || !Array.isArray(cart.items) || cart.items.length > MAX_CART_LINES) return undefined;
    const parsed = cart.items.map(parseItem);
    if (parsed.some((item) => item === undefined)) return undefined;
    const items = parsed as GuestCartItem[];
    if (new Set(items.map((item) => item.vino_id)).size !== items.length) return undefined;
    return { fusion_id: cart.fusion_id as string, items };
  } catch {
    return undefined;
  }
}

export function emptyGuestCart(fusionId: string): GuestCart {
  if (!isUuid(fusionId)) throw new Error('fusion_id inválido');
  return { fusion_id: fusionId, items: [] };
}

export function addGuestItem(cart: GuestCart, wine: GuestWineSnapshot, quantity: number): GuestCart {
  if (!isUuid(wine.id) || !isQuantity(quantity)) throw new Error('Línea de carrito inválida');
  const existing = cart.items.find((item) => item.vino_id === wine.id);
  if (existing !== undefined) {
    const nextQuantity = Math.min(MAX_QUANTITY, existing.cantidad_local + quantity);
    return { ...cart, items: cart.items.map((item) => item.vino_id === wine.id ? { ...item, cantidad_local: nextQuantity, vino: wine } : item) };
  }
  if (cart.items.length >= MAX_CART_LINES) throw new Error('El carrito admite un máximo de 100 vinos.');
  return { ...cart, items: [...cart.items, { vino_id: wine.id, cantidad_local: quantity, vino: wine }] };
}

export function updateGuestQuantity(cart: GuestCart, wineId: string, quantity: number): GuestCart {
  if (!isUuid(wineId) || !isQuantity(quantity)) throw new Error('Cantidad inválida');
  return { ...cart, items: cart.items.map((item) => item.vino_id === wineId ? { ...item, cantidad_local: quantity } : item) };
}

export function removeGuestItem(cart: GuestCart, wineId: string): GuestCart {
  return { ...cart, items: cart.items.filter((item) => item.vino_id !== wineId) };
}

export function guestBottleCount(cart: GuestCart): number {
  return cart.items.reduce((total, item) => total + item.cantidad_local, 0);
}

export function readGuestCart(storage: Pick<Storage, 'getItem' | 'removeItem'>, fusionId: () => string): GuestCart {
  const parsed = parseGuestCart(storage.getItem(LOCAL_CART_KEY));
  if (parsed !== undefined) return parsed;
  storage.removeItem(LOCAL_CART_KEY);
  return emptyGuestCart(fusionId());
}

export function writeGuestCart(storage: Pick<Storage, 'setItem'>, cart: GuestCart): void {
  storage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
}

export function clearGuestCart(storage: Pick<Storage, 'removeItem'>): void {
  storage.removeItem(LOCAL_CART_KEY);
}

export function announceCartChange(): void {
  window.dispatchEvent(new Event(CART_EVENT));
}
