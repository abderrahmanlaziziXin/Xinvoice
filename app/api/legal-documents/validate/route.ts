import { NextRequest, NextResponse } from 'next/server';
import { frenchLegalDocumentGenerator } from '../../../../packages/core/french-legal-documents';

interface ValidateAnswerRequest {
  documentId: string;
  questionId: string;
  answer: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateAnswerRequest = await request.json();
    const { documentId, questionId, answer } = body;

    if (!documentId || !questionId) {
      return NextResponse.json(
        { success: false, error: 'documentId et questionId requis' },
        { status: 400 }
      );
    }

    // Obtenir le template
    const template = frenchLegalDocumentGenerator.getDocumentTemplate(documentId);
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Document non trouvé' },
        { status: 404 }
      );
    }

    // Trouver la question
    const question = template.questions.find(q => q.id === questionId);
    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question non trouvée' },
        { status: 404 }
      );
    }

    // Valider la réponse
    const validation = frenchLegalDocumentGenerator.validateAnswer(question, answer);

    return NextResponse.json({
      success: true,
      data: {
        isValid: validation.isValid,
        error: validation.error,
        question: {
          id: question.id,
          text: question.text,
          type: question.type,
          required: question.required
        }
      }
    });

  } catch (error) {
    console.error('Error validating answer:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la validation de la réponse' 
      },
      { status: 500 }
    );
  }
}