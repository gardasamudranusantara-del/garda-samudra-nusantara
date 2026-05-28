import "./globals.css";
import Script from "next/script";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.gardasamudranusantara.com";
const siteName = "Garda Samudra Nusantara";
const title = "Garda Samudra Nusantara | Indonesian Export & Commodity Supplier";
const description =
  "Garda Samudra Nusantara is an Indonesian international trading company supplying fresh food products, coconut shell charcoal, wood pellet, and premium spices for global buyers.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: siteName,
  keywords: [
    "Garda Samudra Nusantara",
    "Indonesia export company",
    "Indonesian commodity supplier",
    "fresh vegetables export Indonesia",
    "coconut shell charcoal supplier",
    "charcoal briquette export",
    "wood pellet Indonesia",
    "Indonesian spices supplier",
    "vanilla supplier Indonesia",
    "international trading company Indonesia"
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "International Trading",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName,
    title,
    description,
    images: [
      {
        url: "/og-gsn.jpg",
        width: 1200,
        height: 630,
        alt: "Garda Samudra Nusantara international trading and export company"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-gsn.jpg"]
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang="en">
      <body>
        {gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        {plausibleDomain ? (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        ) : null}
        {children}
      </body>
    </html>
  );
}
