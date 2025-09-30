import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Assistant IA Juridique - Xinvoice | Création de Documents Juridiques Français",
  description:
    "Créez vos documents juridiques français avec l'aide d'une intelligence artificielle conversationnelle. Contrats de travail, baux, procurations et plus. Export en DOCX, PDF et TXT.",
  keywords: [
    "assistant juridique",
    "IA",
    "documents juridiques",
    "contrat de travail",
    "bail d'habitation",
    "procuration",
    "contrat de vente",
    "droit français",
    "Xinvoice",
    "intelligence artificielle",
  ],
  authors: [{ name: "Xinvoice" }],
  creator: "Xinvoice",
  publisher: "Xinvoice",
  metadataBase: new URL("https://www.xinfinitylabs.com"),
  openGraph: {
    title: "Assistant IA Juridique - Xinvoice",
    description:
      "Créez vos documents juridiques français avec l'aide d'une intelligence artificielle conversationnelle",
    url: "/legal-documents",
    siteName: "Xinvoice",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Logo Xinvoice",
      },
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Xinvoice - Assistant IA Juridique",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Assistant IA Juridique - Xinvoice",
    description:
      "Créez vos documents juridiques français avec l'aide d'une intelligence artificielle conversationnelle",
    images: ["/icon.svg"],
    creator: "@xinvoice",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json",
};

export default function LegalDocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
