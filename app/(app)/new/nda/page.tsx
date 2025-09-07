'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingSpinner } from '../../../components/loading'
import { Logo } from '../../../components/logo'
import { DocumentTextIcon, SparklesIcon, EyeIcon, DocumentArrowDownIcon, UserGroupIcon, CalendarIcon, ShieldCheckIcon, ScaleIcon } from '@heroicons/react/24/outline'
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-xfi-8"
        >
          <div className="flex items-center justify-center mb-xfi-4">
            <Logo size="md" className="mr-xfi-3" />
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-xinfinity-primary/30 to-transparent mx-xfi-4" />
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-xinfinity-primary via-xinfinity-secondary to-xinfinity-accent bg-clip-text text-transparent">
              NDA Document Studio
            </h1>
          </div>
          <p className="text-xinfinity-muted text-lg max-w-2xl mx-auto leading-relaxed">
            Create professional Non-Disclosure Agreements with AI-powered assistance and legal-grade formatting
          </p>
          {fromAI && aiData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-xfi-6 inline-flex items-center px-xfi-6 py-xfi-3 xinfinity-card text-xinfinity-primary rounded-full text-sm font-medium"
            >
              <SparklesIcon className="w-4 h-4 mr-xfi-2" />
              Pre-filled with AI-generated content
            </motion.div>
          )}
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-xfi-8">
          {/* Document Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="xinfinity-card p-xfi-8"
          >
            <h2 className="text-xl font-semibold mb-xfi-6 flex items-center text-xinfinity-foreground">
              <DocumentTextIcon className="w-6 h-6 mr-xfi-3 text-xinfinity-primary" />
              Document Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xfi-6">
              <div>
                <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                  Document Title *
                </label>
                <input
                  {...register('title')}
                  className="xinfinity-input"
                  placeholder="Non-Disclosure Agreement"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-xfi-1">{errors.title.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                  Confidentiality Level *
                </label>
                <select
                  {...register('confidentialityLevel')}
                  className="xinfinity-input"
                >
                  <option value="standard">Standard</option>
                  <option value="high">High</option>
                  <option value="maximum">Maximum</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                  Effective Date *
                </label>
                <input
                  type="date"
                  {...register('effectiveDate')}
                  className="xinfinity-input"
                />
                {errors.effectiveDate && (
                  <p className="text-red-500 text-sm mt-xfi-1">{errors.effectiveDate.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                  Termination Date (Optional)
                </label>
                <input
                  type="date"
                  {...register('terminationDate')}
                  className="xinfinity-input"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                  Governing Law *
                </label>
                <input
                  {...register('governingLaw')}
                  className="xinfinity-input"
                  placeholder="State of California"
                />
                {errors.governingLaw && (
                  <p className="text-red-500 text-sm mt-xfi-1">{errors.governingLaw.message}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Parties Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xfi-8">
            {/* Disclosing Party */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="xinfinity-card p-xfi-6"
            >
              <h3 className="text-lg font-semibold mb-xfi-4 text-xinfinity-primary flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-xfi-2" />
                Disclosing Party
              </h3>
              
              <div className="space-y-xfi-4">
                <div>
                  <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                    Name *
                  </label>
                  <input
                    {...register('disclosingParty.name')}
                    className="xinfinity-input"
                    placeholder="Company or Individual Name"
                  />
                  {errors.disclosingParty?.name && (
                    <p className="text-red-500 text-sm mt-xfi-1">{errors.disclosingParty.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                    Entity Type *
                  </label>
                  <select
                    {...register('disclosingParty.type')}
                    className="xinfinity-input"
                  >
                    <option value="individual">Individual</option>
                    <option value="corporation">Corporation</option>
                    <option value="llc">LLC</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                    Address *
                  </label>
                  <textarea
                    {...register('disclosingParty.address')}
                    rows={3}
                    className="xinfinity-input resize-none"
                    placeholder="123 Business St, City, State 12345"
                  />
                  {errors.disclosingParty?.address && (
                    <p className="text-red-500 text-sm mt-xfi-1">{errors.disclosingParty.address.message}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Receiving Party */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="xinfinity-card p-xfi-6"
            >
              <h3 className="text-lg font-semibold mb-xfi-4 text-xinfinity-secondary flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-xfi-2" />
                Receiving Party
              </h3>
              
              <div className="space-y-xfi-4">
                <div>
                  <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                    Name *
                  </label>
                  <input
                    {...register('receivingParty.name')}
                    className="xinfinity-input"
                    placeholder="Company or Individual Name"
                  />
                  {errors.receivingParty?.name && (
                    <p className="text-red-500 text-sm mt-xfi-1">{errors.receivingParty.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                    Entity Type *
                  </label>
                  <select
                    {...register('receivingParty.type')}
                    className="xinfinity-input"
                  >
                    <option value="individual">Individual</option>
                    <option value="corporation">Corporation</option>
                    <option value="llc">LLC</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                    Address *
                  </label>
                  <textarea
                    {...register('receivingParty.address')}
                    rows={3}
                    className="xinfinity-input resize-none"
                    placeholder="456 Client Ave, City, State 67890"
                  />
                  {errors.receivingParty?.address && (
                    <p className="text-red-500 text-sm mt-xfi-1">{errors.receivingParty.address.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Document Sections */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="xinfinity-card p-xfi-8"
          >
            <h2 className="text-xl font-semibold mb-xfi-6 flex items-center text-xinfinity-foreground">
              <ScaleIcon className="w-6 h-6 mr-xfi-3 text-xinfinity-primary" />
              Document Sections
            </h2>
            
            <div className="space-y-xfi-6">
              <div>
                <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                  Purpose *
                </label>
                <textarea
                  {...register('purpose')}
                  rows={3}
                  className="xinfinity-input resize-none"
                  placeholder="Describe the purpose of this NDA..."
                />
                {errors.purpose && (
                  <p className="text-red-500 text-sm mt-xfi-1">{errors.purpose.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                  Definitions *
                </label>
                <textarea
                  {...register('definitions')}
                  rows={3}
                  className="xinfinity-input resize-none"
                  placeholder="Define key terms and confidential information..."
                />
                {errors.definitions && (
                  <p className="text-red-500 text-sm mt-xfi-1">{errors.definitions.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                  Confidentiality Obligations *
                </label>
                <textarea
                  {...register('confidentialityObligations')}
                  rows={4}
                  className="xinfinity-input resize-none"
                  placeholder="Specify the obligations of the receiving party..."
                />
                {errors.confidentialityObligations && (
                  <p className="text-red-500 text-sm mt-xfi-1">{errors.confidentialityObligations.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                  Exclusions *
                </label>
                <textarea
                  {...register('exclusions')}
                  rows={3}
                  className="xinfinity-input resize-none"
                  placeholder="List information that is not considered confidential..."
                />
                {errors.exclusions && (
                  <p className="text-red-500 text-sm mt-xfi-1">{errors.exclusions.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                  Term & Termination *
                </label>
                <textarea
                  {...register('termClause')}
                  rows={3}
                  className="xinfinity-input resize-none"
                  placeholder="Specify the duration and termination conditions..."
                />
                {errors.termClause && (
                  <p className="text-red-500 text-sm mt-xfi-1">{errors.termClause.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                  Governing Law Clause *
                </label>
                <textarea
                  {...register('governingLawClause')}
                  rows={2}
                  className="xinfinity-input resize-none"
                  placeholder="Specify the governing law and jurisdiction..."
                />
                {errors.governingLawClause && (
                  <p className="text-red-500 text-sm mt-xfi-1">{errors.governingLawClause.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                  Additional Terms (Optional)
                </label>
                <textarea
                  {...register('additionalTerms')}
                  rows={3}
                  className="xinfinity-input resize-none"
                  placeholder="Any additional terms or clauses..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-xinfinity-foreground mb-xfi-2">
                  Special Provisions (Optional)
                </label>
                <textarea
                  {...register('specialProvisions')}
                  rows={3}
                  className="xinfinity-input resize-none"
                  placeholder="Any special provisions or requirements..."
                />
              </div>
            </div>
          </motion.div>

          {/* AI Assumptions Display */}
          {aiData?.assumptions && aiData.assumptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="xinfinity-card-accent p-xfi-6 border border-xinfinity-accent/20"
            >
              <h3 className="text-lg font-semibold text-xinfinity-accent mb-xfi-4 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-xfi-2" />
                AI Assumptions Made
              </h3>
              <ul className="space-y-xfi-2 text-xinfinity-foreground">
                {aiData.assumptions.map((assumption: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-xinfinity-accent mr-xfi-2 mt-1">•</span>
                    {assumption}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-xinfinity-muted mt-xfi-4">
                Please review and modify the form fields as needed to ensure accuracy.
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col sm:flex-row gap-xfi-4 justify-center items-center"
          >
            <button
              type="submit"
              disabled={isLoading}
              className="xinfinity-button xinfinity-button-primary w-full sm:w-auto px-xfi-8 py-xfi-4 text-lg font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                  <span className="ml-xfi-2">Processing...</span>
                </div>
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5 mr-xfi-2" />
                  Review NDA
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handlePreviewPDF}
              className="xinfinity-button xinfinity-button-secondary w-full sm:w-auto px-xfi-8 py-xfi-4 text-lg font-semibold"
            >
              <EyeIcon className="w-5 h-5 mr-xfi-2" />
              Preview PDF
            </button>
            
            <button
              type="button"
              onClick={() => {
                const generator = require('../../../lib/nda-pdf-generator').generateNDAPDF(watchedData)
                generator.download()
                toast.success('📄 NDA PDF downloaded!')
              }}
              className="xinfinity-button xinfinity-button-outline w-full sm:w-auto px-xfi-8 py-xfi-4 text-lg font-semibold"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-xfi-2" />
              Download PDF
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full sm:w-auto px-xfi-6 py-xfi-3 bg-xinfinity-surface/50 text-xinfinity-muted border border-xinfinity-border font-medium rounded-xl hover:bg-xinfinity-surface transition-all duration-300"
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
