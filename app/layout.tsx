import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Tabeza Crew',
  description: 'The waiter app for Tabeza hospitality venues',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Crew',
    startupImage: '/icons/icon.svg',
  },
  other: {
    // Prevent phone number detection on iOS
    'format-detection': 'telephone=no',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f59e0b' },
    { media: '(prefers-color-scheme: dark)',  color: '#f59e0b' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />

        {/* iOS PWA splash / status bar */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Crew" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* MS Tile */}
        <meta name="msapplication-TileColor" content="#f59e0b" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
