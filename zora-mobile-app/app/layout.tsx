import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/components/AuthProvider';
import '@/app/globals.css';
import './mobile-overrides.css';
import { CapacitorBootstrap } from '../components/CapacitorBootstrap';

// Mirrors zora-app/app/layout.tsx with two deliberate differences:
//  1. No <Analytics /> — @vercel/analytics beacons are pointless from a bundled
//     APK and would just fail silently on every screen.
//  2. <CapacitorBootstrap /> — native status bar, splash, keyboard and Android
//     hardware-back wiring.

export const metadata: Metadata = {
  title: 'Zora — by Xorvion',
  description: 'Intelligence beyond chat. Built by Xorvion.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#060607',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <CapacitorBootstrap />
      </body>
    </html>
  );
}
