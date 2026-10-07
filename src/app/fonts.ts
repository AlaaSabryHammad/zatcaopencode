import localFont from 'next/font/local';

/** Font files are copied from design/design-system/fonts by `pnpm icons:sync`. */
export const inter = localFont({
  src: '../../public/fonts/Inter-Variable-latin.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const plexArabic = localFont({
  src: [
    { path: '../../public/fonts/IBMPlexSansArabic-400-arabic.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/IBMPlexSansArabic-500-arabic.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/IBMPlexSansArabic-600-arabic.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/IBMPlexSansArabic-700-arabic.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-plex-arabic',
  preload: true,
});

export const plexMono = localFont({
  src: [
    { path: '../../public/fonts/IBMPlexMono-400-latin.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/IBMPlexMono-500-latin.woff2', weight: '500', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-plex-mono',
  preload: false,
});

export const fontVariables = `${inter.variable} ${plexArabic.variable} ${plexMono.variable}`;
