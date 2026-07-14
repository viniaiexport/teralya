'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ConfirmationPoller({ intervalMs = 2500 }: { intervalMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, router]);
  return <p className="confirmation-wait" role="status">Estamos esperando la confirmación segura de Stripe…</p>;
}
