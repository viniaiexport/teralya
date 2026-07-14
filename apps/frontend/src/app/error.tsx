'use client';

export default function ErrorPage({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <section className="screen-state" role="alert">
      <h1>No hemos podido cargar esta pantalla.</h1>
      <button className="button primary" type="button" onClick={reset}>Reintentar</button>
    </section>
  );
}
