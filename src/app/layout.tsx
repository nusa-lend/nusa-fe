import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { APP_NAME, APP_DESCRIPTION, APP_URL, APP_OG_IMAGE_URL, APP_ICON_URL } from '@/constants/appConstants';
import { getFarcasterEmbedMetaTags } from '@/lib/utils';
import Providers from '@/components/providers/Providers';
import './globals.css';

const sfUIText = localFont({
  src: [
    {
      path: '../../public/fonts/sfui2/SFUIText-Light.woff',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/sfui2/SFUIText-LightItalic.woff',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../../public/fonts/sfui2/SFUIText-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/sfui2/SFUIText-RegularItalic.woff',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/sfui2/SFUIText-Medium.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/sfui2/SFUIText-MediumItalic.woff',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/sfui2/SFUIText-Semibold.woff',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/sfui2/SFUIText-SemiboldItalic.woff',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../../public/fonts/sfui2/SFUIText-Bold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/sfui2/SFUIText-BoldItalic.woff',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../public/fonts/sfui2/SFUIText-Heavy.woff',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/sfui2/SFUIText-HeavyItalic.woff',
      weight: '800',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-sf-ui-text',
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: '%s | Nusa',
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    images: [
      {
        url: APP_OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: APP_NAME,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [APP_OG_IMAGE_URL],
  },
  icons: {
    icon: APP_ICON_URL,
    shortcut: APP_ICON_URL,
    apple: APP_ICON_URL,
  },
  manifest: '/manifest.json',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': APP_NAME,
    ...getFarcasterEmbedMetaTags(),
  },
};

export default function RootLayout({ children, params }: { children: React.ReactNode; params: any }) {
  return (
    <html lang="en" dir="" className={sfUIText.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
