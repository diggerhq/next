import '@/styles/globals.css';
import '@/styles/prosemirror.css';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Metadata } from 'next';
import 'server-only';
import { AppProviders } from './AppProviders';

export const metadata: Metadata = {
  icons: {
    icon: '/images/favicon-logo-digger.ico?v=3',
  },
  title: 'Digger',
  description: 'Digger',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? `https://usenextbase.com`,
  ),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.className} ${GeistMono.variable}`} suppressHydrationWarning>
      <head></head>
      <body className="">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
