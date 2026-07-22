import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { getLocale } from '@/lib/i18n/server';
import './styles.css';
import './premium-base.css';
import './premium-home.css';
import './premium-professional.css';
import './premium-catalog.css';
import './premium-forms.css';
import './premium-responsive.css';
import './premium-fixes.css';

const siteDescription = 'Vinos europeos seleccionados, vendidos y enviados directamente por sus bodegas.';
const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://teralya.eu');
const allowIndexing = siteUrl.hostname === 'teralya.eu' || siteUrl.hostname === 'www.teralya.eu';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
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
  robots: { index: allowIndexing, follow: allowIndexing },
  other: { 'teralya-build': process.env.NEXT_PUBLIC_BUILD_SHA ?? 'local' },
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
