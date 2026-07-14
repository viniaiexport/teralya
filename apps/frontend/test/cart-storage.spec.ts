import { describe, expect, it } from 'vitest';
import { LOCAL_CART_KEY } from '../src/lib/cart/contracts';
import { addGuestItem, emptyGuestCart, guestBottleCount, parseGuestCart, readGuestCart, removeGuestItem, updateGuestQuantity, writeGuestCart } from '../src/lib/cart/guest-cart';

const fusion='11111111-1111-4111-8111-111111111111';
const wine={id:'22222222-2222-4222-8222-222222222222',nombre:'Reserva',bodega:'Bodega Teralya',precio:'12.50'};
function memory(initial?:string){let value=initial;return{getItem:()=>value??null,setItem:(_key:string,next:string)=>{value=next},removeItem:()=>{value=undefined},value:()=>value}};

describe('carrito local FE-005',()=>{
  it('añade e incrementa una línea sin duplicarla',()=>{let cart=addGuestItem(emptyGuestCart(fusion),wine,2);cart=addGuestItem(cart,wine,3);expect(cart.items).toHaveLength(1);expect(cart.items[0]?.cantidad_local).toBe(5);expect(guestBottleCount(cart)).toBe(5)});
  it('actualiza y elimina líneas de forma inmutable',()=>{const original=addGuestItem(emptyGuestCart(fusion),wine,2);const updated=updateGuestQuantity(original,wine.id,4);expect(original.items[0]?.cantidad_local).toBe(2);expect(updated.items[0]?.cantidad_local).toBe(4);expect(removeGuestItem(updated,wine.id).items).toEqual([])});
  it('rechaza JSON manipulado y cantidades fuera de contrato',()=>{expect(parseGuestCart(JSON.stringify({fusion_id:fusion,items:[{vino_id:wine.id,cantidad_local:1000,vino:wine}]}))).toBeUndefined();expect(()=>updateGuestQuantity(addGuestItem(emptyGuestCart(fusion),wine,1),wine.id,0)).toThrow('Cantidad')});
  it('rechaza vino_id duplicado antes de fusionar',()=>{const item={vino_id:wine.id,cantidad_local:1,vino:wine};expect(parseGuestCart(JSON.stringify({fusion_id:fusion,items:[item,item]}))).toBeUndefined()});
  it('persiste únicamente bajo la clave versionada y recupera contenido válido',()=>{const storage=memory();const cart=addGuestItem(emptyGuestCart(fusion),wine,2);writeGuestCart(storage as never,cart);expect(storage.value()).toContain(wine.id);expect(readGuestCart(storage as never,()=>fusion)).toEqual(cart);expect(LOCAL_CART_KEY).toBe('teralya_guest_cart_v1')});
});
