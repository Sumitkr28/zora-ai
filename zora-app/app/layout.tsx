import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zora — by Xorvion',
  description: 'Intelligence beyond chat. Built by Xorvion.',
};

// Explicit viewport so iOS safe-area env() values work for the chat composer.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
