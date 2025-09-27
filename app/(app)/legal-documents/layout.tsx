import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assistant IA Juridique - Xinvoice",
  description:
    "Créez vos documents juridiques avec l'aide d'une intelligence artificielle conversationnelle. Export en DOCX, PDF et TXT.",
  keywords: [
    "assistant juridique",
    "IA",
    "documents juridiques",
    "contrat",
    "bail",
    "procuration",
    "vente",
  ],
};

export default function LegalDocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
