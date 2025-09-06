'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingSpinner } from '../../../components/loading'
import { DocumentTextIcon, SparklesIcon, EyeIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { NDAPDFPreviewModal } from '../../../components/nda-pdf-preview-modal'

// NDA Form Schema
const ndaFormSchema = z.object({
  // Parties
  disclosingParty: z.object({
    name: z.string().min(1, 'Disclosing party name is required'),
    address: z.string().min(1, 'Disclosing party address is required'),
    type: z.enum(['individual', 'corporation', 'llc', 'partnership'])
  }),
  receivingParty: z.object({
    name: z.string().min(1, 'Receiving party name is required'),
    address: z.string().min(1, 'Receiving party address is required'),
    type: z.enum(['individual', 'corporation', 'llc', 'partnership'])
  }),
  
  // Document Details
  title: z.string().min(1, 'Document title is required'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  terminationDate: z.string().optional(),
  governingLaw: z.string().min(1, 'Governing law is required'),
  confidentialityLevel: z.enum(['standard', 'high', 'maximum']),
  
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

type NDAFormData = z.infer<typeof ndaFormSchema>

const defaultNDAData: NDAFormData = {
  disclosingParty: {
    name: '',
    address: '',
    type: 'corporation'
  },
  receivingParty: {
    name: '',
    address: '',
    type: 'corporation'
  },
  title: 'Non-Disclosure Agreement',
  effectiveDate: new Date().toISOString().split('T')[0],
  terminationDate: '',
  governingLaw: 'State of California',
  confidentialityLevel: 'standard',
  purpose: 'The purpose of this Agreement is to permit the parties to evaluate potential business opportunities and to protect confidential information that may be disclosed during such evaluation.',
  definitions: '"Confidential Information" means any and all non-public, proprietary or confidential information disclosed by the Disclosing Party to the Receiving Party.',
  confidentialityObligations: 'The Receiving Party agrees to hold and maintain the Confidential Information in strict confidence and to take reasonable precautions to protect such Confidential Information.',
  exclusions: 'The obligations of confidentiality shall not apply to information that: (a) is or becomes publicly available through no breach of this Agreement; (b) is rightfully known by the Receiving Party prior to disclosure; (c) is independently developed by the Receiving Party.',
  termClause: 'This Agreement shall remain in effect until terminated by either party with thirty (30) days written notice.',
  governingLawClause: 'This Agreement shall be governed by and construed in accordance with the laws of the State of California.',
  additionalTerms: '',
  specialProvisions: ''
}

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
  
  const [isLoading, setIsLoading] = useState(false)
  const [aiData, setAiData] = useState<any>(null)
  const [showPDFPreview, setShowPDFPreview] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<NDAFormData>({
    resolver: zodResolver(ndaFormSchema),
    defaultValues: defaultNDAData
  })

  const watchedData = watch()

  // Load AI-generated data if coming from enhanced generator
  useEffect(() => {
    if (fromAI) {
      const savedData = localStorage.getItem('aiGeneratedNDA')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setAiData(data)
          
          // Pre-fill form with AI data
          if (data.document) {
            const doc = data.document
            
            // Map AI data to form fields
            if (doc.disclosingParty) {
              setValue('disclosingParty.name', doc.disclosingParty.name || '')
              setValue('disclosingParty.address', doc.disclosingParty.address || '')
              setValue('disclosingParty.type', doc.disclosingParty.type || 'corporation')
            }
            
            if (doc.receivingParty) {
              setValue('receivingParty.name', doc.receivingParty.name || '')
              setValue('receivingParty.address', doc.receivingParty.address || '')
              setValue('receivingParty.type', doc.receivingParty.type || 'corporation')
            }
            
            if (doc.title) setValue('title', doc.title)
            if (doc.effectiveDate) setValue('effectiveDate', doc.effectiveDate)
            if (doc.terminationDate) setValue('terminationDate', doc.terminationDate)
            if (doc.governingLaw) setValue('governingLaw', doc.governingLaw)
            if (doc.confidentialityLevel) setValue('confidentialityLevel', doc.confidentialityLevel)
            
            // Map sections if available
            if (doc.sections) {
              if (doc.sections.purpose) setValue('purpose', doc.sections.purpose)
              if (doc.sections.definitions) setValue('definitions', doc.sections.definitions)
              if (doc.sections.confidentialityObligations) setValue('confidentialityObligations', doc.sections.confidentialityObligations)
              if (doc.sections.exclusions) setValue('exclusions', doc.sections.exclusions)
              if (doc.sections.termClause) setValue('termClause', doc.sections.termClause)
              if (doc.sections.governingLawClause) setValue('governingLawClause', doc.sections.governingLawClause)
            }
          }
          
          toast.success('📄 AI-generated NDA data loaded!')
          // Clear the data after loading
          localStorage.removeItem('aiGeneratedNDA')
        } catch (error) {
          console.error('Error loading AI data:', error)
          toast.error('Failed to load AI-generated data')
        }
      }
    }
  }, [fromAI, setValue])

  const onSubmit = (data: NDAFormData) => {
    console.log('NDA form submitted:', data)
    toast.success('✅ NDA ready for export!')
  }

  const handlePreviewPDF = () => {
    const currentData = watchedData
    setShowPDFPreview(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-100/50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            NDA Document Editor
          </h1>
          <p className="text-gray-600 text-lg">
            Create professional Non-Disclosure Agreements with legal-grade formatting
          </p>
          {fromAI && aiData && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Pre-filled with AI-generated content
            </div>
          )}
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Document Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <DocumentTextIcon className="w-6 h-6 mr-2 text-purple-600" />
              Document Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title *
                </label>
                <input
                  {...register('title')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Non-Disclosure Agreement"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidentiality Level *
                </label>
                <select
                  {...register('confidentialityLevel')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="high">High</option>
                  <option value="maximum">Maximum</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effective Date *
                </label>
                <input
                  type="date"
                  {...register('effectiveDate')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {errors.effectiveDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.effectiveDate.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Termination Date (Optional)
                </label>
                <input
                  type="date"
                  {...register('terminationDate')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Governing Law *
                </label>
                <input
                  {...register('governingLaw')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="State of California"
                />
                {errors.governingLaw && (
                  <p className="text-red-600 text-sm mt-1">{errors.governingLaw.message}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Parties Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Disclosing Party */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 text-purple-800">Disclosing Party</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    {...register('disclosingParty.name')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Company or Individual Name"
                  />
                  {errors.disclosingParty?.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.disclosingParty.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entity Type *
                  </label>
                  <select
                    {...register('disclosingParty.type')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="individual">Individual</option>
                    <option value="corporation">Corporation</option>
                    <option value="llc">LLC</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    {...register('disclosingParty.address')}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="123 Business St, City, State 12345"
                  />
                  {errors.disclosingParty?.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.disclosingParty.address.message}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Receiving Party */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 text-pink-800">Receiving Party</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    {...register('receivingParty.name')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Company or Individual Name"
                  />
                  {errors.receivingParty?.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.receivingParty.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entity Type *
                  </label>
                  <select
                    {...register('receivingParty.type')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="individual">Individual</option>
                    <option value="corporation">Corporation</option>
                    <option value="llc">LLC</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    {...register('receivingParty.address')}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    placeholder="456 Client Ave, City, State 67890"
                  />
                  {errors.receivingParty?.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.receivingParty.address.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Document Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-6">Document Sections</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose *
                </label>
                <textarea
                  {...register('purpose')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe the purpose of this NDA..."
                />
                {errors.purpose && (
                  <p className="text-red-600 text-sm mt-1">{errors.purpose.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Definitions *
                </label>
                <textarea
                  {...register('definitions')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Define key terms and confidential information..."
                />
                {errors.definitions && (
                  <p className="text-red-600 text-sm mt-1">{errors.definitions.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidentiality Obligations *
                </label>
                <textarea
                  {...register('confidentialityObligations')}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Specify the obligations of the receiving party..."
                />
                {errors.confidentialityObligations && (
                  <p className="text-red-600 text-sm mt-1">{errors.confidentialityObligations.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exclusions *
                </label>
                <textarea
                  {...register('exclusions')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="List information that is not considered confidential..."
                />
                {errors.exclusions && (
                  <p className="text-red-600 text-sm mt-1">{errors.exclusions.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Term & Termination *
                </label>
                <textarea
                  {...register('termClause')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Specify the duration and termination conditions..."
                />
                {errors.termClause && (
                  <p className="text-red-600 text-sm mt-1">{errors.termClause.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Governing Law Clause *
                </label>
                <textarea
                  {...register('governingLawClause')}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Specify the governing law and jurisdiction..."
                />
                {errors.governingLawClause && (
                  <p className="text-red-600 text-sm mt-1">{errors.governingLawClause.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Terms (Optional)
                </label>
                <textarea
                  {...register('additionalTerms')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Any additional terms or clauses..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Provisions (Optional)
                </label>
                <textarea
                  {...register('specialProvisions')}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Any special provisions or requirements..."
                />
              </div>
            </div>
          </motion.div>

          {/* AI Assumptions Display */}
          {aiData?.assumptions && aiData.assumptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-blue-800 mb-4">AI Assumptions Made</h3>
              <ul className="space-y-2 text-blue-700">
                {aiData.assumptions.map((assumption: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {assumption}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-blue-600 mt-4">
                Please review and modify the form fields as needed to ensure accuracy.
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                'Review NDA'
              )}
            </button>
            
            <button
              type="button"
              onClick={handlePreviewPDF}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center"
            >
              <EyeIcon className="w-5 h-5 mr-2" />
              Preview PDF
            </button>
            
            <button
              type="button"
              onClick={() => {
                const generator = require('../../../lib/nda-pdf-generator').generateNDAPDF(watchedData)
                generator.download()
                toast.success('📄 NDA PDF downloaded!')
              }}
              className="w-full sm:w-auto px-8 py-3 bg-white text-purple-600 border-2 border-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all shadow-lg flex items-center justify-center"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Download PDF
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full sm:w-auto px-8 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all shadow-lg"
            >
              Cancel
            </button>
          </motion.div>
        </form>
        
        {/* PDF Preview Modal */}
        <NDAPDFPreviewModal
          isOpen={showPDFPreview}
          onClose={() => setShowPDFPreview(false)}
          ndaData={watchedData}
        />
      </div>
    </div>
  )
}
