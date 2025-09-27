import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import jsPDF from 'jspdf';

interface DocumentData {
  type: string;
  content: string;
  fields: Record<string, any>;
  aiSuggestions: Record<string, string[]>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ExportRequest {
  documentData: DocumentData;
  format: 'docx' | 'pdf' | 'txt';
  conversationHistory: ChatMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();
    const { documentData, format, conversationHistory } = body;

    if (!documentData) {
      return NextResponse.json(
        { success: false, error: 'Données du document manquantes' },
        { status: 400 }
      );
    }

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    // Generate document content with AI suggestions
    const fullDocumentContent = await generateDocumentWithAI(documentData, conversationHistory);

    switch (format) {
      case 'docx':
        buffer = await generateDOCX(fullDocumentContent, documentData);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = `${sanitizeFilename(documentData.type)}_${new Date().toISOString().split('T')[0]}.docx`;
        break;

      case 'pdf':
        buffer = await generatePDF(fullDocumentContent, documentData);
        contentType = 'application/pdf';
        filename = `${sanitizeFilename(documentData.type)}_${new Date().toISOString().split('T')[0]}.pdf`;
        break;

      case 'txt':
        buffer = Buffer.from(fullDocumentContent, 'utf-8');
        contentType = 'text/plain';
        filename = `${sanitizeFilename(documentData.type)}_${new Date().toISOString().split('T')[0]}.txt`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Format non supporté' },
          { status: 400 }
        );
    }

    return new NextResponse(buffer as unknown as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error exporting document:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'export du document' },
      { status: 500 }
    );
  }
}

async function generateDocumentWithAI(documentData: DocumentData, conversationHistory: ChatMessage[]): Promise<string> {
  // Generate comprehensive document content based on AI conversation
  const docType = documentData.type;
  const fields = documentData.fields;
  const suggestions = documentData.aiSuggestions;
  
  let content = '';

  // Header with document type
  content += `${docType.toUpperCase()}\n`;
  content += '='.repeat(docType.length) + '\n\n';

  // Add date and generation info
  content += `Document généré le : ${new Date().toLocaleDateString('fr-FR')}\n`;
  content += `Généré par : Assistant IA Juridique Xinvoice\n\n`;

  // Generate document content based on type
  if (docType.toLowerCase().includes('contrat')) {
    content += await generateContractContent(fields, suggestions, conversationHistory);
  } else if (docType.toLowerCase().includes('bail')) {
    content += await generateLeaseContent(fields, suggestions, conversationHistory);
  } else if (docType.toLowerCase().includes('vente')) {
    content += await generateSaleContent(fields, suggestions, conversationHistory);
  } else if (docType.toLowerCase().includes('procuration')) {
    content += await generatePowerOfAttorneyContent(fields, suggestions, conversationHistory);
  } else {
    content += await generateGenericDocumentContent(fields, suggestions, conversationHistory);
  }

  // Add AI suggestions section
  if (Object.keys(suggestions).length > 0) {
    content += '\n\n' + '='.repeat(50) + '\n';
    content += 'SUGGESTIONS DE L\'IA\n';
    content += '='.repeat(50) + '\n\n';
    
    for (const [field, fieldSuggestions] of Object.entries(suggestions)) {
      content += `${field.toUpperCase()}:\n`;
      fieldSuggestions.forEach(suggestion => {
        content += `  • ${suggestion}\n`;
      });
      content += '\n';
    }
  }

  // Add legal disclaimer
  content += '\n' + '='.repeat(50) + '\n';
  content += 'AVERTISSEMENT LÉGAL\n';
  content += '='.repeat(50) + '\n\n';
  content += 'Ce document a été généré automatiquement par un assistant IA.\n';
  content += 'Il est fortement recommandé de faire vérifier ce document par un professionnel du droit\n';
  content += 'avant signature et utilisation. L\'IA peut avoir omis certains éléments importants\n';
  content += 'spécifiques à votre situation.\n\n';
  content += 'Date de génération : ' + new Date().toLocaleString('fr-FR') + '\n';

  return content;
}

async function generateContractContent(fields: Record<string, any>, suggestions: Record<string, string[]>, history: ChatMessage[]): Promise<string> {
  let content = 'CONTRAT DE TRAVAIL\n\n';
  
  content += 'Entre les soussignés :\n\n';
  
  content += 'L\'EMPLOYEUR :\n';
  content += `${fields.employeur_nom || '[NOM DE L\'EMPLOYEUR À COMPLÉTER]'}\n`;
  content += `${fields.employeur_adresse || '[ADRESSE À COMPLÉTER]'}\n`;
  if (fields.employeur_siret) {
    content += `SIRET : ${fields.employeur_siret}\n`;
  }
  content += '\nci-après dénommé "l\'Employeur", d\'une part,\n\n';
  
  content += 'ET\n\n';
  
  content += 'LE SALARIÉ :\n';
  content += `${fields.salarie_nom || '[NOM DU SALARIÉ À COMPLÉTER]'}\n`;
  content += `${fields.salarie_adresse || '[ADRESSE À COMPLÉTER]'}\n`;
  content += '\nci-après dénommé "le Salarié", d\'autre part,\n\n';
  
  content += 'IL EST CONVENU CE QUI SUIT :\n\n';
  
  content += 'ARTICLE 1 - ENGAGEMENT\n';
  content += `L\'Employeur engage le Salarié en qualité de ${fields.poste || '[POSTE À DÉFINIR]'}.\n\n`;
  
  content += 'ARTICLE 2 - LIEU DE TRAVAIL\n';
  content += `Le Salarié exercera ses fonctions à : ${fields.lieu_travail || '[LIEU À PRÉCISER]'}.\n\n`;
  
  content += 'ARTICLE 3 - PRISE D\'EFFET ET DURÉE\n';
  content += `Le présent contrat prendra effet le ${fields.date_embauche || '[DATE À PRÉCISER]'} pour une durée indéterminée.\n\n`;
  
  if (fields.periode_essai === 'true' || fields.periode_essai === true) {
    content += 'ARTICLE 4 - PÉRIODE D\'ESSAI\n';
    content += `Le présent contrat est assorti d\'une période d\'essai de ${fields.duree_essai || '2 mois'}.\n\n`;
  }
  
  content += `ARTICLE ${fields.periode_essai ? '5' : '4'} - RÉMUNÉRATION\n`;
  content += `Le Salarié percevra une rémunération brute mensuelle de ${fields.salaire || '[MONTANT À PRÉCISER]'} euros.\n\n`;
  
  content += `ARTICLE ${fields.periode_essai ? '6' : '5'} - DURÉE DU TRAVAIL\n`;
  content += `La durée du travail est fixée à ${fields.horaires || '35 heures par semaine'}.\n\n`;
  
  content += 'ARTICLE FINAL - DISPOSITIONS GÉNÉRALES\n';
  content += 'Le présent contrat est régi par le Code du travail français et les conventions collectives applicables.\n\n';
  content += 'Fait en deux exemplaires à __________________, le __________________\n\n';
  content += 'L\'Employeur                           Le Salarié\n';
  content += '(signature et cachet)                 (signature précédée de "Lu et approuvé")';
  
  return content;
}

async function generateLeaseContent(fields: Record<string, any>, suggestions: Record<string, string[]>, history: ChatMessage[]): Promise<string> {
  let content = 'CONTRAT DE BAIL D\'HABITATION\n\n';
  
  content += 'Entre les soussignés :\n\n';
  
  content += 'LE BAILLEUR :\n';
  content += `${fields.proprietaire_nom || '[NOM DU PROPRIÉTAIRE À COMPLÉTER]'}\n`;
  content += `${fields.proprietaire_adresse || '[ADRESSE À COMPLÉTER]'}\n`;
  content += '\nci-après dénommé "le Bailleur", d\'une part,\n\n';
  
  content += 'ET\n\n';
  
  content += 'LE PRENEUR :\n';
  content += `${fields.locataire_nom || '[NOM DU LOCATAIRE À COMPLÉTER]'}\n`;
  content += '\nci-après dénommé "le Preneur", d\'autre part,\n\n';
  
  content += 'IL EST CONVENU CE QUI SUIT :\n\n';
  
  content += 'ARTICLE 1 - OBJET DE LA LOCATION\n';
  content += 'Le Bailleur loue au Preneur le logement situé :\n';
  content += `${fields.logement_adresse || '[ADRESSE DU LOGEMENT À COMPLÉTER]'}\n\n`;
  
  if (fields.logement_description) {
    content += `Description : ${fields.logement_description}\n`;
  }
  if (fields.superficie) {
    content += `Surface habitable : ${fields.superficie} m²\n`;
  }
  
  content += '\nARTICLE 2 - DURÉE DU BAIL\n';
  const duree = fields.type_location === 'meuble' ? '1 an' : '3 ans';
  content += `Le présent bail est consenti pour une durée de ${fields.duree_bail || duree}.\n\n`;
  
  content += 'ARTICLE 3 - LOYER ET CHARGES\n';
  content += `Le montant du loyer mensuel est fixé à ${fields.loyer || '[MONTANT À PRÉCISER]'} euros.\n`;
  if (fields.charges) {
    content += `Les charges mensuelles s\'élèvent à ${fields.charges} euros.\n`;
  }
  content += `Le loyer est payable ${fields.modalite_paiement || 'le 5 de chaque mois'}.\n\n`;
  
  if (fields.depot_garantie) {
    content += 'ARTICLE 4 - DÉPÔT DE GARANTIE\n';
    content += `Le Preneur verse à titre de dépôt de garantie la somme de ${fields.depot_garantie} euros.\n\n`;
  }
  
  content += 'ARTICLE FINAL - DISPOSITIONS GÉNÉRALES\n';
  content += 'Le présent bail est soumis à la loi du 6 juillet 1989. Un état des lieux contradictoire sera établi.\n\n';
  content += 'Fait en deux exemplaires à __________________, le __________________\n\n';
  content += 'Le Bailleur                           Le Preneur\n';
  content += '(signature)                           (signature précédée de "Lu et approuvé")';
  
  return content;
}

async function generateSaleContent(fields: Record<string, any>, suggestions: Record<string, string[]>, history: ChatMessage[]): Promise<string> {
  let content = 'CONTRAT DE VENTE\n\n';
  
  content += 'Entre les soussignés :\n\n';
  
  content += 'LE VENDEUR :\n';
  content += `${fields.vendeur_nom || '[NOM DU VENDEUR À COMPLÉTER]'}\n`;
  content += `${fields.vendeur_adresse || '[ADRESSE À COMPLÉTER]'}\n`;
  if (fields.vendeur_siret) {
    content += `SIRET : ${fields.vendeur_siret}\n`;
  }
  content += '\nci-après dénommé "le Vendeur", d\'une part,\n\n';
  
  content += 'ET\n\n';
  
  content += 'L\'ACHETEUR :\n';
  content += `${fields.acheteur_nom || '[NOM DE L\'ACHETEUR À COMPLÉTER]'}\n`;
  content += `${fields.acheteur_adresse || '[ADRESSE À COMPLÉTER]'}\n`;
  content += '\nci-après dénommé "l\'Acheteur", d\'autre part,\n\n';
  
  content += 'IL EST CONVENU CE QUI SUIT :\n\n';
  
  content += 'ARTICLE 1 - OBJET DE LA VENTE\n';
  content += 'Le Vendeur vend à l\'Acheteur :\n';
  content += `${fields.objet_vente || '[OBJET DE LA VENTE À DÉCRIRE]'}\n\n`;
  
  content += 'ARTICLE 2 - PRIX\n';
  content += `Le prix de vente est fixé à ${fields.prix || '[PRIX À PRÉCISER]'} euros.\n\n`;
  
  content += 'ARTICLE 3 - MODALITÉS DE PAIEMENT\n';
  if (fields.modalite_paiement === 'comptant') {
    content += 'Le paiement s\'effectuera comptant à la signature du présent contrat.\n\n';
  } else if (fields.modalite_paiement === 'livraison') {
    content += 'Le paiement s\'effectuera à la livraison.\n\n';
  } else {
    content += `Modalités de paiement : ${fields.modalite_paiement || '[À PRÉCISER]'}\n\n`;
  }
  
  content += 'ARTICLE 4 - LIVRAISON\n';
  content += `Lieu de livraison : ${fields.livraison_lieu || '[À PRÉCISER]'}\n`;
  content += `Délai de livraison : ${fields.livraison_delai || '[À PRÉCISER]'}\n\n`;
  
  content += 'ARTICLE FINAL - DISPOSITIONS GÉNÉRALES\n';
  content += 'Le présent contrat est régi par le Code civil français.\n\n';
  content += 'Fait en deux exemplaires à __________________, le __________________\n\n';
  content += 'Le Vendeur                            L\'Acheteur\n';
  content += '(signature)                           (signature précédée de "Lu et approuvé")';
  
  return content;
}

async function generatePowerOfAttorneyContent(fields: Record<string, any>, suggestions: Record<string, string[]>, history: ChatMessage[]): Promise<string> {
  let content = 'PROCURATION\n\n';
  
  content += 'Je soussigné(e) :\n\n';
  
  content += 'MANDANT :\n';
  content += `${fields.mandant_nom || '[NOM DU MANDANT À COMPLÉTER]'}\n`;
  content += `Né(e) le ${fields.mandant_naissance || '[DATE DE NAISSANCE]'}\n`;
  content += `Nationalité : ${fields.mandant_nationalite || 'Française'}\n`;
  if (fields.mandant_profession) {
    content += `Profession : ${fields.mandant_profession}\n`;
  }
  content += `Demeurant : ${fields.mandant_adresse || '[ADRESSE À COMPLÉTER]'}\n\n`;
  
  content += 'DONNE PROCURATION À :\n\n';
  
  content += 'MANDATAIRE :\n';
  content += `${fields.mandataire_nom || '[NOM DU MANDATAIRE À COMPLÉTER]'}\n`;
  content += `Né(e) le ${fields.mandataire_naissance || '[DATE DE NAISSANCE]'}\n`;
  content += `Nationalité : ${fields.mandataire_nationalite || 'Française'}\n`;
  if (fields.mandataire_profession) {
    content += `Profession : ${fields.mandataire_profession}\n`;
  }
  content += `Demeurant : ${fields.mandataire_adresse || '[ADRESSE À COMPLÉTER]'}\n\n`;
  
  content += 'OBJET DE LA PROCURATION :\n';
  content += `${fields.objet_mandat || '[OBJET DE LA PROCURATION À PRÉCISER]'}\n\n`;
  
  if (fields.tribunal_concerne) {
    content += `Tribunal concerné : ${fields.tribunal_concerne}\n`;
  }
  if (fields.numero_procedure) {
    content += `Numéro de procédure : ${fields.numero_procedure}\n`;
  }
  
  content += '\nJe déclare que cette procuration est donnée en toute connaissance de cause.\n\n';
  
  content += 'PIÈCES JOINTES :\n';
  content += '- Copie de la pièce d\'identité du mandant\n';
  content += '- Copie de la pièce d\'identité du mandataire\n\n';
  
  content += 'Fait à __________________, le __________________\n\n';
  content += 'Signature du mandant                  Signature du mandataire\n';
  content += '(précédée de "Bon pour procuration") (précédée de "J\'accepte cette procuration")';
  
  return content;
}

async function generateGenericDocumentContent(fields: Record<string, any>, suggestions: Record<string, string[]>, history: ChatMessage[]): Promise<string> {
  let content = 'DOCUMENT JURIDIQUE\n\n';
  
  content += 'Les informations collectées :\n\n';
  
  for (const [key, value] of Object.entries(fields)) {
    if (value && key !== 'document_type') {
      content += `${key.replace(/_/g, ' ').toUpperCase()} : ${value}\n`;
    }
  }
  
  content += '\n[Ce document nécessite une personnalisation selon vos besoins spécifiques]\n';
  
  return content;
}

async function generateDOCX(content: string, documentData: DocumentData): Promise<Buffer> {
  try {
    const doc = new Document({
      creator: "Xinvoice - Assistant IA Juridique",
      title: documentData.type,
      description: `Document juridique généré automatiquement - ${documentData.type}`,
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: documentData.type.toUpperCase(),
                bold: true,
                size: 32,
              }),
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          
          // Content
          ...content.split('\n').map(line => 
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 24,
                  font: "Times New Roman"
                }),
              ],
            })
          ),
        ],
      }],
    });

    return await Packer.toBuffer(doc);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error('Erreur lors de la génération du fichier DOCX');
  }
}

async function generatePDF(content: string, documentData: DocumentData): Promise<Buffer> {
  try {
    const pdf = new jsPDF();
    
    // Set font
    pdf.setFont("helvetica");
    
    // Title
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(documentData.type.toUpperCase(), 20, 30);
    
    // Content
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    
    const lines = pdf.splitTextToSize(content, 170);
    let yPosition = 50;
    
    for (let i = 0; i < lines.length; i++) {
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(lines[i], 20, yPosition);
      yPosition += 6;
    }
    
    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(`Page ${i} / ${pageCount}`, 180, 290);
      pdf.text(`Généré par Xinvoice - ${new Date().toLocaleDateString('fr-FR')}`, 20, 290);
    }
    
    return Buffer.from(pdf.output('arraybuffer'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Erreur lors de la génération du fichier PDF');
  }
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\-_\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}