import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Générateur de Documents Juridiques Français | Xinvoice",
  description:
    "Créez facilement vos documents juridiques français : contrats de travail, baux, contrats de vente, procurations. Interface conversationnelle guidée.",
  keywords:
    "documents juridiques, contrat travail, bail habitation, contrat vente, procuration, droit français, générateur automatique",
  openGraph: {
    title: "Générateur de Documents Juridiques Français",
    description:
      "Assistant conversationnel pour créer des documents juridiques conformes au droit français",
    type: "website",
  },
};

export default function LegalDocumentsPage() {
  // Redirect to the new AI chat interface
  redirect("/legal-documents/chat");
}
