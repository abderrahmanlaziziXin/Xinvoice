import { NextRequest, NextResponse } from 'next/server';
import { createLLMProvider } from '../../../../packages/core';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface DocumentData {
  type: string;
  content: string;
  fields: Record<string, any>;
  aiSuggestions: Record<string, string[]>;
}

interface MockResponseData {
  type: string;
  content: string;
  fields: Record<string, any>;
  aiSuggestions?: Record<string, string[]>;
}

interface MockAIResponse {
  response: string;
  suggestions: string[];
  documentData?: MockResponseData;
  nextPhase: 'selection' | 'questions' | 'generation' | 'finalization';
}

interface ChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
  phase: 'selection' | 'questions' | 'generation' | 'finalization';
  currentDocumentData?: DocumentData;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, conversationHistory, phase, currentDocumentData } = body;

    // Get AI provider
    const llmProvider = process.env.LLM_PROVIDER as 'openai' | 'gemini';
    const apiKey = llmProvider === 'openai' 
      ? process.env.OPENAI_API_KEY 
      : process.env.GEMINI_API_KEY;

    let aiResponse: string;
    let suggestions: string[] = [];
    let documentData: DocumentData | undefined = currentDocumentData;
    let nextPhase = phase;

    if (!llmProvider || !apiKey) {
      // Demo mode with intelligent mock responses
      const mockResponse = generateMockAIResponse(message, phase, conversationHistory, currentDocumentData);
      aiResponse = mockResponse.response;
      suggestions = mockResponse.suggestions;
      documentData = mockResponse.documentData as DocumentData | undefined;
      nextPhase = mockResponse.nextPhase;
    } else {
      // Real AI integration
      const provider = createLLMProvider(llmProvider, apiKey);
      
      const systemPrompt = getSystemPrompt(phase, currentDocumentData);
      const conversationContext = formatConversationForAI(conversationHistory);
      
      const aiResult = await provider.generateDocument(
        `${systemPrompt}\n\nConversation précédente:\n${conversationContext}\n\nMessage utilisateur: ${message}`,
        'invoice', // Using invoice as document type
        {
          defaultCurrency: 'EUR',
          defaultLocale: 'fr-FR',
          defaultTaxRate: 20
        }
      );

      const parsedResult = parseAIResponse(aiResult, phase, currentDocumentData);
      aiResponse = parsedResult.response;
      suggestions = parsedResult.suggestions;
      documentData = parsedResult.documentData;
      nextPhase = parsedResult.nextPhase;
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      suggestions,
      documentData,
      nextPhase
    });

  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la communication avec l\'IA',
        response: 'Désolé, j\'ai rencontré une erreur technique. Pouvez-vous reformuler votre demande ?'
      },
      { status: 500 }
    );
  }
}

function getSystemPrompt(phase: string, documentData?: DocumentData): string {
  const basePrompt = `Vous êtes un assistant juridique expert spécialisé dans le droit français. Vous aidez à créer des documents juridiques conformes à la législation française.

RÈGLES IMPORTANTES:
- Répondez UNIQUEMENT en français
- Soyez précis et professionnel
- Respectez scrupuleusement le droit français
- Adaptez vos questions selon les réponses précédentes
- Proposez des suggestions concrètes et utiles
- Ne donnez jamais de conseils juridiques définitifs (recommandez de consulter un professionnel)

FORMAT DE RÉPONSE:
{
  "response": "Votre réponse conversationnelle",
  "suggestions": ["Suggestion 1", "Suggestion 2", "..."],
  "documentData": {
    "type": "Type de document",
    "fields": {"champ": "valeur"},
    "aiSuggestions": {"champ": ["suggestion1", "suggestion2"]}
  },
  "nextPhase": "selection|questions|generation|finalization"
}`;

  switch (phase) {
    case 'selection':
      return `${basePrompt}

PHASE ACTUELLE: SÉLECTION DU DOCUMENT
Aidez l'utilisateur à choisir le type de document juridique approprié. Proposez les options principales:
- Contrat de travail (CDI, CDD)
- Bail d'habitation (vide, meublé)  
- Contrat de vente (biens, services)
- Procuration (administrative, judiciaire)
- Autres documents selon le besoin

Posez des questions pour comprendre le contexte et orienter vers le bon document.`;

    case 'questions':
      return `${basePrompt}

PHASE ACTUELLE: COLLECTE D'INFORMATIONS
Document en cours: ${documentData?.type || 'Non défini'}
Posez des questions pertinentes pour remplir le document. Adaptez vos questions selon:
- Le type de document choisi
- Les réponses déjà données
- Les obligations légales françaises
- Les bonnes pratiques juridiques

Proposez des suggestions de contenu quand c'est approprié.`;

    case 'generation':
      return `${basePrompt}

PHASE ACTUELLE: GÉNÉRATION DU DOCUMENT
Créez le contenu du document juridique basé sur les informations collectées.
- Utilisez un langage juridique approprié
- Respectez la structure légale requise
- Incluez toutes les clauses obligatoires
- Proposez des clauses optionnelles utiles`;

    case 'finalization':
      return `${basePrompt}

PHASE ACTUELLE: FINALISATION
Le document est généré. Aidez l'utilisateur à:
- Réviser le contenu
- Apporter des modifications
- Comprendre les clauses importantes
- Préparer la signature et l'utilisation`;

    default:
      return basePrompt;
  }
}

function formatConversationForAI(history: ChatMessage[]): string {
  return history.map(msg => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`).join('\n');
}

function parseAIResponse(aiResult: any, currentPhase: string, currentDocumentData?: DocumentData) {
  try {
    // Try to parse as JSON first
    let parsed;
    if (typeof aiResult === 'string') {
      // Extract JSON from response if it's embedded in text
      const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback to simple text response
        parsed = {
          response: aiResult,
          suggestions: [],
          nextPhase: currentPhase
        };
      }
    } else {
      parsed = aiResult;
    }

    return {
      response: parsed.response || 'Réponse de l\'IA non disponible',
      suggestions: parsed.suggestions || [],
      documentData: parsed.documentData || currentDocumentData,
      nextPhase: parsed.nextPhase || currentPhase
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      response: 'Je vous écoute. Pouvez-vous me donner plus de détails sur ce que vous souhaitez ?',
      suggestions: [],
      documentData: currentDocumentData,
      nextPhase: currentPhase
    };
  }
}

function generateMockAIResponse(message: string, phase: string, history: ChatMessage[], currentDocumentData?: DocumentData) {
  // Intelligent mock responses based on context
  const lowerMessage = message.toLowerCase();
  
  switch (phase) {
    case 'selection':
      if (lowerMessage.includes('contrat') && lowerMessage.includes('travail')) {
        return {
          response: "Parfait ! Je vais vous aider à créer un contrat de travail. S'agit-il d'un CDI (contrat à durée indéterminée) ou d'un CDD (contrat à durée déterminée) ?",
          suggestions: [
            "CDI - Contrat à durée indéterminée",
            "CDD - Contrat à durée déterminée",
            "Stage conventionné",
            "Contrat d'apprentissage"
          ],
          documentData: {
            type: "Contrat de travail",
            content: "",
            fields: { document_type: "contrat_travail" },
            aiSuggestions: {}
          },
          nextPhase: 'questions' as const
        };
      } else if (lowerMessage.includes('bail') || lowerMessage.includes('location') || lowerMessage.includes('logement')) {
        return {
          response: "Je vais vous aider à créer un contrat de bail. S'agit-il d'une location vide ou meublée ? Et pour quelle durée envisagez-vous ce bail ?",
          suggestions: [
            "Location vide (3 ans minimum)",
            "Location meublée (1 an minimum)",
            "Location étudiante (9 mois)",
            "Location saisonnière"
          ],
          documentData: {
            type: "Bail d'habitation",
            content: "",
            fields: { document_type: "bail_habitation" },
            aiSuggestions: {}
          },
          nextPhase: 'questions' as const
        };
      } else if (lowerMessage.includes('vente') || lowerMessage.includes('achat')) {
        return {
          response: "Je vais créer un contrat de vente pour vous. Qu'est-ce qui fait l'objet de cette vente ? S'agit-il de biens mobiliers, d'un véhicule, ou d'autre chose ?",
          suggestions: [
            "Vente de véhicule",
            "Vente de mobilier/objets",
            "Vente de matériel informatique",
            "Prestation de services"
          ],
          documentData: {
            type: "Contrat de vente",
            content: "",
            fields: { document_type: "contrat_vente" },
            aiSuggestions: {}
          },
          nextPhase: 'questions' as const
        };
      } else if (lowerMessage.includes('procuration') || lowerMessage.includes('mandat')) {
        return {
          response: "Je vais vous aider à rédiger une procuration. Dans quel contexte avez-vous besoin de cette procuration ? Est-ce pour des démarches administratives, bancaires, ou judiciaires ?",
          suggestions: [
            "Démarches administratives",
            "Opérations bancaires",
            "Représentation judiciaire",
            "Gestion immobilière"
          ],
          documentData: {
            type: "Procuration",
            content: "",
            fields: { document_type: "procuration" },
            aiSuggestions: {}
          },
          nextPhase: 'questions' as const
        };
      } else {
        return {
          response: "Je peux vous aider à créer différents types de documents juridiques. Quel document vous intéresse le plus ?",
          suggestions: [
            "Contrat de travail CDI/CDD",
            "Bail d'habitation",
            "Contrat de vente",
            "Procuration",
            "Autre document"
          ],
          documentData: undefined,
          nextPhase: 'selection' as const
        };
      }

    case 'questions':
      if (!currentDocumentData) {
        return {
          response: "Il semble que nous devions recommencer. Quel type de document souhaitez-vous créer ?",
          suggestions: ["Contrat de travail", "Bail d'habitation"],
          documentData: undefined,
          nextPhase: 'selection' as const
        };
      }
      
      const docType = currentDocumentData.fields?.document_type;
      
      if (docType === 'contrat_travail') {
        if (!currentDocumentData.fields.employeur_nom) {
          return {
            response: "Commençons par les informations sur l'employeur. Quel est le nom complet de l'entreprise qui embauche ?",
            suggestions: [
              "SARL Solutions Tech",
              "Entreprise individuelle Martin",
              "SAS Innovation Digital"
            ],
            documentData: {
              ...currentDocumentData,
              fields: { ...currentDocumentData.fields, employeur_nom: message }
            },
            nextPhase: 'questions' as const
          };
        } else if (!currentDocumentData.fields.employeur_adresse) {
          return {
            response: `Merci ! L'employeur est "${currentDocumentData.fields.employeur_nom}". Quelle est l'adresse complète de l'entreprise ?`,
            suggestions: [
              "123 Rue de la Paix, 75001 Paris",
              "45 Avenue des Champs, 69000 Lyon",
              "78 Boulevard Victor Hugo, 13000 Marseille"
            ],
            documentData: {
              ...currentDocumentData,
              fields: { ...currentDocumentData.fields, employeur_adresse: message }
            },
            nextPhase: 'questions' as const
          };
        } else if (!currentDocumentData.fields.salarie_nom) {
          return {
            response: "Parfait ! Maintenant, quel est le nom complet du futur salarié ?",
            suggestions: [
              "Dupont Pierre",
              "Martin Sophie",
              "Dubois Alexandre"
            ],
            documentData: {
              ...currentDocumentData,
              fields: { ...currentDocumentData.fields, salarie_nom: message }
            },
            nextPhase: 'questions' as const
          };
        } else if (!currentDocumentData.fields.salarie_adresse) {
          return {
            response: `Merci ! Le salarié est "${currentDocumentData.fields.salarie_nom}". Quelle est son adresse complète ?`,
            suggestions: [
              "10 Rue des Fleurs, 75015 Paris",
              "25 Avenue de la République, 69003 Lyon",
              "88 Cours Mirabeau, 13100 Aix-en-Provence"
            ],
            documentData: {
              ...currentDocumentData,
              fields: { ...currentDocumentData.fields, salarie_adresse: message }
            },
            nextPhase: 'questions' as const
          };
        } else if (!currentDocumentData.fields.poste) {
          return {
            response: "Quel poste occupera le salarié ? Soyez précis sur l'intitulé du poste.",
            suggestions: [
              "Développeur Full Stack",
              "Assistant(e) commercial(e)",
              "Comptable",
              "Responsable marketing"
            ],
            documentData: {
              ...currentDocumentData,
              fields: { ...currentDocumentData.fields, poste: message }
            },
            nextPhase: 'questions' as const
          };
        } else if (!currentDocumentData.fields.salaire) {
          return {
            response: "Quel sera le salaire mensuel brut du salarié ? (en euros)",
            suggestions: [
              "2500€ brut/mois",
              "3000€ brut/mois", 
              "3500€ brut/mois",
              "4000€ brut/mois"
            ],
            documentData: {
              ...currentDocumentData,
              fields: { ...currentDocumentData.fields, salaire: message }
            },
            nextPhase: 'questions' as const
          };
        } else if (!currentDocumentData.fields.date_embauche) {
          return {
            response: "À quelle date le salarié commencera-t-il ? (format JJ/MM/AAAA)",
            suggestions: [
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
              new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
            ],
            documentData: {
              ...currentDocumentData,
              fields: { ...currentDocumentData.fields, date_embauche: message }
            },
            nextPhase: 'questions' as const
          };
        } else {
          return {
            response: "Excellent ! J'ai maintenant toutes les informations nécessaires pour générer votre contrat de travail. Voici un résumé :\n\n" +
              `• Employeur : ${currentDocumentData.fields.employeur_nom}\n` +
              `• Adresse employeur : ${currentDocumentData.fields.employeur_adresse}\n` +
              `• Salarié : ${currentDocumentData.fields.salarie_nom}\n` +
              `• Adresse salarié : ${currentDocumentData.fields.salarie_adresse}\n` +
              `• Poste : ${currentDocumentData.fields.poste}\n` +
              `• Salaire : ${currentDocumentData.fields.salaire}\n` +
              `• Date d'embauche : ${currentDocumentData.fields.date_embauche}\n\n` +
              "Voulez-vous que je génère le contrat avec ces informations ?",
            suggestions: [
              "Oui, générer le contrat",
              "Ajouter une période d'essai",
              "Modifier une information"
            ],
            documentData: {
              ...currentDocumentData,
              fields: { ...currentDocumentData.fields },
              aiSuggestions: {
                'Clauses importantes': [
                  'Période d\'essai de 2 mois',
                  'Clause de confidentialité',
                  'Clause de non-concurrence',
                  'Formation professionnelle'
                ]
              }
            },
            nextPhase: 'generation' as const
          };
        }
      } else if (docType === 'bail_habitation') {
        if (!currentDocumentData.fields.proprietaire_nom) {
          return {
            response: "Pour le bail d'habitation, commençons par les informations du propriétaire. Quel est le nom complet du propriétaire bailleur ?",
            suggestions: [
              "Dupont Marie",
              "SCI Les Jardins",
              "Martin Pierre et Dubois Sophie"
            ],
            documentData: {
              ...currentDocumentData,
              fields: { ...currentDocumentData.fields, proprietaire_nom: message }
            },
            nextPhase: 'questions' as const
          };
        } else if (!currentDocumentData.fields.proprietaire_adresse) {
          return {
            response: `Merci ! Le propriétaire est "${currentDocumentData.fields.proprietaire_nom}". Quelle est son adresse complète ?`,
            suggestions: [
              "12 Place de la République, 75011 Paris",
              "67 Cours Lafayette, 69003 Lyon"
            ],
            documentData: {
              ...currentDocumentData,
              fields: { ...currentDocumentData.fields, proprietaire_adresse: message }
            },
            nextPhase: 'questions' as const
          };
        } else if (!currentDocumentData.fields.locataire_nom) {
          return {
            response: "Parfait ! Maintenant, quel est le nom complet du locataire ?",
            suggestions: [
              "Durand Jean",
              "Moreau Claire",
              "Bernard Alexandre"
            ],
            documentData: {
              ...currentDocumentData,
              fields: { ...currentDocumentData.fields, locataire_nom: message }
            },
            nextPhase: 'questions' as const
          };
        } else if (!currentDocumentData.fields.logement_adresse) {
          return {
            response: "Quelle est l'adresse complète du logement à louer ?",
            suggestions: [
              "45 Rue de la Paix, Apt 3B, 75002 Paris",
              "23 Avenue des Fleurs, 69007 Lyon"
            ],
            documentData: {
              ...currentDocumentData,
              fields: { ...currentDocumentData.fields, logement_adresse: message }
            },
            nextPhase: 'questions' as const
          };
        } else if (!currentDocumentData.fields.loyer) {
          return {
            response: "Quel sera le montant du loyer mensuel (hors charges) ?",
            suggestions: [
              "850€/mois",
              "1200€/mois",
              "1500€/mois"
            ],
            documentData: {
              ...currentDocumentData,
              fields: { ...currentDocumentData.fields, loyer: message }
            },
            nextPhase: 'questions' as const
          };
        } else {
          return {
            response: "Parfait ! J'ai toutes les informations pour générer votre bail d'habitation :\n\n" +
              `• Propriétaire : ${currentDocumentData.fields.proprietaire_nom}\n` +
              `• Adresse propriétaire : ${currentDocumentData.fields.proprietaire_adresse}\n` +
              `• Locataire : ${currentDocumentData.fields.locataire_nom}\n` +
              `• Logement : ${currentDocumentData.fields.logement_adresse}\n` +
              `• Loyer : ${currentDocumentData.fields.loyer}\n\n` +
              "Voulez-vous que je génère le bail avec ces informations ?",
            suggestions: [
              "Oui, générer le bail",
              "Ajouter les charges",
              "Modifier une information"
            ],
            documentData: {
              ...currentDocumentData,
              aiSuggestions: {
                'Clauses importantes': [
                  'Dépôt de garantie (1 mois de loyer)',
                  'État des lieux d\'entrée',
                  'Assurance habitation obligatoire',
                  'Durée du bail (3 ans minimum)'
                ]
              }
            },
            nextPhase: 'generation' as const
          };
        }
      }
      // Add similar logic for other document types...
      return {
        response: "Merci pour cette information. Pouvez-vous me donner plus de détails sur votre situation ?",
        suggestions: [],
        documentData: currentDocumentData,
        nextPhase: 'questions' as const
      };

    case 'generation':
      return {
        response: "Perfect ! J'ai généré votre document juridique avec toutes les informations fournies. Le document respecte les exigences légales françaises et inclut toutes les clauses essentielles. Vous pouvez maintenant le télécharger au format de votre choix.",
        suggestions: [],
        documentData: currentDocumentData,
        nextPhase: 'finalization' as const
      };

    case 'finalization':
      return {
        response: "Votre document est prêt ! N'hésitez pas à le relire attentivement avant signature. Je recommande de faire vérifier les clauses importantes par un professionnel si nécessaire.",
        suggestions: [
          "Télécharger en DOCX",
          "Télécharger en PDF", 
          "Créer un nouveau document"
        ],
        documentData: currentDocumentData,
        nextPhase: 'finalization' as const
      };

    default:
      return {
        response: "Comment puis-je vous aider avec vos documents juridiques ?",
        suggestions: [],
        documentData: currentDocumentData,
        nextPhase: phase as any
      };
  }
}