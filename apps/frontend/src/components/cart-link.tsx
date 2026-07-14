'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { mergeGuestCartAction } from '@/app/(public)/carrito/actions';
import { CART_EVENT, LOCAL_CART_KEY } from '@/lib/cart/contracts';
import { clearGuestCart, guestBottleCount, parseGuestCart } from '@/lib/cart/guest-cart';

export function CartLink({ buyerAuthenticated }: { buyerAuthenticated: boolean }) {
  const [count, setCount] = useState(0);
  const merging = useRef(false);
  const router = useRouter();
  const synchronize = useCallback(async () => {
    const cart = parseGuestCart(localStorage.getItem(LOCAL_CART_KEY));
    setCount(cart === undefined ? 0 : guestBottleCount(cart));
    if (!buyerAuthenticated || cart === undefined || cart.items.length === 0 || merging.current) return;
    merging.current = true;
    const result = await mergeGuestCartAction(cart.fusion_id, cart.items.map(({ vino_id, cantidad_local }) => ({ vino_id, cantidad_local })));
    merging.current = false;
    if (result.ok) {
      clearGuestCart(localStorage);
      setCount(0);
      router.refresh();
    }
  }, [buyerAuthenticated, router]);
  useEffect(() => {
    void synchronize();
    const listener = () => { void synchronize(); };
    window.addEventListener(CART_EVENT, listener);
    window.addEventListener('storage', listener);
    return () => { window.removeEventListener(CART_EVENT, listener); window.removeEventListener('storage', listener); };
  }, [synchronize]);
  return <Link href="/carrito">Carrito{count > 0 ? <span className="cart-count" aria-label={`${count} botellas`}>{count}</span> : null}</Link>;
}
