import type { ReactNode } from 'react';

type ScreenStateProps = Readonly<{
  title?: string;
  children: ReactNode;
  kind?: 'loading' | 'error' | 'empty' | 'info';
}>;

export function ScreenState({ title, children, kind = 'info' }: ScreenStateProps) {
  const role = kind === 'error' ? 'alert' : kind === 'loading' ? 'status' : undefined;

  return (
    <section className={`screen-state screen-state-${kind}`} role={role} aria-live={role ? 'polite' : undefined}>
      {title === undefined ? null : <h1>{title}</h1>}
      <div className="screen-state-content">{children}</div>
    </section>
  );
}
