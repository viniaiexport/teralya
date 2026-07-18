import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './styles.css';
import './premium-base.css';
import './premium-home.css';
import './premium-catalog.css';
import './premium-forms.css';
import './premium-responsive.css';

export const metadata: Metadata = {
  title: { default: 'Teralya · El futuro del vino', template: '%s · Teralya' },
  description: 'Vinos europeos seleccionados, vendidos y enviados directamente por sus bodegas.',
  themeColor: '#090811',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
