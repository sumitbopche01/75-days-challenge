/**
 * Root Layout Component
 * Main layout for the 75 Hard Challenge app with PWA support
 */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: '75 Hard Challenge Tracker',
    description: 'Track your 75 Hard Challenge progress and build mental toughness with this comprehensive PWA app.',
    keywords: ['75 hard', 'challenge tracker', 'mental toughness', 'fitness', 'self improvement'],
    authors: [{ name: '75 Hard Tracker' }],
    creator: '75 Hard Tracker',
    publisher: '75 Hard Tracker',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://75hard-challenge.app'),
    openGraph: {
        title: '75 Hard Challenge Tracker',
        description: 'Track your 75 Hard Challenge progress and build mental toughness',
        type: 'website',
        locale: 'en_US',
        siteName: '75 Hard Challenge Tracker',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: '75 Hard Challenge Tracker',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: '75 Hard Challenge Tracker',
        description: 'Track your 75 Hard Challenge progress and build mental toughness',
        images: ['/twitter-image.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    manifest: '/manifest.json',
    icons: {
        icon: [
            { url: '/icon.svg', type: 'image/svg+xml' },
        ],
        apple: [
            { url: '/apple-touch-icon.svg', type: 'image/svg+xml' },
        ],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: '75 Hard',
    },
    other: {
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'apple-mobile-web-app-title': '75 Hard',
        'application-name': '75 Hard Challenge',
        'msapplication-TileColor': '#0ea5e9',
        'msapplication-TileImage': '/icon.svg',
        'theme-color': '#0ea5e9',
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
        { media: '(prefers-color-scheme: dark)', color: '#0ea5e9' },
    ],
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    interactiveWidget: 'resizes-content',
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <head>
                {/* Viewport and mobile optimizations */}
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />

                {/* Additional PWA meta tags */}
                <meta name="application-name" content="75 Hard Challenge" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="75 Hard" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="msapplication-config" content="/browserconfig.xml" />
                <meta name="msapplication-TileColor" content="#0ea5e9" />
                <meta name="msapplication-tap-highlight" content="no" />

                {/* Prevent zoom on input focus (iOS) */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                        @media screen and (max-width: 768px) {
                            input, textarea, select {
                                font-size: 16px !important;
                            }
                        }
                    `
                }} />

                {/* Preload critical resources */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                {/* Favicon and touch icons */}
                <link rel="icon" type="image/svg+xml" href="/icon.svg" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />

                {/* Manifest link */}
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body className={`${inter.className} antialiased`}>
                <div id="root" className="min-h-screen bg-background">
                    {/* Skip to main content for accessibility */}
                    <a
                        href="#main-content"
                        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
                    >
                        Skip to main content
                    </a>

                    {/* Main app content */}
                    <main id="main-content" className="min-h-screen">
                        {children}
                    </main>

                    {/* Service worker registration script */}
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              `,
                        }}
                    />
                </div>

                {/* Install prompt for PWA */}
                <div id="install-prompt" className="hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg z-50 border-b border-blue-500">
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">Install 75 Hard App</h3>
                                    <p className="text-xs text-blue-100">Get the full app experience</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button id="install-button" className="px-3 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-md hover:bg-blue-50 transition-colors">
                                    Install
                                </button>
                                <button id="install-close" className="p-1 hover:bg-white/20 rounded-md transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PWA install prompt script */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              let deferredPrompt;
              const installPrompt = document.getElementById('install-prompt');
              const installButton = document.getElementById('install-button');
              const installClose = document.getElementById('install-close');
              
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                if (installPrompt) {
                  installPrompt.classList.remove('hidden');
                  document.body.style.paddingTop = '64px';
                }
              });
              
              if (installButton) {
                installButton.addEventListener('click', async () => {
                  if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    deferredPrompt = null;
                    if (installPrompt) {
                      installPrompt.classList.add('hidden');
                      document.body.style.paddingTop = '0';
                    }
                  }
                });
              }
              
              if (installClose) {
                installClose.addEventListener('click', () => {
                  if (installPrompt) {
                    installPrompt.classList.add('hidden');
                    document.body.style.paddingTop = '0';
                  }
                });
              }
              
              window.addEventListener('appinstalled', () => {
                if (installPrompt) {
                  installPrompt.classList.add('hidden');
                  document.body.style.paddingTop = '0';
                }
                deferredPrompt = null;
              });
            `,
                    }}
                />
            </body>
        </html>
    );
} 