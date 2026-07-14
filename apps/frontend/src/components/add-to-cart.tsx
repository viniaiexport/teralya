'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { addCartItemAction } from '@/app/(public)/carrito/actions';
import { addGuestItem, announceCartChange, readGuestCart, writeGuestCart } from '@/lib/cart/guest-cart';
import type { GuestWineSnapshot } from '@/lib/cart/contracts';

function uuid(): string { return crypto.randomUUID(); }

export function AddToCart({ authenticated, available, wine }: { authenticated: boolean; available: boolean; wine: GuestWineSnapshot }) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();
  function add(): void {
    setMessage(undefined);
    if (!authenticated) {
      try {
        const cart = readGuestCart(localStorage, uuid);
        writeGuestCart(localStorage, addGuestItem(cart, wine, quantity));
        announceCartChange();
        setMessage('Añadido al carrito.');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'No se ha podido añadir.');
      }
      return;
    }
    startTransition(async () => {
      const result = await addCartItemAction(wine.id, quantity);
      setMessage(result.ok ? 'Añadido al carrito.' : result.message);
      if (result.ok) announceCartChange();
    });
  }
  if (!available) return null;
  return <div className="add-to-cart"><label htmlFor="wine-quantity">Cantidad</label><select id="wine-quantity" onChange={(event) => setQuantity(Number(event.target.value))} value={quantity}>{Array.from({ length: 12 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}</select><button className="button primary" disabled={pending} onClick={add} type="button">{pending ? 'Añadiendo…' : 'Añadir al carrito'}</button>{message !== undefined && <p aria-live="polite" className="cart-add-message">{message} {message === 'Añadido al carrito.' && <Link href="/carrito">Ver carrito</Link>}</p>}</div>;
}
