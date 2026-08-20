import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecommarceApp.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Ecommarce App';

// ── BASE METADATA (fallback for all pages) ─────────
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Online Store`,
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Shop the best products at great prices.',
  keywords: ['shop', 'ecommerce', 'online store'],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ── BUILD METADATA OBJECT ──────────────────────────
export function buildMeta(options: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  const {
    title,
    description,
    image,
    url,
    type = 'website',
    keywords = [],
    noIndex = false,
  } = options;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: type as 'website' | 'article',
      url: url ? `${SITE_URL}${url}` : SITE_URL,
      images: image ? [{ url: image, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
