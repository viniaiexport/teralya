'use client';

import { ScreenState } from '@/components/screen-state';

export default function ErrorPage({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <ScreenState kind="error" title="No hemos podido cargar esta pantalla">
      <p>Comprueba tu conexión o inténtalo de nuevo.</p>
      <button className="button primary" type="button" onClick={reset}>Reintentar</button>
    </ScreenState>
  );
}
