'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGenerateDocument } from '../../../hooks/use-generate-document'
import InvoiceForm from '../../../components/invoice-form'
import { CompanySettings } from '../../../components/company-settings'
import { Logo } from '../../../components/logo'
import { useUserContext } from '../../../lib/user-context'
import { useDocumentContext } from '../../../context/document-context'
import { useTranslations } from '../../../lib/i18n/context'
import { Invoice } from '../../../../packages/core'
import {
  SparklesIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  BoltIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

export default function NewInvoicePage() {
  const [prompt, setPrompt] = useState('')
  const [generatedInvoice, setGeneratedInvoice] = useState<Partial<Invoice> | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { context } = useUserContext()
  const { saveDocument, getDocument } = useDocumentContext()
  const { t } = useTranslations()

  const generateMutation = useGenerateDocument()

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = getDocument('invoice')
    if (savedDraft) {
      if (savedDraft.prompt) setPrompt(savedDraft.prompt)
      if (savedDraft.generatedInvoice) {
        setGeneratedInvoice(savedDraft.generatedInvoice)
        setShowForm(true)
      }
    }
  }, [getDocument])

  // Auto-save prompt as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (prompt.trim()) {
        saveDocument('invoice', { 
          prompt, 
          generatedInvoice,
          timestamp: Date.now() 
        })
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [prompt, generatedInvoice, saveDocument])

  const handlePromptChange = (value: string) => {
    setPrompt(value)
  }

  const handleGenerateDraft = async () => {
    if (!prompt.trim()) return

    try {
      const result = await generateMutation.mutateAsync({
        prompt: prompt.trim(),
        documentType: 'invoice',
        userContext: context || undefined,
      })

      if (result.success) {
        setGeneratedInvoice(result.document)
        setShowForm(true)
      }
    } catch (error) {
      console.error('Failed to generate invoice:', error)
      alert(
        'Failed to generate invoice: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      )
    }
  }

  const handleSaveInvoice = (invoiceData: Invoice) => {
    alert('Invoice saved! (PDF generation coming in Step 02)')
  }

  const handleStartOver = () => {
    setPrompt('')
    setGeneratedInvoice(null)
    setShowForm(false)
    generateMutation.reset()
  }

  const isButtonDisabled = !prompt.trim() || generateMutation.isPending

  return (
    <div className="min-h-screen xinfinity-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-r from-xinfinity-primary/20 to-xinfinity-secondary/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-xinfinity-accent/20 to-xinfinity-tertiary/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-xfi-6">
        <div className="xinfinity-card overflow-hidden">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-xfi-8 border-b border-xinfinity-border bg-gradient-to-r from-xinfinity-surface/50 to-xinfinity-primary/5"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Logo size="sm" className="mr-xfi-4" />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-xinfinity-primary to-xinfinity-secondary bg-clip-text text-transparent">
                    {t('invoice.title')}
                  </h1>
                  <p className="mt-xfi-1 text-sm text-xinfinity-muted">
                    Generate professional invoices with AI assistance
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-xfi-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center px-xfi-4 py-xfi-2 text-sm font-medium text-xinfinity-foreground bg-xinfinity-surface border border-xinfinity-border rounded-xl hover:bg-xinfinity-surface/80 focus:outline-none focus:ring-2 focus:ring-xinfinity-primary/20 transition-all"
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-xfi-2" />
                  Company Settings
                </button>
                {showForm && (
                  <button
                    onClick={handleStartOver}
                    className="inline-flex items-center px-xfi-4 py-xfi-2 text-sm font-medium text-xinfinity-muted hover:text-xinfinity-foreground bg-xinfinity-surface/50 hover:bg-xinfinity-surface rounded-xl transition-all"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-xfi-2" />
                    Start Over
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="p-xfi-8">
            {!showForm ? (
              // Prompt Input Section
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-xfi-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-xinfinity-primary to-xinfinity-secondary rounded-full mb-xfi-6"
                  >
                    <DocumentTextIcon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-xinfinity-foreground mb-xfi-3">
                    Describe Your Invoice
                  </h2>
                  <p className="text-xinfinity-muted text-lg max-w-2xl mx-auto">
                    Tell us about the work you did and we&apos;ll generate a professional invoice draft for you using AI.
                  </p>
                </div>

                <div className="space-y-xfi-8">
                  {/* Main Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative"
                  >
                    <label className="block text-sm font-semibold text-xinfinity-foreground mb-xfi-3">
                      Invoice Details
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => handlePromptChange(e.target.value)}
                      className="xinfinity-input resize-none text-base"
                      rows={6}
                      placeholder="Example: Invoice ACME Corp $1500 for web design services, due in 14 days. Include logo design and responsive layout."
                      disabled={generateMutation.isPending}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-xinfinity-muted">
                      {prompt.length} characters
                    </div>
                  </motion.div>

                  {/* Status and Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center space-y-xfi-4"
                  >
                    <div className="text-sm text-xinfinity-muted">
                      {prompt.trim().length === 0 ? (
                        t('invoice.prompt.placeholder')
                      ) : (
                        <span className="text-xinfinity-accent font-medium flex items-center">
                          <SparklesIcon className="w-4 h-4 mr-1" />
                          {t('invoice.prompt.readyToGenerate')}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleGenerateDraft}
                      disabled={isButtonDisabled}
                      className="xinfinity-button xinfinity-button-primary px-xfi-8 py-xfi-4 text-lg font-semibold transform hover:scale-105 transition-all"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-xfi-3"></div>
                          {t('invoice.prompt.generating')}
                        </>
                      ) : (
                        <>
                          <BoltIcon className="w-5 h-5 mr-xfi-2" />
                          {t('invoice.prompt.generateDraft')}
                        </>
                      )}
                    </button>
                  </motion.div>

                  {/* Sample Prompts */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-xfi-8 p-xfi-6 xinfinity-card-accent border border-xinfinity-accent/20"
                  >
                    <h3 className="text-lg font-semibold text-xinfinity-foreground mb-xfi-4 flex items-center">
                      <RocketLaunchIcon className="w-5 h-5 mr-xfi-2 text-xinfinity-accent" />
                      {t('invoice.prompt.samplePrompts')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-xfi-3 text-sm">
                      <div className="space-y-xfi-2">
                        <div
                          className="p-xfi-3 bg-xinfinity-surface rounded-xl border border-xinfinity-border hover:border-xinfinity-primary/30 cursor-pointer transition-all hover:shadow-md"
                          onClick={() =>
                            handlePromptChange(
                              'Invoice ACME Corp $2500 for website development, due in 30 days'
                            )
                          }
                        >
                          &quot;Invoice ACME Corp $2500 for website development, due in 30 days&quot;
                        </div>
                        <div
                          className="p-xfi-3 bg-xinfinity-surface rounded-xl border border-xinfinity-border hover:border-xinfinity-primary/30 cursor-pointer transition-all hover:shadow-md"
                          onClick={() =>
                            handlePromptChange(
                              'Bill John Smith $150/hour for 8 hours of consulting, due next Friday'
                            )
                          }
                        >
                          &quot;Bill John Smith $150/hour for 8 hours of consulting, due next Friday&quot;
                        </div>
                      </div>
                      <div className="space-y-xfi-2">
                        <div
                          className="p-xfi-3 bg-xinfinity-surface rounded-xl border border-xinfinity-border hover:border-xinfinity-primary/30 cursor-pointer transition-all hover:shadow-md"
                          onClick={() =>
                            handlePromptChange(
                              'Facture ACME Corp 1500€ pour développement web'
                            )
                          }
                        >
                          &quot;Facture ACME Corp 1500€ pour développement web&quot; (French)
                        </div>
                        <div
                          className="p-xfi-3 bg-xinfinity-surface rounded-xl border border-xinfinity-border hover:border-xinfinity-primary/30 cursor-pointer transition-all hover:shadow-md"
                          onClick={() =>
                            handlePromptChange(
                              'invoice acme corp 1500 dolars for web desing'
                            )
                          }
                        >
                          &quot;invoice acme corp 1500 dolars for web desing&quot; (with typos!)
                        </div>
                      </div>
                    </div>
                    <div className="mt-xfi-4 text-xs text-xinfinity-accent font-medium flex items-center">
                      <SparklesIcon className="w-4 h-4 mr-1" />
                      Click any example to try it, or write your own. AI understands multiple languages and handles typos!
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              // Form Editing Section
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="mb-xfi-6 p-xfi-4 bg-xinfinity-accent/10 border border-xinfinity-accent/20 rounded-xl">
                  <div className="flex items-center">
                    <SparklesIcon className="w-5 h-5 text-xinfinity-accent mr-xfi-2" />
                    <span className="text-xinfinity-foreground font-medium">
                      Invoice draft generated successfully! Review and edit the details below.
                    </span>
                  </div>
                </div>

                <InvoiceForm
                  initialData={generatedInvoice || undefined}
                  onSubmit={handleSaveInvoice}
                  isSubmitting={false}
                />
              </motion.div>
            )}
          </div>
        </div>

        <CompanySettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  )
}
