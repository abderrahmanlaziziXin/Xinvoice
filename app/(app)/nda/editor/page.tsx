'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingSpinner } from '../../../components/loading'
import {
  DocumentTextIcon,
  SparklesIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

// Enhanced NDA Form Schema
const ndaEditorSchema = z.object({
  // Parties
  disclosingParty: z.object({
    name: z.string().min(1, 'Disclosing party name is required'),
    address: z.string().min(1, 'Disclosing party address is required'),
  }),
  receivingParty: z.object({
    name: z.string().min(1, 'Receiving party name is required'),
    address: z.string().min(1, 'Receiving party address is required'),
  }),
  
  // Document Details
  title: z.string().min(1, 'Document title is required'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  terminationDate: z.string().optional(),
  governingLaw: z.string().min(1, 'Governing law is required'),
  
  // Document Sections
  purpose: z.string().min(1, 'Purpose is required'),
  definitions: z.string().min(1, 'Definitions are required'),
  confidentialityObligations: z.string().min(1, 'Confidentiality obligations are required'),
  exclusions: z.string().min(1, 'Exclusions are required'),
  termClause: z.string().min(1, 'Term clause is required'),
  governingLawClause: z.string().min(1, 'Governing law clause is required'),
  
  // Optional fields
  additionalTerms: z.string().optional(),
  specialProvisions: z.string().optional()
})

type NDAEditorData = z.infer<typeof ndaEditorSchema>

export default function NDAEditorPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NDAEditorContent />
    </Suspense>
  )
}

function NDAEditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromAI = searchParams.get('from') === 'ai'
  
  const [aiData, setAiData] = useState<any>(null)
  const [assumptions, setAssumptions] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('purpose')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<NDAEditorData>({
    resolver: zodResolver(ndaEditorSchema),
    defaultValues: {
      disclosingParty: { name: '', address: '' },
      receivingParty: { name: '', address: '' },
      title: 'Non-Disclosure Agreement',
      effectiveDate: new Date().toISOString().split('T')[0],
      terminationDate: '',
      governingLaw: 'State of California',
      purpose: '',
      definitions: '',
      confidentialityObligations: '',
      exclusions: '',
      termClause: '',
      governingLawClause: '',
      additionalTerms: '',
      specialProvisions: ''
    }
  })

  const watchedData = watch()

  // Load AI-generated data if coming from AI workflow
  useEffect(() => {
    if (fromAI) {
      const savedData = localStorage.getItem('aiGeneratedNDA')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setAiData(data)
          
          // Extract assumptions if available
          if (data.assumptions) {
            setAssumptions(data.assumptions)
          }
          
          // Pre-fill form with AI data
          if (data.document) {
            const doc = data.document
            
            // Map AI data to form fields
            if (doc.disclosingParty) {
              setValue('disclosingParty.name', doc.disclosingParty.name || '')
              setValue('disclosingParty.address', doc.disclosingParty.address || '')
            }
            
            if (doc.receivingParty) {
              setValue('receivingParty.name', doc.receivingParty.name || '')
              setValue('receivingParty.address', doc.receivingParty.address || '')
            }
            
            if (doc.title) setValue('title', doc.title)
            if (doc.effectiveDate) setValue('effectiveDate', doc.effectiveDate)
            if (doc.terminationDate) setValue('terminationDate', doc.terminationDate)
            if (doc.governingLaw) setValue('governingLaw', doc.governingLaw)
            
            // Map sections if available
            if (doc.sections) {
              if (doc.sections.purpose) setValue('purpose', doc.sections.purpose)
              if (doc.sections.definitions) setValue('definitions', doc.sections.definitions)
              if (doc.sections.confidentialityObligations) setValue('confidentialityObligations', doc.sections.confidentialityObligations)
              if (doc.sections.exclusions) setValue('exclusions', doc.sections.exclusions)
              if (doc.sections.termClause) setValue('termClause', doc.sections.termClause)
              if (doc.sections.governingLawClause) setValue('governingLawClause', doc.sections.governingLawClause)
              if (doc.sections.additionalTerms) setValue('additionalTerms', doc.sections.additionalTerms)
              if (doc.sections.specialProvisions) setValue('specialProvisions', doc.sections.specialProvisions)
            }
            
            // Try to extract sections from formatted text if sections object is not available
            if (!doc.sections && data.formatted_document) {
              const formatted = data.formatted_document
              // Simple extraction logic - this could be enhanced
              setValue('purpose', extractSection(formatted, 'PURPOSE') || 'AI-generated purpose will appear here after processing.')
              setValue('definitions', extractSection(formatted, 'DEFINITIONS') || 'AI-generated definitions will appear here after processing.')
              setValue('confidentialityObligations', extractSection(formatted, 'CONFIDENTIALITY') || 'AI-generated confidentiality obligations will appear here after processing.')
              setValue('exclusions', extractSection(formatted, 'EXCLUSIONS') || 'AI-generated exclusions will appear here after processing.')
              setValue('termClause', extractSection(formatted, 'TERM') || 'AI-generated term clause will appear here after processing.')
              setValue('governingLawClause', extractSection(formatted, 'GOVERNING LAW') || 'AI-generated governing law clause will appear here after processing.')
            }
          }
          
          toast.success('📄 AI-generated NDA loaded successfully!')
          // Clear the data after loading
          localStorage.removeItem('aiGeneratedNDA')
        } catch (error) {
          console.error('Error loading AI data:', error)
          toast.error('Failed to load AI-generated data')
        }
      }
    }
  }, [fromAI, setValue])

  // Helper function to extract sections from formatted text
  const extractSection = (text: string, sectionName: string): string => {
    const regex = new RegExp(`${sectionName}[:\\s]*(.*?)(?=\\n\\n|$)`, 'si')
    const match = text.match(regex)
    return match ? match[1].trim() : ''
  }

  const sections = [
    { id: 'purpose', title: 'Purpose', field: 'purpose' },
    { id: 'definitions', title: 'Definitions', field: 'definitions' },
    { id: 'confidentiality', title: 'Confidentiality Obligations', field: 'confidentialityObligations' },
    { id: 'exclusions', title: 'Exclusions', field: 'exclusions' },
    { id: 'term', title: 'Term & Termination', field: 'termClause' },
    { id: 'governing', title: 'Governing Law', field: 'governingLawClause' },
    { id: 'additional', title: 'Additional Terms', field: 'additionalTerms' },
    { id: 'special', title: 'Special Provisions', field: 'specialProvisions' }
  ]

  const handleCopyText = () => {
    const fullText = generateFullNDAText(watchedData)
    navigator.clipboard.writeText(fullText)
    toast.success('📋 NDA text copied to clipboard!')
  }

  const handleCopyJSON = () => {
    const jsonData = JSON.stringify(watchedData, null, 2)
    navigator.clipboard.writeText(jsonData)
    toast.success('📋 NDA JSON copied to clipboard!')
  }

  const handleDownloadPDF = async () => {
    setIsExporting(true)
    try {
      // Use existing PDF generation logic (similar to invoice PDF generation)
      const fullText = generateFullNDAText(watchedData)
      
      // Create a simple PDF download (you can enhance this with your existing PDF utilities)
      const element = document.createElement('a')
      const file = new Blob([fullText], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = `${watchedData.title || 'NDA'}.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      
      toast.success('📄 NDA downloaded successfully!')
    } catch (error) {
      toast.error('Failed to generate PDF')
    } finally {
      setIsExporting(false)
    }
  }

  const generateFullNDAText = (data: NDAEditorData): string => {
    return `${data.title}

PARTIES:
Disclosing Party: ${data.disclosingParty.name}
Address: ${data.disclosingParty.address}

Receiving Party: ${data.receivingParty.name}
Address: ${data.receivingParty.address}

EFFECTIVE DATE: ${data.effectiveDate}
${data.terminationDate ? `TERMINATION DATE: ${data.terminationDate}` : ''}
GOVERNING LAW: ${data.governingLaw}

PURPOSE:
${data.purpose}

DEFINITIONS:
${data.definitions}

CONFIDENTIALITY OBLIGATIONS:
${data.confidentialityObligations}

EXCLUSIONS:
${data.exclusions}

TERM & TERMINATION:
${data.termClause}

GOVERNING LAW:
${data.governingLawClause}

${data.additionalTerms ? `ADDITIONAL TERMS:\n${data.additionalTerms}\n` : ''}
${data.specialProvisions ? `SPECIAL PROVISIONS:\n${data.specialProvisions}` : ''}
`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/nda/new" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to NDA Hub
            </Link>
            <div className="flex items-center space-x-2">
              {fromAI && <SparklesIcon className="w-5 h-5 text-indigo-600" />}
              <DocumentTextIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-600">
                {fromAI ? 'AI-Generated' : 'Manual'} NDA Editor
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Assumptions */}
            {fromAI && assumptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
              >
                <div className="flex items-start">
                  <SparklesIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-2">AI Assumptions Made</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {assumptions.map((assumption, index) => (
                        <li key={index}>• {assumption}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Document Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Document Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    {...register('title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Effective Date</label>
                  <input
                    type="date"
                    {...register('effectiveDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Parties */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Parties</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Disclosing Party</h3>
                  <div className="space-y-3">
                    <input
                      {...register('disclosingParty.name')}
                      placeholder="Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                      {...register('disclosingParty.address')}
                      placeholder="Address"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Receiving Party</h3>
                  <div className="space-y-3">
                    <input
                      {...register('receivingParty.name')}
                      placeholder="Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <textarea
                      {...register('receivingParty.address')}
                      placeholder="Address"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* NDA Sections */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Legal Sections</h2>
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 rounded-t-lg"
                    >
                      <span className="font-medium text-gray-900">{section.title}</span>
                      <motion.div
                        animate={{ rotate: expandedSection === section.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </button>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4"
                      >
                        <textarea
                          {...register(section.field as keyof NDAEditorData)}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder={`Enter ${section.title.toLowerCase()} section...`}
                        />
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Export Options */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Share</h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                  Download PDF
                </button>
                
                <button
                  onClick={handleCopyText}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <ClipboardDocumentIcon className="w-5 h-5 mr-2" />
                  Copy as Text
                </button>
                
                <button
                  onClick={handleCopyJSON}
                  className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  <ClipboardDocumentIcon className="w-5 h-5 mr-2" />
                  Copy JSON
                </button>
              </div>
            </motion.div>

            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sections:</span>
                  <span className="font-medium">{sections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Source:</span>
                  <span className="font-medium">{fromAI ? 'AI Generated' : 'Manual'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Draft</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
