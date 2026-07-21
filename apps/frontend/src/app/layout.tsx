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

export const metadata: Metadata = {
  title: { default: 'Teralya · El futuro del vino', template: '%s · Teralya' },
  description: 'Vinos europeos seleccionados, vendidos y enviados directamente por sus bodegas.',
  other: { 'teralya-build': process.env.NEXT_PUBLIC_BUILD_SHA ?? 'local' },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
