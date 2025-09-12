import "./globals.css";
import QueryProvider from "./components/query-provider";
import { ToastProvider } from "./components/toast-provider";
import { NavigationHeader } from "./components/navigation-header";
import { Footer } from "./components/footer";
import { DocumentProvider } from "./context/document-context";
import { LocaleProvider } from "./lib/i18n/context";
import { Analytics } from "@vercel/analytics/next";
import { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Xinvoice - AI-Powered Document Generation Platform",
  description:
    "AI-powered document generation with advanced features, structured prompts, and multi-document support. Create professional invoices, NDAs, and more with intelligent automation.",
  keywords:
    "AI, document generation, invoice, NDA, automation, business documents, Xinvoice",
  authors: [{ name: "Xinvoice Team" }],
  creator: "Xinvoice",
  publisher: "Xinvoice",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Xinvoice - AI-Powered Document Generation Platform",
    description:
      "AI-powered document generation with advanced features, structured prompts, and multi-document support.",
    type: "website",
    locale: "en_US",
    siteName: "Xinvoice",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xinvoice - AI-Powered Document Generation Platform",
    description:
      "AI-powered document generation with advanced features, structured prompts, and multi-document support.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e40af",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased font-sans">
        <QueryProvider>
          <DocumentProvider>
            <LocaleProvider>
              <NavigationHeader />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <ToastProvider />
            </LocaleProvider>
          </DocumentProvider>
          <Analytics />
          <SpeedInsights />
        </QueryProvider>
      </body>
    </html>
  );
}
