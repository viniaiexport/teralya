'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { mergeGuestCartAction } from '@/app/(public)/carrito/actions';
import { CART_EVENT, LOCAL_CART_KEY } from '@/lib/cart/contracts';
import { clearGuestCart, guestBottleCount, parseGuestCart } from '@/lib/cart/guest-cart';

function subscribe(listener: () => void): () => void {
  window.addEventListener(CART_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => { window.removeEventListener(CART_EVENT, listener); window.removeEventListener('storage', listener); };
}
function snapshot(): string | null { return localStorage.getItem(LOCAL_CART_KEY); }
function serverSnapshot(): string | null { return null; }

export function CartLink({ buyerAuthenticated }: { buyerAuthenticated: boolean }) {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const cart = parseGuestCart(raw);
  const count = cart === undefined ? 0 : guestBottleCount(cart);
  const merging = useRef(false);
  const router = useRouter();
  useEffect(() => {
    if (!buyerAuthenticated || cart === undefined || cart.items.length === 0 || merging.current) return;
    merging.current = true;
    void mergeGuestCartAction(cart.fusion_id, cart.items.map(({ vino_id, cantidad_local }) => ({ vino_id, cantidad_local }))).then((result) => {
      merging.current = false;
      if (result.ok) {
        clearGuestCart(localStorage);
        window.dispatchEvent(new Event(CART_EVENT));
        router.refresh();
      }
    });
  }, [buyerAuthenticated, cart, router]);
  return <Link href="/carrito">Carrito{count > 0 ? <span className="cart-count" aria-label={`${count} botellas`}>{count}</span> : null}</Link>;
}
