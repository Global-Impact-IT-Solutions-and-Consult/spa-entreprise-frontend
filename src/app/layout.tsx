import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { PwaRegister } from '@/components/pwa-register';
import { PageTransition } from '@/components/page-transition';
import { OfflineBanner } from '@/components/offline-banner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'iBookam',
  description: 'Book your premium wellness services',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'iBookam',
  },
};

export const viewport: Viewport = {
  themeColor: '#E89D24',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <Providers>
          <PageTransition>{children}</PageTransition>
          <OfflineBanner />
          <Toaster />
          <PwaRegister />
        </Providers>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
