"use client";

import React from "react";
import { AILegalDocumentChat } from "../../../components/ai-legal-document-chat";

export default function LegalDocumentChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Floating Animation Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-400/20 to-cyan-600/20 blur-3xl animate-pulse delay-1000"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent mb-6">
              Assistant IA Juridique
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
              Créez vos documents juridiques avec l&apos;aide d&apos;une
              intelligence artificielle conversationnelle
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Conversation IA
                </h3>
                <p className="text-gray-600 text-sm">
                  L&apos;IA vous guide étape par étape pour créer votre document
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Export Professionnel
                </h3>
                <p className="text-gray-600 text-sm">
                  DOCX, PDF et TXT avec formatage professionnel
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Adaptatif</h3>
                <p className="text-gray-600 text-sm">
                  S&apos;adapte à tous types de documents juridiques français
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section className="relative px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Commencez votre conversation juridique
              </h2>
              <p className="text-gray-600">
                Décrivez le type de document que vous souhaitez créer ou posez
                une question juridique
              </p>
            </div>

            <AILegalDocumentChat />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="relative px-4 py-16 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              ⚖️ Avertissement Juridique
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Cette IA génère des documents juridiques basés sur le droit
              français. Il est{" "}
              <strong className="text-yellow-400">fortement recommandé</strong>{" "}
              de faire vérifier tout document par un professionnel du droit
              avant signature et utilisation. L&apos;IA peut omettre des
              éléments spécifiques à votre situation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400">
            Propulsé par <strong className="text-blue-400">Xinvoice</strong> -
            Assistant IA Juridique • Technologie OpenAI & Gemini
          </p>
        </div>
      </footer>
    </div>
  );
}
