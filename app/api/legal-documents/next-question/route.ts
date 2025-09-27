import { NextRequest, NextResponse } from 'next/server';
import { frenchLegalDocumentGenerator } from '../../../../packages/core/french-legal-documents';

interface GetNextQuestionRequest {
  documentId: string;
  currentAnswers: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: GetNextQuestionRequest = await request.json();
    const { documentId, currentAnswers } = body;

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'documentId requis' },
        { status: 400 }
      );
    }

    // Obtenir la question suivante
    const nextQuestion = frenchLegalDocumentGenerator.getNextQuestion(documentId, currentAnswers || {});
    
    // Obtenir le template pour les informations supplémentaires
    const template = frenchLegalDocumentGenerator.getDocumentTemplate(documentId);
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    // Calculer le taux de completion
    const completionRate = frenchLegalDocumentGenerator.getCompletionRate(documentId, currentAnswers || {});

    return NextResponse.json({
      success: true,
      data: {
        nextQuestion,
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          legalBasis: template.legalBasis
        },
        completionRate,
        isComplete: !nextQuestion
      }
    });

  } catch (error) {
    console.error('Error getting next question:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération de la question suivante' 
      },
      { status: 500 }
    );
  }
}