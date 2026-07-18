import type { ReactNode } from 'react';

export default function AccessLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <main className="screen-state">{children}</main>;
}
