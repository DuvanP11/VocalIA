import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VocalIA — Tu Profesor de Canto con IA',
  description: 'Aprende a cantar desde cero con inteligencia artificial. Análisis de voz en tiempo real, lecciones personalizadas y entrenamiento progresivo.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'VocalIA' },
  keywords: ['cantar', 'canto', 'voz', 'inteligencia artificial', 'vocal', 'música', 'afinación'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080a12',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full" data-scroll-behavior="smooth">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full bg-[#080a12] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
