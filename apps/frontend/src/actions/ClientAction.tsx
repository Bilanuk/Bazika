'use client';

import { ReactNode } from 'react';

export default function ClientAction({
  children,
  action,
}: {
  children: ReactNode;
  action: () => void;
}) {
  return <span onClick={action}>{children}</span>;
}
