import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './styles.css';
import './premium-base.css';
import './premium-home.css';
import './premium-professional.css';
import './premium-catalog.css';
import './premium-forms.css';
import './premium-responsive.css';
import './premium-fixes.css';

const siteDescription = 'Vinos europeos seleccionados, vendidos y enviados directamente por sus bodegas.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://teralya.eu'),
  title: { default: 'Teralya · El futuro del vino', template: '%s · Teralya' },
  description: siteDescription,
  applicationName: 'Teralya',
  category: 'shopping',
  keywords: ['vino europeo', 'bodegas', 'venta directa', 'vino con origen', 'comprar vino'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Teralya',
    title: 'Teralya · El futuro del vino',
    description: siteDescription,
  },
  twitter: {
    card: 'summary',
    title: 'Teralya · El futuro del vino',
    description: siteDescription,
  },
  robots: { index: true, follow: true },
  other: { 'teralya-build': process.env.NEXT_PUBLIC_BUILD_SHA ?? 'local' },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
