import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FLOWBASE — From Spreadsheet to Software',
  description:
    'FLOWBASE builds business software, internal tools and workflow automation for businesses moving beyond Excel and manual processes.',
  keywords: [
    'business software',
    'custom software',
    'workflow automation',
    'Excel automation',
    'internal tools',
    'business management software',
    'AI software development',
  ],
  openGraph: {
    title: 'FLOWBASE — From Spreadsheet to Software',
    description:
      'AI-native software studio. We turn spreadsheets and manual processes into business software.',
    type: 'website',
    siteName: 'FLOWBASE',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F8F9FB',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
