import { NextRequest, NextResponse } from 'next/server';
import { frenchLegalDocumentGenerator } from '../../../../packages/core/french-legal-documents';

interface GenerateDocumentRequest {
  documentId: string;
  answers: Record<string, any>;
  format?: 'text' | 'pdf';
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDocumentRequest = await request.json();
    const { documentId, answers, format = 'text' } = body;

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'documentId requis' },
        { status: 400 }
      );
    }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { success: false, error: 'answers requis' },
        { status: 400 }
      );
    }

    // Générer le document
    const result = frenchLegalDocumentGenerator.generateDocument(documentId, answers);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur de génération',
          details: result.errors 
        },
        { status: 400 }
      );
    }

    // Obtenir les informations du template
    const template = frenchLegalDocumentGenerator.getDocumentTemplate(documentId);
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template non trouvé' },
        { status: 404 }
      );
    }

    // Calculer les statistiques
    const completionRate = frenchLegalDocumentGenerator.getCompletionRate(documentId, answers);
    const totalQuestions = template.questions.length;
    const answeredQuestions = Object.keys(answers).length;

    // Préparer la réponse
    const response = {
      success: true,
      data: {
        document: result.document,
        metadata: {
          documentId: template.id,
          documentName: template.name,
          documentCategory: template.category,
          legalBasis: template.legalBasis,
          generatedAt: new Date().toISOString(),
          format
        },
        statistics: {
          completionRate,
          totalQuestions,
          answeredQuestions,
          requiredFieldsFilled: template.requiredFields.filter(field => answers[field]).length,
          totalRequiredFields: template.requiredFields.length
        },
        legalNotices: template.legalNotices,
        answers: answers // Include answers for reference
      }
    };

    // Si format PDF demandé (future extension)
    if (format === 'pdf') {
      // TODO: Implémenter la génération PDF
      response.data.metadata.format = 'text'; // Fallback to text for now
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la génération du document' 
      },
      { status: 500 }
    );
  }
}