import { NextRequest, NextResponse } from 'next/server';
import { frenchLegalDocumentGenerator } from '../../../../packages/core/french-legal-documents';

export async function GET() {
  try {
    const documents = frenchLegalDocumentGenerator.getAvailableDocuments();
    
    return NextResponse.json({
      success: true,
      data: documents,
      message: 'Documents juridiques français disponibles'
    });
  } catch (error) {
    console.error('Error fetching legal documents:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des documents' 
      },
      { status: 500 }
    );
  }
}