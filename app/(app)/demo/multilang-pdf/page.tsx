/**
 * Multilingual Document Generation Demo
 * Interactive testing page for multilingual AI features
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useGenerateMultilingualDocument, useGenerateMultilingualBatchDocuments, downloadMultilingualDocumentAsPDF } from '../../../hooks/use-generate-multilingual-document'
import { usePersistedSettings } from '../../../hooks/use-persisted-settings'
import { motion } from 'framer-motion'
import { DocumentType, Locale } from '../../../../packages/core'

const supportedLocales: { value: Locale; label: string; flag: string }[] = [
  { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { value: 'fr-FR', label: 'Français (France)', flag: '🇫🇷' },
  { value: 'de-DE', label: 'Deutsch (Deutschland)', flag: '🇩🇪' },
  { value: 'es-ES', label: 'Español (España)', flag: '🇪🇸' },
  { value: 'ar-SA', label: 'العربية (السعودية)', flag: '🇸🇦' },
  { value: 'zh-CN', label: '中文 (简体)', flag: '🇨🇳' },
  { value: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { value: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
  { value: 'it-IT', label: 'Italiano (Italia)', flag: '🇮🇹' },
  { value: 'ru-RU', label: 'Русский (Россия)', flag: '🇷🇺' },
  { value: 'hi-IN', label: 'हिन्दी (भारत)', flag: '🇮🇳' },
]

const samplePrompts = {
  invoice: {
    'en-US': 'Create an invoice for web development services to TechCorp for $2,500 including React frontend, Node.js backend, and deployment.',
    'fr-FR': 'Créer une facture pour des services de développement web à TechCorp pour 2 500 € incluant frontend React, backend Node.js et déploiement.',
    'de-DE': 'Erstellen Sie eine Rechnung für Webentwicklungsdienste an TechCorp für 2.500 € einschließlich React-Frontend, Node.js-Backend und Bereitstellung.',
    'es-ES': 'Crear una factura para servicios de desarrollo web a TechCorp por 2.500 € incluyendo frontend React, backend Node.js y despliegue.',
    'ar-SA': 'إنشاء فاتورة لخدمات تطوير الويب لشركة TechCorp بمبلغ 2500 دولار تشمل واجهة React الأمامية وخادم Node.js والنشر.',
    'zh-CN': '为TechCorp创建网站开发服务发票，金额2500美元，包括React前端、Node.js后端和部署。',
    'ja-JP': 'TechCorp向けウェブ開発サービスの請求書を作成してください。金額は2,500ドルで、Reactフロントエンド、Node.jsバックエンド、デプロイメントを含みます。',
    'pt-BR': 'Criar uma fatura para serviços de desenvolvimento web para TechCorp no valor de R$ 2.500 incluindo frontend React, backend Node.js e implantação.',
    'it-IT': 'Creare una fattura per servizi di sviluppo web per TechCorp per 2.500 € inclusi frontend React, backend Node.js e distribuzione.',
    'ru-RU': 'Создать счет-фактуру для услуг веб-разработки для TechCorp на сумму 2500 долларов, включая React frontend, Node.js backend и развертывание.',
    'hi-IN': 'TechCorp के लिए वेब डेवलपमेंट सेवाओं के लिए 2,500 डॉलर का चालान बनाएं जिसमें React फ्रंटएंड, Node.js बैकएंड और डिप्लॉयमेंट शामिल है।',
  },
  nda: {
    'en-US': 'Create an NDA between DataCorp and TechSolutions for a 2-year software development project involving confidential algorithms.',
    'fr-FR': 'Créer un accord de confidentialité entre DataCorp et TechSolutions pour un projet de développement logiciel de 2 ans impliquant des algorithmes confidentiels.',
    'de-DE': 'Erstellen Sie eine Geheimhaltungsvereinbarung zwischen DataCorp und TechSolutions für ein 2-jähriges Softwareentwicklungsprojekt mit vertraulichen Algorithmen.',
    'es-ES': 'Crear un acuerdo de confidencialidad entre DataCorp y TechSolutions para un proyecto de desarrollo de software de 2 años que involucra algoritmos confidenciales.',
    'ar-SA': 'إنشاء اتفاقية عدم إفشاء بين DataCorp و TechSolutions لمشروع تطوير برمجيات لمدة عامين يتضمن خوارزميات سرية.',
    'zh-CN': '为DataCorp和TechSolutions创建保密协议，涉及为期2年的软件开发项目，包含机密算法。',
    'ja-JP': 'DataCorpとTechSolutionsの間で、機密アルゴリズムを含む2年間のソフトウェア開発プロジェクトのNDAを作成してください。',
    'pt-BR': 'Criar um acordo de confidencialidade entre DataCorp e TechSolutions para um projeto de desenvolvimento de software de 2 anos envolvendo algoritmos confidenciais.',
    'it-IT': 'Creare un accordo di riservatezza tra DataCorp e TechSolutions per un progetto di sviluppo software di 2 anni che coinvolge algoritmi riservati.',
    'ru-RU': 'Создать соглашение о неразглашении между DataCorp и TechSolutions для 2-летнего проекта разработки программного обеспечения с использованием конфиденциальных алгоритмов.',
    'hi-IN': 'DataCorp और TechSolutions के बीच 2 साल की सॉफ्टवेयर डेवलपमेंट प्रोजेक्ट के लिए एक गोपनीयता समझौता बनाएं जिसमें गुप्त एल्गोरिदम शामिल हैं।',
  }
}

export default function MultilingualDocumentDemo() {
  const [selectedLocale, setSelectedLocale] = useState<Locale>('en-US')
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>('invoice')
  const [prompt, setPrompt] = useState('')
  const [batchPrompts, setBatchPrompts] = useState<string[]>([''])
  const [mode, setMode] = useState<'single' | 'batch'>('single')
  const [includeTranslations, setIncludeTranslations] = useState(true)
  const [culturalContext, setCulturalContext] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted before allowing downloads
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { userContext } = usePersistedSettings()
  const generateSingle = useGenerateMultilingualDocument()
  const generateBatch = useGenerateMultilingualBatchDocuments()

  const handleGenerateSingle = () => {
    if (!prompt.trim()) return

    generateSingle.mutate({
      prompt: prompt.trim(),
      documentType: selectedDocumentType,
      locale: selectedLocale,
      userContext: {
        ...userContext,
        defaultCurrency: userContext.defaultCurrency as any, // Type cast to handle currency enum
        defaultLocale: userContext.defaultLocale as any // Type cast to handle locale enum
      },
      includeTranslations,
      culturalContext,
    })
  }

  const handleGenerateBatch = () => {
    const validPrompts = batchPrompts.filter(p => p.trim())
    if (validPrompts.length === 0) return

    generateBatch.mutate({
      prompts: validPrompts,
      documentType: selectedDocumentType,
      locale: selectedLocale,
      userContext: {
        ...userContext,
        defaultCurrency: userContext.defaultCurrency as any, // Type cast to handle currency enum
        defaultLocale: userContext.defaultLocale as any // Type cast to handle locale enum
      },
      includeTranslations,
      culturalContext,
    })
  }

  const handleDownloadPDF = async (document: any, localization: any) => {
    try {
      // Ensure we're in a browser environment, DOM is ready, and component is mounted
      if (typeof window === 'undefined' || typeof document === 'undefined' || !isMounted) {
        console.warn('PDF download is not available during server-side rendering or before component mount')
        return
      }

      const filename = `${selectedDocumentType}_${selectedLocale}_${Date.now()}.pdf`
      await downloadMultilingualDocumentAsPDF(document, localization, selectedDocumentType, filename)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const loadSamplePrompt = () => {
    const sample = (samplePrompts as any)[selectedDocumentType]?.[selectedLocale] || (samplePrompts as any)[selectedDocumentType]?.['en-US']
    if (sample) {
      setPrompt(sample)
    }
  }

  const addBatchPrompt = () => {
    setBatchPrompts([...batchPrompts, ''])
  }

  const updateBatchPrompt = (index: number, value: string) => {
    const updated = [...batchPrompts]
    updated[index] = value
    setBatchPrompts(updated)
  }

  const removeBatchPrompt = (index: number) => {
    setBatchPrompts(batchPrompts.filter((_, i) => i !== index))
  }

  const selectedLocaleData = supportedLocales.find(l => l.value === selectedLocale)
  const isRTL = ['ar-SA'].includes(selectedLocale)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌍 Multilingual Document Generation
          </h1>
          <p className="text-lg text-gray-600">
            Generate AI-powered invoices and NDAs in multiple languages
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuration</h2>

              {/* Language Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language / اللغة / 언어
                </label>
                <select
                  value={selectedLocale}
                  onChange={(e) => setSelectedLocale(e.target.value as Locale)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {supportedLocales.map((locale) => (
                    <option key={locale.value} value={locale.value}>
                      {locale.flag} {locale.label}
                    </option>
                  ))}
                </select>
                {selectedLocaleData && (
                  <p className="text-xs text-gray-500 mt-1">
                    Direction: {isRTL ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
                  </p>
                )}
              </div>

              {/* Document Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedDocumentType('invoice')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedDocumentType === 'invoice'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    📄 Invoice
                  </button>
                  <button
                    onClick={() => setSelectedDocumentType('nda')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedDocumentType === 'nda'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    📋 NDA
                  </button>
                </div>
              </div>

              {/* Generation Mode */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMode('single')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      mode === 'single'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setMode('batch')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      mode === 'batch'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Batch
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeTranslations}
                    onChange={(e) => setIncludeTranslations(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include UI translations</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={culturalContext}
                    onChange={(e) => setCulturalContext(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Apply cultural context</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {mode === 'single' ? 'Document Prompt' : 'Batch Prompts'}
                </h2>
                <button
                  onClick={loadSamplePrompt}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Load Sample
                </button>
              </div>

              {mode === 'single' ? (
                <div className="space-y-4">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Enter your ${selectedDocumentType} requirements in ${selectedLocaleData?.label}...`}
                    className={`w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <button
                    onClick={handleGenerateSingle}
                    disabled={!prompt.trim() || generateSingle.isPending}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                  >
                    {generateSingle.isPending ? 'Generating...' : `Generate ${selectedDocumentType.toUpperCase()}`}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {batchPrompts.map((batchPrompt, index) => (
                    <div key={index} className="flex gap-2">
                      <textarea
                        value={batchPrompt}
                        onChange={(e) => updateBatchPrompt(index, e.target.value)}
                        placeholder={`Prompt ${index + 1} in ${selectedLocaleData?.label}...`}
                        className={`flex-1 h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                          isRTL ? 'text-right' : 'text-left'
                        }`}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                      {batchPrompts.length > 1 && (
                        <button
                          onClick={() => removeBatchPrompt(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button
                      onClick={addBatchPrompt}
                      className="px-4 py-2 text-blue-600 border border-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      disabled={batchPrompts.length >= 10}
                    >
                      + Add Prompt
                    </button>
                    <button
                      onClick={handleGenerateBatch}
                      disabled={batchPrompts.filter(p => p.trim()).length === 0 || generateBatch.isPending}
                      className="flex-1 py-2 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                    >
                      {generateBatch.isPending ? 'Generating...' : `Generate Batch (${batchPrompts.filter(p => p.trim()).length})`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Results Panel */}
        {(generateSingle.data || generateBatch.data) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Generated Documents</h2>

              {mode === 'single' && generateSingle.data && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <h3 className="font-medium text-green-800">
                        {generateSingle.data.localization.language} {selectedDocumentType.toUpperCase()}
                      </h3>
                      <p className="text-sm text-green-600">
                        Generated in {generateSingle.data.localization.locale} • {generateSingle.data.localization.direction.toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadPDF(generateSingle.data!.document, generateSingle.data!.localization)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      📄 Download PDF
                    </button>
                  </div>

                  <div className={`p-4 bg-gray-50 rounded-lg ${
                    generateSingle.data.localization.direction === 'rtl' ? 'text-right' : 'text-left'
                  }`}>
                    <h4 className="font-medium text-gray-900 mb-2">Formatted Document:</h4>
                    <pre 
                      className="whitespace-pre-wrap text-sm text-gray-700 font-mono"
                      dir={generateSingle.data.localization.direction}
                    >
                      {generateSingle.data.formatted_document}
                    </pre>
                  </div>

                  {generateSingle.data.assumptions && generateSingle.data.assumptions.length > 0 && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">AI Assumptions:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {generateSingle.data.assumptions.map((assumption, index) => (
                          <li key={index}>• {assumption}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {mode === 'batch' && generateBatch.data && (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-800 mb-2">Batch Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Total Requested:</span>
                        <div className="font-medium">{generateBatch.data.batch_stats.total_requested}</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Generated:</span>
                        <div className="font-medium">{generateBatch.data.batch_stats.total_generated}</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Success Rate:</span>
                        <div className="font-medium">{generateBatch.data.batch_stats.success_rate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Language:</span>
                        <div className="font-medium">{generateBatch.data.batch_stats.language}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {generateBatch.data.documents.map((doc, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                          <h4 className="font-medium text-gray-900">
                            Document {doc.id} • {doc.localization.language}
                          </h4>
                          <button
                            onClick={() => handleDownloadPDF(doc.document, doc.localization)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                          >
                            📄 PDF
                          </button>
                        </div>
                        <div className={`p-4 ${
                          doc.localization.direction === 'rtl' ? 'text-right' : 'text-left'
                        }`}>
                          <pre 
                            className="whitespace-pre-wrap text-sm text-gray-700 font-mono line-clamp-6"
                            dir={doc.localization.direction}
                          >
                            {doc.formatted_document.substring(0, 300)}...
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Error Display */}
        {(generateSingle.error || generateBatch.error) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-800 mb-2">Generation Error</h3>
              <p className="text-sm text-red-600">
                {generateSingle.error?.message || generateBatch.error?.message}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
