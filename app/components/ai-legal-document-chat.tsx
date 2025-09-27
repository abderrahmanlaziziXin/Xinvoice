"use client";

import React, { useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
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

export function AILegalDocumentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Bonjour ! Je vais vous aider à générer un document juridique. Quel type de document souhaitez-vous créer ? (contrat de travail, bail d'habitation, contrat de vente, procuration, etc.)",
      timestamp: new Date(),
      suggestions: [
        "Contrat de travail CDI",
        "Bail d'habitation",
        "Contrat de vente",
        "Procuration",
        "Autre type de document",
      ],
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [conversationPhase, setConversationPhase] = useState<
    "selection" | "questions" | "generation" | "finalization"
  >("selection");

  const sendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    try {
      // Call AI API for response
      const response = await fetch("/api/legal-documents/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages,
          phase: conversationPhase,
          currentDocumentData: documentData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Add AI response
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.response,
          timestamp: new Date(),
          suggestions: result.suggestions,
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Update document data if provided
        if (result.documentData) {
          setDocumentData(result.documentData);
        }

        // Update conversation phase
        if (result.nextPhase) {
          setConversationPhase(result.nextPhase);
        }
      } else {
        throw new Error(result.error || "Erreur de communication avec l'IA");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Désolé, j'ai rencontré une erreur. Pouvez-vous réessayer ?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const downloadDocument = async (format: "docx" | "pdf" | "txt") => {
    if (!documentData) return;

    try {
      const response = await fetch("/api/legal-documents/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentData,
          format,
          conversationHistory: messages,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `document_juridique_${
          new Date().toISOString().split("T")[0]
        }.${format}`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        throw new Error("Erreur lors de l'export");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Erreur lors du téléchargement. Veuillez réessayer.");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <span className="mr-3">🤖</span>
            Assistant IA - Documents Juridiques
          </h1>
          <p className="text-xl text-gray-700">
            Conversation intelligente avec l&apos;IA pour créer vos documents
            juridiques français
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <h3 className="font-semibold">Assistant IA Juridique</h3>
                  <span className="ml-auto text-sm opacity-80">
                    Phase: {conversationPhase === "selection" && "Sélection"}
                    {conversationPhase === "questions" && "Questions"}
                    {conversationPhase === "generation" && "Génération"}
                    {conversationPhase === "finalization" && "Finalisation"}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {/* AI Suggestions */}
                      {message.role === "assistant" && message.suggestions && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium opacity-80">
                            Suggestions :
                          </div>
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left p-2 text-sm bg-white/20 hover:bg-white/30 rounded border border-gray-300 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 p-4 rounded-lg max-w-[80%]">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      !isTyping &&
                      currentMessage.trim() &&
                      sendMessage(currentMessage)
                    }
                    placeholder="Tapez votre message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isTyping}
                  />
                  <button
                    onClick={() => sendMessage(currentMessage)}
                    disabled={isTyping || !currentMessage.trim()}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      isTyping || !currentMessage.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Document Preview & Actions */}
          <div className="space-y-6">
            {/* Current Progress */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Progression
              </h3>

              <div className="space-y-3">
                <div
                  className={`flex items-center space-x-2 ${
                    conversationPhase === "selection"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      conversationPhase === "selection"
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span>Sélection du document</span>
                </div>
                <div
                  className={`flex items-center space-x-2 ${
                    conversationPhase === "questions"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      conversationPhase === "questions"
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span>Collecte d&apos;informations</span>
                </div>
                <div
                  className={`flex items-center space-x-2 ${
                    conversationPhase === "generation"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      conversationPhase === "generation"
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span>Génération IA</span>
                </div>
                <div
                  className={`flex items-center space-x-2 ${
                    conversationPhase === "finalization"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      conversationPhase === "finalization"
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span>Finalisation</span>
                </div>
              </div>
            </div>

            {/* Document Information */}
            {documentData && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📄</span>
                  Document en cours
                </h3>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Type :
                    </span>
                    <p className="text-gray-900">{documentData.type}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Champs complétés :
                    </span>
                    <p className="text-gray-900">
                      {Object.keys(documentData.fields).length}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Suggestions IA :
                    </span>
                    <p className="text-gray-900">
                      {Object.keys(documentData.aiSuggestions).length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Download Actions */}
            {conversationPhase === "finalization" && documentData && (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">💾</span>
                  Télécharger le document
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => downloadDocument("docx")}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">📝</span>
                    Télécharger DOCX
                  </button>

                  <button
                    onClick={() => downloadDocument("pdf")}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">📄</span>
                    Télécharger PDF
                  </button>

                  <button
                    onClick={() => downloadDocument("txt")}
                    className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">📝</span>
                    Télécharger TXT
                  </button>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">💡 Conseil :</span> Le format
                    DOCX est recommandé pour éditer le document. Le PDF est
                    idéal pour l&apos;impression et la signature.
                  </p>
                </div>
              </div>
            )}

            {/* AI Tips */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                <span className="mr-2">🤖</span>
                Assistant IA
              </h3>
              <div className="text-sm text-purple-800 space-y-2">
                <p>• L&apos;IA adapte ses questions selon vos réponses</p>
                <p>• Posez des questions si vous avez des doutes</p>
                <p>• L&apos;IA suggère du contenu juridique approprié</p>
                <p>• Tous les documents respectent le droit français</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
