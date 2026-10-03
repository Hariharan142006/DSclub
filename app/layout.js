import './globals.css';
import { ThemeProvider } from '../components/atoms/ThemeProvider/ThemeProvider';
import Navbar from '../components/organisms/Navbar/Navbar';
import Footer from '../components/organisms/Footer/Footer';
import NetworkBackground from '../components/atoms/NetworkBackground/NetworkBackground';
import JsonLd from '../components/atoms/JsonLd/JsonLd';
import FaqJsonLd from '../components/molecules/FaqJsonLd/FaqJsonLd';
import EventsJsonLd from '../components/molecules/EventsJsonLd/EventsJsonLd';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  metadataBase: new URL('https://dsc-panimalar-ads.in'),
  title: {
    default: 'Data Science Club PEC',
    template: '%s | Data Science Club PEC',
  },
  description:
    'The Top Club in Panimalar and Best Club in Panimalar Engineering College — Turning Curiosity into Data-Driven Innovation. The official Data Science Club of the Department of AI & Data Science at Panimalar Engineering College, Chennai. Join hackathons, workshops, coding challenges & more.',
  keywords: [
    'Data Science Club',
    'Panimalar Engineering College',
    'AI',
    'Artificial Intelligence',
    'Data Science',
    'Machine Learning',
    'Deep Learning',
    'Hackathon',
    'Coding Challenges',
    'PEC Chennai',
    'DSC PEC',
    'Data Analytics',
    'Neural Networks',
    'Top Club in Panimalar',
    'Top Club in Panimalar Engineering College',
    'Best Club in Panimalar Engineering College',
    'Best Club in Panimalar',
    'Best Tech Club in PEC',
  ],
  authors: [{ name: 'Data Science Club, Panimalar Engineering College' }],
  creator: 'Data Science Club — PEC',
  publisher: 'Data Science Club — Panimalar Engineering College',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://dsc-panimalar-ads.in',
    siteName: 'Data Science Club – PEC',
    title: 'Top Club in Panimalar Engineering College | Data Science Club (DSC PEC)',
    description:
      'The Top Club in Panimalar and Best Club in Panimalar Engineering College — Turning Curiosity into Data-Driven Innovation. Hackathons, workshops, coding challenges & more from the AI & Data Science department.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top Club in Panimalar Engineering College | Data Science Club (DSC PEC)',
    description:
      'The Top Club in Panimalar and Best Club in Panimalar Engineering College — Turning Curiosity into Data-Driven Innovation. Hackathons, workshops, coding challenges & more.',
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
  alternates: {
    canonical: 'https://dsc-panimalar-ads.in',
  },
  icons: {
    icon: '/ds logo.jpg',
    apple: '/ds logo.jpg',
  },
  category: 'education',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd />
        <FaqJsonLd />
        <EventsJsonLd />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-Q01WQNWKHQ"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-Q01WQNWKHQ', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <NetworkBackground />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

