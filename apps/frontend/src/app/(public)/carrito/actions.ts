'use server';
import { revalidatePath } from 'next/cache';
import { addBuyerItem, clearBuyerCart, mergeGuestCart, removeBuyerItem, updateBuyerItem } from '@/lib/cart/server';
import type { CartActionResult } from '@/lib/cart/contracts';

function refresh(result: CartActionResult): CartActionResult {
  if (result.ok) revalidatePath('/carrito');
  return result;
}

export async function addCartItemAction(wineId: string, quantity: number): Promise<CartActionResult> {
  return refresh(await addBuyerItem(wineId, quantity));
}

export async function mergeGuestCartAction(fusionId: string, items: Array<{ vino_id: string; cantidad_local: number }>): Promise<CartActionResult> {
  return refresh(await mergeGuestCart(fusionId, items));
}

export async function updateCartItemAction(itemId: string, quantity: number): Promise<CartActionResult> {
  return refresh(await updateBuyerItem(itemId, quantity));
}

export async function removeCartItemAction(itemId: string): Promise<CartActionResult> {
  return refresh(await removeBuyerItem(itemId));
}

export async function clearCartAction(): Promise<CartActionResult> {
  return refresh(await clearBuyerCart());
}
