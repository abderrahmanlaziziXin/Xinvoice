"use client";

import React, { useState, useEffect } from 'react';
import { 
  frenchLegalDocumentGenerator, 
  LegalDocumentTemplate, 
  LegalDocumentQuestion,
  ConversationState 
} from '../../packages/core/french-legal-documents';

export function FrenchLegalDocumentWizard() {
  const [step, setStep] = useState<'selection' | 'questions' | 'preview' | 'completed'>('selection');
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [currentTemplate, setCurrentTemplate] = useState<LegalDocumentTemplate | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<LegalDocumentQuestion | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<{ question: string; answer: string }[]>([]);
  const [generatedDocument, setGeneratedDocument] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const availableDocuments = frenchLegalDocumentGenerator.getAvailableDocuments();

  // Charger le template sélectionné
  useEffect(() => {
    if (selectedDocument) {
      const template = frenchLegalDocumentGenerator.getDocumentTemplate(selectedDocument);
      setCurrentTemplate(template);
      if (template) {
        const firstQuestion = frenchLegalDocumentGenerator.getNextQuestion(selectedDocument, {});
        setCurrentQuestion(firstQuestion);
      }
    }
  }, [selectedDocument]);

  // Mettre à jour la question suivante
  useEffect(() => {
    if (selectedDocument && step === 'questions') {
      const nextQuestion = frenchLegalDocumentGenerator.getNextQuestion(selectedDocument, answers);
      setCurrentQuestion(nextQuestion);
      if (!nextQuestion) {
        // Toutes les questions sont répondues
        generateDocument();
      }
    }
  }, [answers, selectedDocument, step]);

  const handleDocumentSelection = (documentId: string) => {
    setSelectedDocument(documentId);
    setStep('questions');
    setAnswers({});
    setConversationHistory([]);
    setError('');
  };

  const handleAnswerSubmit = () => {
    if (!currentQuestion) return;

    // Validation
    const validation = frenchLegalDocumentGenerator.validateAnswer(currentQuestion, currentAnswer);
    if (!validation.isValid) {
      setError(validation.error || 'Réponse invalide');
      return;
    }

    // Sauvegarder la réponse
    const newAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    setAnswers(newAnswers);

    // Ajouter à l'historique de conversation
    setConversationHistory(prev => [...prev, {
      question: currentQuestion.text,
      answer: currentAnswer
    }]);

    // Réinitialiser le champ de saisie
    setCurrentAnswer('');
    setError('');
  };

  const generateDocument = async () => {
    if (!selectedDocument) return;

    setIsLoading(true);
    try {
      const result = frenchLegalDocumentGenerator.generateDocument(selectedDocument, answers);
      if (result.success && result.document) {
        setGeneratedDocument(result.document);
        setStep('preview');
      } else {
        setError(result.errors?.join(', ') || 'Erreur de génération');
      }
    } catch (error) {
      setError('Erreur lors de la génération du document');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDocument = () => {
    const blob = new Blob([generatedDocument], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTemplate?.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetWizard = () => {
    setStep('selection');
    setSelectedDocument('');
    setCurrentTemplate(null);
    setCurrentQuestion(null);
    setAnswers({});
    setCurrentAnswer('');
    setConversationHistory([]);
    setGeneratedDocument('');
    setError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900">Génération en cours...</h3>
          <p className="text-gray-600">Création de votre document juridique</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <span className="mr-3">⚖️</span>
            Générateur de Documents Juridiques
          </h1>
          <p className="text-xl text-gray-700">
            Assistant conversationnel pour la création de documents juridiques français
          </p>
        </div>

        {/* Étape 1: Sélection du document */}
        {step === 'selection' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3">📋</span>
              Quel document souhaitez-vous générer ?
            </h2>
            <p className="text-gray-600 mb-8">
              Choisissez le type de document juridique que vous souhaitez créer. 
              Je vous poserai ensuite quelques questions pour le personnaliser selon vos besoins.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentSelection(doc.id)}
                  className="p-6 bg-gradient-to-r from-white to-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                      {doc.name}
                    </h3>
                    <span className="text-2xl">
                      {doc.category === 'contrat' && '📄'}
                      {doc.category === 'bail' && '🏠'}
                      {doc.category === 'vente' && '💰'}
                      {doc.category === 'procuration' && '✍️'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm">
                    {doc.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded capitalize">
                      {doc.category}
                    </span>
                    <span>⏱️ {doc.estimatedTime}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 2: Questions conversationnelles */}
        {step === 'questions' && currentTemplate && (
          <div className="space-y-6">
            
            {/* Progression */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">📝</span>
                  {currentTemplate.name}
                </h2>
                <div className="text-sm text-gray-600">
                  Progression: {frenchLegalDocumentGenerator.getCompletionRate(selectedDocument, answers)}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${frenchLegalDocumentGenerator.getCompletionRate(selectedDocument, answers)}%` }}
                ></div>
              </div>
            </div>

            {/* Historique de conversation */}
            {conversationHistory.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">💬</span>
                  Conversation
                </h3>
                <div className="space-y-4">
                  {conversationHistory.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Question:</p>
                        <p className="text-blue-800">{item.question}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg ml-4">
                        <p className="text-sm font-medium text-green-900">Votre réponse:</p>
                        <p className="text-green-800">{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question actuelle */}
            {currentQuestion && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {currentQuestion.text}
                  </h3>
                  {currentQuestion.helpText && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      💡 {currentQuestion.helpText}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Champ de saisie selon le type */}
                  {currentQuestion.type === 'text' && (
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}

                  {currentQuestion.type === 'textarea' && (
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}

                  {currentQuestion.type === 'select' && currentQuestion.options && (
                    <select
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choisissez une option...</option>
                      {currentQuestion.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {currentQuestion.type === 'date' && (
                    <input
                      type="date"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}

                  {currentQuestion.type === 'number' && (
                    <input
                      type="number"
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}

                  {currentQuestion.type === 'boolean' && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setCurrentAnswer('true')}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          currentAnswer === 'true'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setCurrentAnswer('false')}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                          currentAnswer === 'false'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  )}

                  {/* Erreur */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 flex items-center">
                        <span className="mr-2">⚠️</span>
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={resetWizard}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      ← Recommencer
                    </button>
                    
                    <div className="flex space-x-3">
                      {!currentQuestion.required && (
                        <button
                          onClick={() => {
                            setCurrentAnswer('');
                            handleAnswerSubmit();
                          }}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Ignorer (optionnel)
                        </button>
                      )}
                      <button
                        onClick={handleAnswerSubmit}
                        disabled={currentQuestion.required && !currentAnswer.trim()}
                        className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                          currentQuestion.required && !currentAnswer.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                        }`}
                      >
                        Suivant →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Étape 3: Aperçu du document */}
        {step === 'preview' && (
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-3">📄</span>
                  Aperçu de votre document
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={downloadDocument}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors flex items-center"
                  >
                    <span className="mr-2">💾</span>
                    Télécharger
                  </button>
                  <button
                    onClick={resetWizard}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    Nouveau document
                  </button>
                </div>
              </div>

              {/* Informations légales */}
              {currentTemplate && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                    ⚠️ Informations légales importantes
                  </h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    <strong>Base légale :</strong> {currentTemplate.legalBasis}
                  </p>
                  <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                    {currentTemplate.legalNotices.map((notice, index) => (
                      <li key={index}>{notice}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Document généré */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {generatedDocument}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}