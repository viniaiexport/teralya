import Link from 'next/link';
import type { ReactNode } from 'react';

const legalPages = [
  { href: '/legal/terminos', label: 'Términos y Condiciones' },
  { href: '/legal/privacidad', label: 'Privacidad' },
  { href: '/legal/cookies', label: 'Cookies' },
  { href: '/legal/mayoria-edad', label: 'Mayoría de edad y alcohol' },
  { href: '/legal/desistimiento', label: 'Desistimiento y cancelación' },
  { href: '/legal/reembolsos', label: 'Reembolsos e incidencias' },
] as const;

export default function LegalLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <section className="legal-page">
      <nav className="legal-nav" aria-label="Documentos legales">
        {legalPages.map((item) => (
          <Link key={item.href} href={item.href}>{item.label}</Link>
        ))}
      </nav>
      <article className="legal-article">{children}</article>
    </section>
  );
}
