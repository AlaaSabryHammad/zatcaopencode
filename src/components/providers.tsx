'use client';

import * as React from 'react';
import { ThemeProvider } from 'next-themes';
import { DirectionProvider } from '@radix-ui/react-direction';
import { ToastProvider } from '@/components/zw';

export function Providers({ dir, children }: { dir: 'rtl' | 'ltr'; children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="zw-theme"
    >
      <DirectionProvider dir={dir}>
        <ToastProvider>{children}</ToastProvider>
      </DirectionProvider>
    </ThemeProvider>
  );
}
