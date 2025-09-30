import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Favicon et icônes pour l'apparence dans les résultats de recherche */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo-192.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Métadonnées additionnelles pour le SEO */}
        <meta name="author" content="Xinvoice" />
        <meta name="robots" content="index, follow" />
        <meta
          name="googlebot"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />

        {/* Structured Data pour améliorer l'apparence dans Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Xinvoice - Assistant IA Juridique",
              description:
                "Plateforme de génération de documents juridiques français avec intelligence artificielle",
              url: "https://www.xinfinitylabs.com",
              logo: "https://www.xinfinitylabs.com/logo.png",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "EUR",
              },
              publisher: {
                "@type": "Organization",
                name: "Xinvoice",
                logo: {
                  "@type": "ImageObject",
                  url: "https://www.xinfinitylabs.com/logo.png",
                },
              },
            }),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
