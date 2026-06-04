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
    "coconut shell charcoal supplier Indonesia",
    "charcoal briquette export",
    "wood pellet Indonesia",
    "Indonesian spices supplier",
    "Indonesian spices exporter",
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
  const productSchemas = [
    {
      name: "Coconut Shell Charcoal",
      description: "Indonesian coconut shell charcoal for BBQ, shisha, retail charcoal, and industrial buyer requirements.",
      category: "Coconut charcoal supplier Indonesia"
    },
    {
      name: "Charcoal Briquette",
      description: "Export-oriented Indonesian charcoal briquettes for BBQ, shisha, hospitality, and retail markets.",
      category: "Charcoal briquette exporter Indonesia"
    },
    {
      name: "Wood Pellet",
      description: "Indonesian biomass wood pellet supply for industrial heating, boiler use, and renewable fuel programs.",
      category: "Wood pellet supplier Indonesia"
    },
    {
      name: "Premium Indonesian Spices",
      description: "Selected Indonesian spices including vanilla, cinnamon, nutmeg, cloves, pepper, turmeric, ginger, and patchouli.",
      category: "Indonesian spices exporter"
    },
    {
      name: "Fresh Vegetables",
      description: "Fresh vegetables from Indonesia for food service, retail, catering, and recurring procurement needs.",
      category: "Fresh vegetables supplier Indonesia"
    },
    {
      name: "Eggs and Premium Rice",
      description: "Egg and premium rice supply for retail, food service, distributor, hotel, restaurant, and catering buyers.",
      category: "Indonesian food commodity supplier"
    }
  ];
  const faqSchemas = [
    {
      question: "What products does Garda Samudra Nusantara supply?",
      answer: "Garda Samudra Nusantara supplies fresh vegetables, eggs, premium rice, coconut shell charcoal, charcoal briquettes, wood pellets, and selected Indonesian spices."
    },
    {
      question: "Can GSN support international buyer inquiries?",
      answer: "Yes. GSN supports international buyer inquiries by reviewing destination country, product requirements, quantity, packaging needs, and specifications before preparing quotation follow-up."
    },
    {
      question: "Does GSN provide MOQ and sample information?",
      answer: "MOQ and sample availability vary by product category, supply condition, destination, and packaging requirement. Buyers should submit product, quantity, and destination details for accurate guidance."
    },
    {
      question: "How can buyers request a quotation from GSN?",
      answer: "Buyers can request a quotation through the inquiry form, WhatsApp, email, or NusaBot by sharing product interest, quantity, destination country, company information, and required specifications."
    },
    {
      question: "Which GSN divisions handle each product category?",
      answer: "Garda Fresh handles fresh vegetables, eggs, and rice. Garda Green handles coconut shell charcoal, charcoal briquette, and wood pellet. Garda Prime handles premium Indonesian spices."
    }
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
        publisher: {
          "@id": `${siteUrl}/#organization`
        },
        inLanguage: "en-US"
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        legalName: "Garda Samudra Nusantara",
        url: siteUrl,
        logo: `${siteUrl}/logos/gsn-clear-logo.png`,
        image: `${siteUrl}/og-gsn.jpg`,
        description,
        email: "gardasamudranusantara@gmail.com",
        telephone: "+62 851-9090-7967",
        foundingLocation: {
          "@type": "Place",
          name: "Gresik, Indonesia",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Gresik",
            addressCountry: "ID"
          }
        },
        areaServed: [
          { "@type": "Country", name: "Indonesia" },
          { "@type": "Place", name: "Global export markets" }
        ],
        knowsAbout: [
          "Indonesian commodity supplier",
          "Coconut shell charcoal supplier Indonesia",
          "Charcoal briquette export",
          "Wood pellet Indonesia",
          "Indonesian spices exporter",
          "Fresh vegetables supplier Indonesia",
          "International trading company Indonesia"
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: "gardasamudranusantara@gmail.com",
            telephone: "+62 851-9090-7967",
            availableLanguage: ["English", "Indonesian"],
            areaServed: "Worldwide"
          }
        ],
        sameAs: [
          "https://www.instagram.com/gsn.corp",
          "https://www.linkedin.com/search/results/companies/?keywords=Garda%20Samudra%20Nusantara"
        ]
      },
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}/#localbusiness`,
        name: siteName,
        url: siteUrl,
        image: `${siteUrl}/og-gsn.jpg`,
        description,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Gresik",
          addressCountry: "ID"
        },
        parentOrganization: {
          "@id": `${siteUrl}/#organization`
        }
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/#products`,
        name: "GSN Indonesian Commodity Product Categories",
        itemListElement: productSchemas.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            "@id": `${siteUrl}/#product-${index + 1}`,
            name: product.name,
            description: product.description,
            brand: {
              "@id": `${siteUrl}/#organization`
            },
            manufacturer: {
              "@id": `${siteUrl}/#organization`
            },
            category: product.category,
            offers: {
              "@type": "Offer",
              priceCurrency: "USD",
              priceSpecification: {
                "@type": "PriceSpecification",
                priceCurrency: "USD",
                description: "Quotation is prepared after product specification, quantity, packaging, and destination are confirmed."
              },
              availability: "https://schema.org/InStock",
              url: `${siteUrl}/#gsnformneo`,
              seller: {
                "@id": `${siteUrl}/#organization`
              }
            }
          }
        }))
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: faqSchemas.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      }
    ]
  };

  return (
    <html lang="en">
      <body>
        <Script
          id="gsn-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
