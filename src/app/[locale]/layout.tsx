import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from 'react-hot-toast';
import '../globals.css';

export const metadata: Metadata = {
  title: 'XM WebTrader',
  description: 'XM WebTrader - Online Trading Platform',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className="bg-surface-1 text-text-primary font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#21262d',
                color: '#e6edf3',
                border: '1px solid #30363d',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#26a69a', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef5350', secondary: '#fff' },
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
