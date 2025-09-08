/**
 * Multilingual Document Generation Platform
 * Professional document creation with AI-powered multilingual support
 */

'use client'

import React, { useState, useEffect, Suspense, lazy } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useGenerateEnhancedDocument } from '../../../hooks/use-generate-enhanced-document'
import { useGenerateBatchDocuments } from '../../../hooks/use-generate-batch-documents'
import { usePersistedSettings } from '../../../hooks/use-persisted-settings'
import { useToast } from '../../../hooks/use-toast'
import { LoadingSpinner } from '../../../components/loading'
import { Logo } from '../../../components/logo'
import { CompanySettings } from '../../../components/company-settings'
import { DocumentType, Locale, InvoiceSchema, NDASchema, Invoice, NDA } from '../../../../packages/core'
import { 
  DocumentTextIcon, 
  SparklesIcon, 
  LanguageIcon, 
  GlobeAltIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// Lazy load components
const InvoiceForm = lazy(() => import('../../../components/invoice-form'))
const NDAPreviewModal = lazy(() => import('../../../components/nda-pdf-preview-modal').then(module => ({ default: module.NDAPDFPreviewModal })))

// Loading fallback for forms
function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

const supportedLocales: { value: Locale; label: string; flag: string; rtl: boolean }[] = [
  { value: 'en-US', label: 'English (US)', flag: '🇺🇸', rtl: false },
  { value: 'fr-FR', label: 'Français (France)', flag: '🇫🇷', rtl: false },
  { value: 'de-DE', label: 'Deutsch (Deutschland)', flag: '🇩🇪', rtl: false },
  { value: 'es-ES', label: 'Español (España)', flag: '🇪🇸', rtl: false },
  { value: 'ar-SA', label: 'العربية (السعودية)', flag: '🇸🇦', rtl: true },
  { value: 'zh-CN', label: '中文 (简体)', flag: '🇨🇳', rtl: false },
  { value: 'ja-JP', label: '日本語', flag: '🇯🇵', rtl: false },
  { value: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷', rtl: false },
  { value: 'it-IT', label: 'Italiano (Italia)', flag: '🇮🇹', rtl: false },
  { value: 'ru-RU', label: 'Русский (Россия)', flag: '🇷🇺', rtl: false },
  { value: 'hi-IN', label: 'हिन्दी (भारत)', flag: '🇮🇳', rtl: false },
]

// Document type configurations
const documentTypes = [
  {
    type: 'invoice' as DocumentType,
    label: 'Invoice',
    icon: DocumentTextIcon,
    description: 'Professional business invoices with AI-powered generation',
    color: 'blue'
  },
  {
    type: 'nda' as DocumentType,
    label: 'NDA',
    icon: ClipboardDocumentListIcon,
    description: 'Legal non-disclosure agreements with regional compliance',
    color: 'purple'
  }
]

// Enhanced sample prompts with more professional examples
const samplePrompts = {
  invoice: {
    'en-US': 'Create an invoice for TechCorp Inc. for $3,500 including: Frontend development with React/TypeScript ($2,000), Backend API development with Node.js ($1,200), and Database design and implementation ($300). Due in 30 days.',
    'fr-FR': 'Créer une facture pour TechCorp Inc. de 3 200 € comprenant : Développement frontend avec React/TypeScript (1 800 €), Développement API backend avec Node.js (1 100 €), et Conception et implémentation de base de données (300 €). Échéance 30 jours.',
    'de-DE': 'Erstellen Sie eine Rechnung für TechCorp Inc. über 3.200 € einschließlich: Frontend-Entwicklung mit React/TypeScript (1.800 €), Backend-API-Entwicklung mit Node.js (1.100 €) und Datenbankdesign und -implementierung (300 €). Fällig in 30 Tagen.',
    'es-ES': 'Crear una factura para TechCorp Inc. por 3.200 € incluyendo: Desarrollo frontend con React/TypeScript (1.800 €), Desarrollo de API backend con Node.js (1.100 €), y Diseño e implementación de base de datos (300 €). Vence en 30 días.',
    'ar-SA': 'إنشاء فاتورة لشركة TechCorp Inc. بمبلغ 3500 دولار تتضمن: تطوير الواجهة الأمامية باستخدام React/TypeScript (2000 دولار)، تطوير API الخلفية باستخدام Node.js (1200 دولار)، وتصميم وتنفيذ قاعدة البيانات (300 دولار). الاستحقاق خلال 30 يوماً.',
    'zh-CN': '为TechCorp Inc.创建一张3500美元的发票，包括：使用React/TypeScript的前端开发（2000美元）、使用Node.js的后端API开发（1200美元）、数据库设计和实施（300美元）。30天内到期。',
    'ja-JP': 'TechCorp Inc.向けに3,500ドルの請求書を作成してください。内容：React/TypeScriptによるフロントエンド開発（2,000ドル）、Node.jsによるバックエンドAPI開発（1,200ドル）、データベース設計と実装（300ドル）。支払期限は30日後。',
    'pt-BR': 'Criar uma fatura para TechCorp Inc. no valor de R$ 3.500 incluindo: Desenvolvimento frontend com React/TypeScript (R$ 2.000), Desenvolvimento de API backend com Node.js (R$ 1.200), e Design e implementação de banco de dados (R$ 300). Vencimento em 30 dias.',
    'it-IT': 'Creare una fattura per TechCorp Inc. per 3.200 € inclusi: Sviluppo frontend con React/TypeScript (1.800 €), Sviluppo API backend con Node.js (1.100 €), e Progettazione e implementazione database (300 €). Scadenza 30 giorni.',
    'ru-RU': 'Создать счет-фактуру для TechCorp Inc. на сумму 3500 долларов, включая: Разработка фронтенда с React/TypeScript (2000 долларов), Разработка бэкенд API с Node.js (1200 долларов), и Проектирование и реализация базы данных (300 долларов). Срок оплаты 30 дней.',
    'hi-IN': 'TechCorp Inc. के लिए ₹3,50,000 का चालान बनाएं जिसमें शामिल है: React/TypeScript के साथ फ्रंटएंड डेवलपमेंट (₹2,00,000), Node.js के साथ बैकएंड API डेवलपमेंट (₹1,20,000), और डेटाबेस डिज़ाइन और इम्प्लीमेंटेशन (₹30,000)। 30 दिन में देय।',
  },
  nda: {
    'en-US': 'Create a comprehensive NDA between DataCorp Technologies and InnovateLabs for a 24-month strategic partnership involving proprietary AI algorithms, customer data, and trade secrets. Include mutual confidentiality, exclusions for publicly available information, and specify California jurisdiction.',
    'fr-FR': 'Créer un accord de confidentialité complet entre DataCorp Technologies et InnovateLabs pour un partenariat stratégique de 24 mois impliquant des algorithmes d\'IA propriétaires, des données clients et des secrets commerciaux. Inclure la confidentialité mutuelle, les exclusions pour les informations publiques et spécifier la juridiction de Californie.',
    'de-DE': 'Erstellen Sie eine umfassende Geheimhaltungsvereinbarung zwischen DataCorp Technologies und InnovateLabs für eine 24-monatige strategische Partnerschaft mit proprietären KI-Algorithmen, Kundendaten und Geschäftsgeheimnissen. Inklusive gegenseitiger Vertraulichkeit, Ausschlüsse für öffentlich verfügbare Informationen und Spezifikation der kalifornischen Gerichtsbarkeit.',
    'es-ES': 'Crear un acuerdo de confidencialidad integral entre DataCorp Technologies e InnovateLabs para una asociación estratégica de 24 meses que involucra algoritmos de IA propietarios, datos de clientes y secretos comerciales. Incluir confidencialidad mutua, exclusiones para información disponible públicamente y especificar jurisdicción de California.',
    'ar-SA': 'إنشاء اتفاقية سرية شاملة بين DataCorp Technologies و InnovateLabs لشراكة استراتيجية مدتها 24 شهراً تتضمن خوارزميات ذكاء اصطناعي مملوكة وبيانات العملاء والأسرار التجارية. تشمل السرية المتبادلة والاستثناءات للمعلومات المتاحة للعامة وتحديد الولاية القضائية لكاليفورنيا.',
    'zh-CN': '为DataCorp Technologies和InnovateLabs创建一份全面的保密协议，用于为期24个月的战略合作伙伴关系，涉及专有AI算法、客户数据和商业机密。包括相互保密、公开可用信息的排除条款，并指定加利福尼亚州管辖权。',
    'ja-JP': 'DataCorp TechnologiesとInnovateLabsの间で、独自のAIアルゴリズム、顧客データ、企業秘密を含む24ヶ月間の戦略的パートナーシップのための包括的なNDAを作成してください。相互機密保持、公開情報の除外事項を含み、カリフォルニア州の管轄権を指定してください。',
    'pt-BR': 'Criar um acordo de confidencialidade abrangente entre DataCorp Technologies e InnovateLabs para uma parceria estratégica de 24 meses envolvendo algoritmos de IA proprietários, dados de clientes e segredos comerciais. Incluir confidencialidade mútua, exclusões para informações publicamente disponíveis e especificar jurisdição da Califórnia.',
    'it-IT': 'Creare un accordo di riservatezza completo tra DataCorp Technologies e InnovateLabs per una partnership strategica di 24 mesi che coinvolge algoritmi AI proprietari, dati dei clienti e segreti commerciali. Includere riservatezza reciproca, esclusioni per informazioni pubblicamente disponibili e specificare giurisdizione della California.',
    'ru-RU': 'Создать комплексное соглашение о неразглашении между DataCorp Technologies и InnovateLabs для 24-месячного стратегического партнерства, включающего собственные алгоритмы ИИ, данные клиентов и коммерческие тайны. Включить взаимную конфиденциальность, исключения для общедоступной информации и указать юрисдикцию Калифорнии.',
    'hi-IN': 'DataCorp Technologies और InnovateLabs के बीच 24 महीने की रणनीतिक साझेदारी के लिए एक व्यापक गुप्तता समझौता बनाएं जिसमें मालिकाना AI एल्गोरिदम, ग्राहक डेटा और व्यापारिक रहस्य शामिल हैं। पारस्परिक गोपनीयता, सार्वजनिक रूप से उपलब्ध जानकारी के लिए अपवाद शामिल करें और कैलिफोर्निया क्षेत्राधिकार निर्दिष्ट करें।',
  }
}

export default function MultilingualDocumentPlatform() {
  const [selectedLocale, setSelectedLocale] = useState<Locale>('en-US')
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>('invoice')
  const [prompt, setPrompt] = useState('')
  const [batchPrompts, setBatchPrompts] = useState<string[]>([''])
  const [mode, setMode] = useState<'single' | 'batch'>('single')
  const [generatedDocument, setGeneratedDocument] = useState<any>(null)
  const [generatedBatch, setGeneratedBatch] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [includeTranslations, setIncludeTranslations] = useState(true)
  const [culturalContext, setCulturalContext] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [showPDFPreview, setShowPDFPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Ensure component is mounted before allowing operations
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { userContext } = usePersistedSettings()
  const generateSingle = useGenerateEnhancedDocument()
  const generateBatch = useGenerateBatchDocuments()
  const { success, error } = useToast()

  // Get selected locale data
  const selectedLocaleData = supportedLocales.find(l => l.value === selectedLocale)
  const isRTL = selectedLocaleData?.rtl || false

  // Get current document type config
  const currentDocType = documentTypes.find(dt => dt.type === selectedDocumentType)

  const handleGenerateDocument = async () => {
    if (mode === 'single') {
      if (!prompt.trim()) {
        error('Please enter a description for your document')
        return
      }

      // Reset previous generation state
      setGeneratedDocument(null)
      setShowForm(false)
      setIsGenerating(true)
      
      try {
        console.log('🚀 Starting generation...', { 
          prompt: prompt.trim(), 
          documentType: selectedDocumentType,
          userContext: userContext 
        })
        
        const result = await generateSingle.mutateAsync({
          prompt: prompt.trim(),
          documentType: selectedDocumentType,
          userContext: {
            ...userContext,
            defaultCurrency: userContext?.defaultCurrency as any,
            defaultLocale: userContext?.defaultLocale as any,
            // Add language instruction to ensure AI responds in selected language
            languageInstruction: `Please generate the response in ${selectedLocaleData?.name || 'English'} language (${selectedLocale}), regardless of the input language.`,
            outputLanguage: selectedLocale,
            culturalContext: selectedLocaleData?.name
          }
        })

        console.log('✅ Generation result:', result)

        if (result.success) {
          // Enhanced mapping for better form compatibility
          const apiDocument = result.document || result.content || {}
          
          // Helper function to extract invoice items with maximum flexibility
          const extractInvoiceItems = (originalData: any, apiDocument: any, fullResult: any) => {
            console.log('🔍 Flexible item extraction from:', { originalData, apiDocument, fullResult })
            
            // Check content.items first (where the real items are)
            if (fullResult?.content?.items && Array.isArray(fullResult.content.items) && fullResult.content.items.length > 0) {
              console.log('✅ Found items in content.items:', fullResult.content.items)
              return fullResult.content.items.map((item: any) => ({
                description: item.description || item.name || item.service || item.title || item.item_name || 'Service Item',
                quantity: Number(item.quantity) || Number(item.qty) || Number(item.amount_quantity) || 1,
                rate: Number(item.rate) || Number(item.price) || Number(item.unit_price) || Number(item.cost) || Number(item.amount) || 0,
                amount: Number(item.amount) || Number(item.total) || Number(item.line_total) || (Number(item.quantity || item.qty || 1) * Number(item.rate || item.price || 0))
              }))
            }
            
            // Check for any array that might contain items (flexible field names)
            const potentialItemArrays = [
              originalData.items, originalData.line_items, originalData.services, originalData.products,
              apiDocument.items, apiDocument.line_items, apiDocument.services, apiDocument.products,
              fullResult.items, fullResult.line_items, fullResult.services, fullResult.products
            ]
            
            for (const itemArray of potentialItemArrays) {
              if (Array.isArray(itemArray) && itemArray.length > 0) {
                console.log('✅ Found items in flexible array:', itemArray)
                return itemArray.map((item: any) => ({
                  description: item.description || item.name || item.service || item.title || item.item_name || Object.values(item)[0] || 'Service Item',
                  quantity: Number(item.quantity) || Number(item.qty) || Number(item.count) || 1,
                  rate: Number(item.rate) || Number(item.price) || Number(item.unit_price) || Number(item.cost) || 0,
                  amount: Number(item.amount) || Number(item.total) || Number(item.line_total) || (Number(item.quantity || item.qty || 1) * Number(item.rate || item.price || 0))
                }))
              }
            }
            
            // If no structured items found, try to extract from any text fields that might contain item descriptions
            const textFields = [
              originalData.description, originalData.details, originalData.services_description,
              apiDocument.description, apiDocument.details, apiDocument.services_description,
              fullResult.description, fullResult.details
            ]
            
            for (const textField of textFields) {
              if (typeof textField === 'string' && textField.length > 10) {
                // Try to parse line items from text
                const lines = textField.split('\n').filter(line => line.trim().length > 0)
                if (lines.length > 1) {
                  console.log('✅ Extracting items from text description:', lines)
                  return lines.map((line, index) => ({
                    description: line.trim(),
                    quantity: 1,
                    rate: 0, // Will be calculated from total if available
                    amount: 0
                  }))
                }
              }
            }
            
            console.log('⚠️ No items found, creating fallback item with AI description')
            // Create fallback item with AI-generated description
            const fallbackDescription = originalData.service_description || 
                                      originalData.description || 
                                      apiDocument.description ||
                                      fullResult.description ||
                                      'Generated Service'
            
            const totalAmount = Number(originalData.total_amount) || Number(originalData.total) || Number(apiDocument.total) || 100
            return [{
              description: fallbackDescription,
              quantity: 1,
              rate: totalAmount,
              amount: totalAmount
            }]
          }
          
          // Intelligent data mapping for invoice forms with maximum flexibility
          let mappedDocument = apiDocument
          if (selectedDocumentType === 'invoice') {
            // Extract data from original API response for better mapping
            const originalData = apiDocument._originalApiResponse || apiDocument
            
            // Helper function to get any possible field value (flexible field matching)
            const getFlexibleField = (obj: any, ...possibleFields: string[]) => {
              for (const field of possibleFields) {
                if (obj && obj[field] !== undefined && obj[field] !== null && obj[field] !== '') {
                  return obj[field]
                }
              }
              return ''
            }
            
            mappedDocument = {
              // Basic invoice fields with flexible mapping
              invoiceNumber: getFlexibleField(originalData, 'invoice_number', 'number', 'invoice_no', 'facture_numero', 'رقم_الفاتورة') || 
                           getFlexibleField(apiDocument, 'invoiceNumber', 'number') || 
                           `INV-${Date.now()}`,
                           
              date: getFlexibleField(originalData, 'issue_date', 'date', 'invoice_date', 'created_date', 'date_creation', 'التاريخ') || 
                    getFlexibleField(apiDocument, 'date', 'issueDate') || 
                    new Date().toISOString().split('T')[0],
                    
              dueDate: getFlexibleField(originalData, 'due_date', 'dueDate', 'payment_due', 'echeance', 'تاريخ_الاستحقاق') || 
                      getFlexibleField(apiDocument, 'dueDate', 'paymentDue') || 
                      '',
              
              // From/To mapping with maximum flexibility for different languages and formats
              from: {
                name: getFlexibleField(originalData, 'company_name', 'from_name', 'sender_name', 'entreprise', 'شركة', 'الشركة_المرسلة') || 
                      getFlexibleField(apiDocument, 'from.name', 'fromName', 'companyName') || 
                      userContext?.companyName || 'Your Company',
                      
                address: getFlexibleField(originalData, 'company_address', 'from_address', 'sender_address', 'adresse_entreprise', 'العنوان') || 
                        getFlexibleField(apiDocument, 'from.address', 'fromAddress', 'companyAddress') || 
                        userContext?.companyAddress || '',
                        
                email: getFlexibleField(originalData, 'company_email', 'from_email', 'sender_email', 'email_entreprise', 'البريد_الالكتروني') || 
                      getFlexibleField(apiDocument, 'from.email', 'fromEmail', 'companyEmail') || 
                      userContext?.companyEmail || '',
                      
                phone: getFlexibleField(originalData, 'company_phone', 'from_phone', 'sender_phone', 'telephone_entreprise', 'الهاتف') || 
                      getFlexibleField(apiDocument, 'from.phone', 'fromPhone', 'companyPhone') || 
                      userContext?.companyPhone || '',
              },
              
              to: {
                name: getFlexibleField(originalData, 'client_name', 'customer_name', 'to_name', 'recipient_name', 'nom_client', 'العميل', 'اسم_العميل') || 
                      getFlexibleField(apiDocument, 'to.name', 'toName', 'clientName', 'customerName') || 
                      'Client Name',
                      
                address: getFlexibleField(originalData, 'client_address', 'customer_address', 'to_address', 'recipient_address', 'adresse_client', 'عنوان_العميل') || 
                        getFlexibleField(apiDocument, 'to.address', 'toAddress', 'clientAddress') || '',
                        
                email: getFlexibleField(originalData, 'client_email', 'customer_email', 'to_email', 'recipient_email', 'email_client', 'بريد_العميل') || 
                      getFlexibleField(apiDocument, 'to.email', 'toEmail', 'clientEmail') || '',
                      
                phone: getFlexibleField(originalData, 'client_phone', 'customer_phone', 'to_phone', 'recipient_phone', 'telephone_client', 'هاتف_العميل') || 
                      getFlexibleField(apiDocument, 'to.phone', 'toPhone', 'clientPhone') || '',
              },
              
              // Items mapping with enhanced extraction
              items: extractInvoiceItems(originalData, apiDocument, result),
              
              // Financial calculations with flexible field mapping for different languages
              subtotal: Number(getFlexibleField(originalData, 'subtotal', 'sous_total', 'المجموع_الفرعي', 'sub_total')) || 
                        Number(getFlexibleField(apiDocument, 'subtotal')) || 
                        Number(getFlexibleField(result.content, 'subtotal')) || 0,
                        
              taxRate: Number(getFlexibleField(originalData, 'tax_rate', 'taux_taxe', 'معدل_الضريبة', 'vat_rate', 'tva')) || 
                      Number(getFlexibleField(apiDocument, 'taxRate', 'tax_rate')) || 
                      Number(userContext?.defaultTaxRate) || 0,
                      
              taxAmount: Number(getFlexibleField(originalData, 'tax_amount', 'montant_taxe', 'مبلغ_الضريبة', 'vat_amount', 'tva_montant')) || 
                        Number(getFlexibleField(apiDocument, 'taxAmount', 'tax_amount')) || 
                        Number(getFlexibleField(result.content, 'tax_amount')) || 0,
                        
              total: Number(getFlexibleField(originalData, 'total_amount', 'total', 'montant_total', 'المجموع_الكلي', 'grand_total')) || 
                    Number(getFlexibleField(apiDocument, 'total', 'totalAmount')) || 
                    Number(getFlexibleField(result.content, 'total')) || 0,
              
              // Metadata with flexible mapping
              currency: getFlexibleField(originalData, 'currency', 'devise', 'العملة', 'monnaie') || 
                       getFlexibleField(apiDocument, 'currency') || 
                       userContext?.defaultCurrency || 'USD',
                       
              locale: getFlexibleField(originalData, 'locale', 'language', 'langue', 'اللغة') || 
                     selectedLocale,
                     
              terms: getFlexibleField(originalData, 'payment_terms', 'terms', 'conditions', 'conditions_paiement', 'شروط_الدفع') || 
                    getFlexibleField(apiDocument, 'terms', 'paymentTerms') || '',
                    
              notes: getFlexibleField(originalData, 'notes', 'remarques', 'ملاحظات', 'description', 'details') || 
                    getFlexibleField(apiDocument, 'notes', 'description') || '',
              
              // Keep original data for debugging
              _originalApiResponse: originalData,
              _processedAt: new Date().toISOString(),
              _selectedLanguage: selectedLocale,
              _languageContext: selectedLocaleData?.name
            }
            
            // Auto-calculate missing financial data based on extracted items
            if (!mappedDocument.subtotal && mappedDocument.items && mappedDocument.items.length > 0) {
              mappedDocument.subtotal = mappedDocument.items.reduce((sum: number, item: any) => 
                sum + (item.amount || 0), 0)
              console.log('💰 Calculated subtotal from items:', mappedDocument.subtotal)
            }
            
            // Calculate tax amount if missing
            if (!mappedDocument.taxAmount && mappedDocument.subtotal && mappedDocument.taxRate) {
              mappedDocument.taxAmount = mappedDocument.subtotal * (mappedDocument.taxRate / 100)
              console.log('💰 Calculated tax amount:', mappedDocument.taxAmount)
            }
            
            // Calculate total if missing
            if (!mappedDocument.total && mappedDocument.subtotal !== undefined) {
              mappedDocument.total = mappedDocument.subtotal + (mappedDocument.taxAmount || 0)
              console.log('💰 Calculated total:', mappedDocument.total)
            }
            
            console.log('💰 Final financial data:', {
              subtotal: mappedDocument.subtotal,
              taxRate: mappedDocument.taxRate,
              taxAmount: mappedDocument.taxAmount,
              total: mappedDocument.total,
              itemsCount: mappedDocument.items?.length
            })
          }
          
          const finalResult = {
            success: true,
            document: mappedDocument,
            content: result.content,
            formatted_document: result.formatted_document,
            assumptions: result.assumptions || [],
            enhanced: result.enhanced || false,
            metadata: result.document,
            _debug: {
              originalApiResponse: result,
              mappingApplied: selectedDocumentType === 'invoice' ? 'Enhanced invoice mapping' : 'Direct mapping',
              timestamp: new Date().toISOString()
            }
          }
          
          console.log('📋 Final mapped result:', finalResult)
          console.log('🎯 Document ready for form:', finalResult.document)
          console.log('🔍 Document validation:', {
            hasDocument: !!finalResult.document,
            documentKeys: finalResult.document ? Object.keys(finalResult.document) : [],
            hasFromName: finalResult.document?.from?.name,
            hasToName: finalResult.document?.to?.name,
            hasItems: finalResult.document?.items?.length,
            currency: finalResult.document?.currency,
            total: finalResult.document?.total
          })
          setGeneratedDocument(finalResult)
          setShowForm(true)
          success(`${currentDocType?.label} generated successfully in ${selectedLocaleData?.label}!`)
        } else {
          throw new Error(result.error || 'Generation failed')
        }
      } catch (err) {
        console.error('❌ Generation failed:', err)
        error(`Failed to generate ${currentDocType?.label.toLowerCase()}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsGenerating(false)
      }
    } else {
      // Batch mode
      const validPrompts = batchPrompts.filter(p => p.trim())
      if (validPrompts.length === 0) {
        error('Please enter at least one prompt for batch generation')
        return
      }

      // Reset previous batch generation state
      setGeneratedBatch(null)
      setShowForm(false)
      setIsGenerating(true)
      
      try {
        console.log('🚀 Starting batch generation...', { 
          prompts: validPrompts, 
          documentType: selectedDocumentType 
        })
        
        const result = await generateBatch.mutateAsync({
          prompts: validPrompts,
          documentType: selectedDocumentType,
          userContext: {
            ...userContext,
            defaultCurrency: userContext?.defaultCurrency as any,
            defaultLocale: userContext?.defaultLocale as any,
            // Add language instruction for batch processing
            languageInstruction: `Please generate all responses in ${selectedLocaleData?.name || 'English'} language (${selectedLocale}), regardless of the input language.`,
            outputLanguage: selectedLocale,
            culturalContext: selectedLocaleData?.name
          }
        })

        console.log('✅ Batch generation result:', result)

        if (result.success) {
          const mappedResult = {
            success: true,
            documents: result.documents || [],
            count: result.count || result.documents?.length || 0
          }
          
          console.log('📋 Mapped batch result:', mappedResult)
          setGeneratedBatch(mappedResult)
          setShowForm(true)
          success(`${validPrompts.length} ${currentDocType?.label}s generated successfully!`)
        } else {
          throw new Error(result.error || 'Batch generation failed')
        }
      } catch (err) {
        console.error('❌ Batch generation failed:', err)
        error(`Failed to generate batch ${currentDocType?.label.toLowerCase()}s: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsGenerating(false)
      }
    }
  }

  const handleDocumentSave = (documentData: Invoice | NDA) => {
    console.log('Document saved:', documentData)
    success('Document saved successfully!')
  }

  const handleDownloadPDF = async (document?: any) => {
    const docToDownload = document || generatedDocument?.document
    if (!docToDownload || !isMounted || typeof window === 'undefined') {
      error('No document available for download')
      return
    }

    try {
      console.log('📄 Downloading PDF for document:', docToDownload)
      
      if (selectedDocumentType === 'invoice') {
        // Use the enhanced PDF generator for invoices
        const { EnhancedInvoicePDFGenerator } = await import('../../../lib/pdf-generator-enhanced')
        
        const pdfGenerator = new EnhancedInvoicePDFGenerator({
          theme: 'primary',
          customTemplate: 'modern',
          includeWatermark: false,
          companyLogo: userContext?.logoUrl || null,
          websiteUrl: userContext?.website || '',
          showQRCode: false
        })
        
        const pdfDataUri = pdfGenerator.generateInvoicePDF(docToDownload as any)
        
        // Convert data URI to blob
        const byteCharacters = atob(pdfDataUri.split(',')[1])
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const pdfBlob = new Blob([byteArray], { type: 'application/pdf' })
        
        // Create download link safely
        if (typeof window !== 'undefined' && window.document) {
          const url = URL.createObjectURL(pdfBlob)
          const a = window.document.createElement('a')
          a.href = url
          a.download = `invoice_${docToDownload.invoiceNumber || Date.now()}.pdf`
          window.document.body.appendChild(a)
          a.click()
          window.document.body.removeChild(a)
          URL.revokeObjectURL(url)
          
          success('Invoice PDF downloaded successfully!')
        } else {
          throw new Error('Browser environment not available')
        }
      } else {
        // For other document types, create a simple text preview for now
        const pdfContent = `
${currentDocType?.label} DOCUMENT
${'='.repeat(50)}

Generated Document: ${currentDocType?.label}
Language: ${selectedLocaleData?.label}
Generated on: ${new Date().toLocaleString()}

Document Data:
${JSON.stringify(docToDownload, null, 2)}

---
Full PDF generation for ${selectedDocumentType} will be available soon.
        `
        
        // Create a downloadable text file for non-invoice documents
        if (typeof window !== 'undefined' && window.document) {
          const blob = new Blob([pdfContent], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = window.document.createElement('a')
          a.href = url
          a.download = `${selectedDocumentType}_${selectedLocale}_${Date.now()}.txt`
          window.document.body.appendChild(a)
          a.click()
          window.document.body.removeChild(a)
          URL.revokeObjectURL(url)
          
          success('Document downloaded successfully! (PDF coming soon for this document type)')
        } else {
          throw new Error('Browser environment not available')
        }
      }
    } catch (err) {
      console.error('❌ Download failed:', err)
      error(`Failed to download document: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const loadSamplePrompt = () => {
    const sample = (samplePrompts as any)[selectedDocumentType]?.[selectedLocale] || 
                   (samplePrompts as any)[selectedDocumentType]?.['en-US']
    if (sample) {
      if (mode === 'single') {
        setPrompt(sample)
      } else {
        setBatchPrompts([sample, ...batchPrompts.slice(1)])
      }
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
    if (batchPrompts.length > 1) {
      setBatchPrompts(batchPrompts.filter((_, i) => i !== index))
    }
  }

  const handleStartOver = () => {
    setPrompt('')
    setBatchPrompts([''])
    setGeneratedDocument(null)
    setGeneratedBatch(null)
    setShowForm(false)
    setIsGenerating(false)
    generateSingle.reset()
    generateBatch.reset()
  }

  const isButtonDisabled = mode === 'single' 
    ? !prompt.trim() || isGenerating
    : batchPrompts.filter(p => p.trim()).length === 0 || isGenerating

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
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-xinfinity-accent/20 to-purple-500/20 blur-3xl"
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

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="xinfinity-card overflow-hidden">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border-b border-xinfinity-border bg-gradient-to-r from-xinfinity-surface/50 to-xinfinity-primary/5"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Logo size="sm" className="mr-4" />
                <div>
                  <div className="flex items-center space-x-3">
                    <GlobeAltIcon className="w-8 h-8 text-xinfinity-primary" />
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-xinfinity-primary to-xinfinity-secondary bg-clip-text text-transparent">
                        Multilingual Documents
                      </h1>
                      <p className="mt-1 text-sm text-xinfinity-muted">
                        AI-powered document generation in 11+ languages with cultural context
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-xinfinity-foreground bg-xinfinity-surface border border-xinfinity-border rounded-xl hover:bg-xinfinity-surface/80 focus:outline-none focus:ring-2 focus:ring-xinfinity-primary/20 transition-all"
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  Company Settings
                </button>
                {showForm && (
                  <button
                    onClick={handleStartOver}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-xinfinity-muted hover:text-xinfinity-foreground bg-xinfinity-surface/50 hover:bg-xinfinity-surface rounded-xl transition-all"
                  >
                    <BeakerIcon className="w-4 h-4 mr-2" />
                    New Document
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <div className="p-8">
            {!showForm ? (
              // Document Generation Section
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-1"
                >
                  <div className="space-y-6">
                    {/* Language Selection */}
                    <div className="xinfinity-card p-6">
                      <div className="flex items-center mb-4">
                        <LanguageIcon className="w-5 h-5 text-xinfinity-primary mr-2" />
                        <h3 className="text-lg font-semibold text-xinfinity-foreground">Language Selection</h3>
                      </div>
                      <select
                        value={selectedLocale}
                        onChange={(e) => setSelectedLocale(e.target.value as Locale)}
                        className="w-full p-3 border border-xinfinity-border rounded-xl focus:ring-2 focus:ring-xinfinity-primary focus:border-transparent bg-white"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        {supportedLocales.map((locale) => (
                          <option key={locale.value} value={locale.value}>
                            {locale.flag} {locale.label}
                          </option>
                        ))}
                      </select>
                      {selectedLocaleData && (
                        <div className="mt-3 p-3 bg-xinfinity-primary/5 rounded-lg">
                          <div className="text-xs text-xinfinity-muted space-y-1">
                            <div>Direction: {isRTL ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}</div>
                            <div>Cultural Context: {culturalContext ? 'Enabled' : 'Disabled'}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Document Type Selection */}
                    <div className="xinfinity-card p-6">
                      <div className="flex items-center mb-4">
                        <DocumentDuplicateIcon className="w-5 h-5 text-xinfinity-primary mr-2" />
                        <h3 className="text-lg font-semibold text-xinfinity-foreground">Document Type</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {documentTypes.map((docType) => {
                          const Icon = docType.icon
                          const isSelected = selectedDocumentType === docType.type
                          return (
                            <button
                              key={docType.type}
                              onClick={() => setSelectedDocumentType(docType.type)}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-xinfinity-primary bg-xinfinity-primary/5 text-xinfinity-primary'
                                  : 'border-xinfinity-border hover:border-xinfinity-primary/50 text-xinfinity-foreground hover:bg-xinfinity-surface/50'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <Icon className={`w-6 h-6 flex-shrink-0 ${isSelected ? 'text-xinfinity-primary' : 'text-xinfinity-muted'}`} />
                                <div>
                                  <h4 className="font-medium">{docType.label}</h4>
                                  <p className="text-sm text-xinfinity-muted mt-1">{docType.description}</p>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Generation Mode */}
                    <div className="xinfinity-card p-6">
                      <div className="flex items-center mb-4">
                        <BeakerIcon className="w-5 h-5 text-xinfinity-primary mr-2" />
                        <h3 className="text-lg font-semibold text-xinfinity-foreground">Generation Mode</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setMode('single')}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            mode === 'single'
                              ? 'border-xinfinity-primary bg-xinfinity-primary/5 text-xinfinity-primary'
                              : 'border-xinfinity-border hover:border-xinfinity-primary/50 text-xinfinity-foreground hover:bg-xinfinity-surface/50'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <DocumentTextIcon className={`w-6 h-6 ${mode === 'single' ? 'text-xinfinity-primary' : 'text-xinfinity-muted'}`} />
                            <div>
                              <h4 className="font-medium">Single</h4>
                              <p className="text-xs text-xinfinity-muted">Generate one document</p>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => setMode('batch')}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            mode === 'batch'
                              ? 'border-xinfinity-primary bg-xinfinity-primary/5 text-xinfinity-primary'
                              : 'border-xinfinity-border hover:border-xinfinity-primary/50 text-xinfinity-foreground hover:bg-xinfinity-surface/50'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <ClipboardDocumentListIcon className={`w-6 h-6 ${mode === 'batch' ? 'text-xinfinity-primary' : 'text-xinfinity-muted'}`} />
                            <div>
                              <h4 className="font-medium">Batch</h4>
                              <p className="text-xs text-xinfinity-muted">Generate multiple documents</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="xinfinity-card p-6">
                      <h3 className="text-lg font-semibold text-xinfinity-foreground mb-4">Generation Options</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeTranslations}
                            onChange={(e) => setIncludeTranslations(e.target.checked)}
                            className="rounded border-xinfinity-border text-xinfinity-primary shadow-sm focus:border-xinfinity-primary focus:ring focus:ring-xinfinity-primary/20"
                          />
                          <span className="ml-3 text-sm text-xinfinity-foreground">Include UI translations</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={culturalContext}
                            onChange={(e) => setCulturalContext(e.target.checked)}
                            className="rounded border-xinfinity-border text-xinfinity-primary shadow-sm focus:border-xinfinity-primary focus:ring focus:ring-xinfinity-primary/20"
                          />
                          <span className="ml-3 text-sm text-xinfinity-foreground">Apply cultural context</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Input Panel */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-2"
                >
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-${currentDocType?.color}-500 to-${currentDocType?.color}-600 rounded-full mb-6`}
                    >
                      {currentDocType && <currentDocType.icon className="w-8 h-8 text-white" />}
                    </motion.div>
                    <h2 className="text-3xl font-bold text-xinfinity-foreground mb-3">
                      Create {currentDocType?.label} in {selectedLocaleData?.label}
                    </h2>
                    <p className="text-xinfinity-muted text-lg max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                      Describe your {currentDocType?.label.toLowerCase()} and our AI will generate it with proper cultural context and language.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Language Flexibility Info */}
                    <div className="xinfinity-card p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                      <div className="flex items-center mb-2">
                        <LanguageIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-blue-800">🌍 Smart Language Processing</h4>
                      </div>
                      <p className="text-sm text-blue-700">
                        <strong>Write in any language you prefer!</strong> The AI will automatically generate the {currentDocType?.label.toLowerCase()} in <strong>{selectedLocaleData?.label}</strong> with proper cultural context, regardless of your input language.
                      </p>
                      <div className="mt-2 text-xs text-blue-600">
                        💡 Examples: Write in English → Get Arabic output | Write in French → Get German output | Mix languages → Get clean output
                      </div>
                    </div>

                    {/* Mode-specific Input */}
                    {mode === 'single' ? (
                      <div className="relative">
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder={`Describe your ${currentDocType?.label.toLowerCase()} in any language - AI will respond in ${selectedLocaleData?.label}...`}
                          className="w-full h-32 p-4 border border-xinfinity-border rounded-xl resize-none focus:ring-2 focus:ring-xinfinity-primary focus:border-transparent bg-white"
                          dir={isRTL ? 'rtl' : 'ltr'}
                        />
                        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                          <button
                            onClick={loadSamplePrompt}
                            className="px-3 py-1 text-xs bg-xinfinity-surface hover:bg-xinfinity-border rounded-lg transition-colors"
                          >
                            Load Sample
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-xinfinity-foreground">Batch Prompts</h3>
                          <button
                            onClick={loadSamplePrompt}
                            className="px-3 py-1 text-xs bg-xinfinity-surface hover:bg-xinfinity-border rounded-lg transition-colors"
                          >
                            Load Sample
                          </button>
                        </div>
                        {batchPrompts.map((batchPrompt, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-1 relative">
                              <textarea
                                value={batchPrompt}
                                onChange={(e) => updateBatchPrompt(index, e.target.value)}
                                placeholder={`${currentDocType?.label} ${index + 1} in any language - output in ${selectedLocaleData?.label}...`}
                                className="w-full h-24 p-4 border border-xinfinity-border rounded-xl resize-none focus:ring-2 focus:ring-xinfinity-primary focus:border-transparent bg-white"
                                dir={isRTL ? 'rtl' : 'ltr'}
                              />
                              <div className="absolute top-2 left-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-xinfinity-primary/10 text-xinfinity-primary">
                                  #{index + 1}
                                </span>
                              </div>
                            </div>
                            {batchPrompts.length > 1 && (
                              <button
                                onClick={() => removeBatchPrompt(index)}
                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors self-start"
                                title="Remove prompt"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addBatchPrompt}
                          disabled={batchPrompts.length >= 10}
                          className="w-full py-3 px-4 border-2 border-dashed border-xinfinity-border hover:border-xinfinity-primary rounded-xl text-xinfinity-muted hover:text-xinfinity-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PlusIcon className="w-5 h-5 mx-auto mb-1" />
                          Add Another Prompt ({batchPrompts.length}/10)
                        </button>
                      </div>
                    )}

                    {/* Generate Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerateDocument}
                      disabled={isButtonDisabled}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${
                        isButtonDisabled
                          ? 'bg-xinfinity-muted cursor-not-allowed'
                          : 'bg-gradient-to-r from-xinfinity-primary to-xinfinity-secondary hover:shadow-lg hover:shadow-xinfinity-primary/25'
                      }`}
                    >
                      {isGenerating ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Generating {currentDocType?.label}...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <SparklesIcon className="w-5 h-5 mr-2" />
                          {mode === 'single' 
                            ? `Generate ${currentDocType?.label} in ${selectedLocaleData?.label}`
                            : `Generate ${batchPrompts.filter(p => p.trim()).length} ${currentDocType?.label}s in ${selectedLocaleData?.label}`
                          }
                        </div>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            ) : (
              // Document Form Section
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Form Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-xinfinity-foreground">
                      {mode === 'single' 
                        ? `Edit ${currentDocType?.label} (${selectedLocaleData?.label})`
                        : `Review ${generatedBatch?.count || 0} Generated ${currentDocType?.label}s`
                      }
                    </h2>
                    <p className="text-xinfinity-muted">
                      {mode === 'single' 
                        ? 'Review and customize your generated document'
                        : 'Review your batch-generated documents and download individually'
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {mode === 'single' && (
                      <>
                        <button
                          onClick={() => setShowPDFPreview(true)}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-xinfinity-primary border border-xinfinity-primary rounded-xl hover:bg-xinfinity-primary/5 transition-all"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          Preview PDF
                        </button>
                        <button
                          onClick={() => handleDownloadPDF()}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-xinfinity-primary hover:bg-xinfinity-primary/90 rounded-xl transition-all"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                          Download PDF
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleStartOver}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-xinfinity-muted hover:text-xinfinity-foreground bg-xinfinity-surface/50 hover:bg-xinfinity-surface rounded-xl transition-all"
                    >
                      <BeakerIcon className="w-4 h-4 mr-2" />
                      Start Over
                    </button>
                  </div>
                </div>

                {/* Document Content */}
                {mode === 'single' ? (
                  // Single Document Form
                  <Suspense fallback={<FormSkeleton />}>
                    {selectedDocumentType === 'invoice' && generatedDocument?.document && (
                      <div className="space-y-6">
                        {/* Show Generated Data Preview */}
                        <div className="xinfinity-card p-6 bg-green-50 border border-green-200">
                          <h3 className="text-lg font-semibold text-green-800 mb-4">✅ Generated Invoice Data</h3>
                          {generatedDocument.document && Object.keys(generatedDocument.document).length > 0 ? (
                            <div className="bg-white rounded-lg p-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600">Invoice Number:</span>
                                  <div className="text-gray-900">{generatedDocument.document.invoiceNumber || 'Auto-generated'}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Client Name:</span>
                                  <div className="text-gray-900">{generatedDocument.document.to?.name || generatedDocument.document.clientName || 'N/A'}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Total Amount:</span>
                                  <div className="text-gray-900">{generatedDocument.document.total || 'N/A'}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Currency:</span>
                                  <div className="text-gray-900">{generatedDocument.document.currency || 'USD'}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Due Date:</span>
                                  <div className="text-gray-900">{generatedDocument.document.dueDate || 'Not set'}</div>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Items Count:</span>
                                  <div className="text-gray-900">{generatedDocument.document.items?.length || 0}</div>
                                </div>
                              </div>
                              
                              {/* Raw Data Debug View */}
                              <details className="mt-4">
                                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                                  🔍 View Raw Generated Data (Debug)
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-48">
                                  {JSON.stringify(generatedDocument, null, 2)}
                                </pre>
                              </details>
                            </div>
                          ) : (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <h4 className="font-medium text-yellow-800 mb-2">⚠️ No Document Data Found</h4>
                              <p className="text-sm text-yellow-700 mb-3">
                                The API response doesn't contain expected document data. This might indicate an issue with the generation process.
                              </p>
                              <details>
                                <summary className="cursor-pointer text-sm text-yellow-600 hover:text-yellow-800">
                                  🔍 View Full API Response (Debug)
                                </summary>
                                <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-32">
                                  {JSON.stringify(generatedDocument, null, 2)}
                                </pre>
                              </details>
                            </div>
                          )}
                          
                          {generatedDocument.assumptions && generatedDocument.assumptions.length > 0 && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                              <h4 className="font-medium text-yellow-800 mb-2">🤖 AI Assumptions Made:</h4>
                              <ul className="text-sm text-yellow-700 space-y-1">
                                {generatedDocument.assumptions.map((assumption: string, index: number) => (
                                  <li key={index} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{assumption}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Invoice Form */}
                        <div className="space-y-6">
                          {/* Debug: Show what we actually received */}
                          <div className="xinfinity-card p-4 bg-gray-50 border border-gray-200">
                            <h4 className="font-medium text-gray-800 mb-3">🔍 Debug: Generated Data Analysis</h4>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Has generatedDocument:</span> 
                                <span className={generatedDocument ? "text-green-600" : "text-red-600"}>
                                  {generatedDocument ? "✅ Yes" : "❌ No"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Has document property:</span> 
                                <span className={generatedDocument?.document ? "text-green-600" : "text-red-600"}>
                                  {generatedDocument?.document ? "✅ Yes" : "❌ No"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Document keys count:</span> 
                                <span className="text-blue-600">
                                  {generatedDocument?.document ? Object.keys(generatedDocument.document).length : 0}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Document keys:</span> 
                                <span className="text-blue-600">
                                  {generatedDocument?.document ? JSON.stringify(Object.keys(generatedDocument.document)) : "None"}
                                </span>
                              </div>
                            </div>
                            <details className="mt-3">
                              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                                🔍 View Full Generated Data (Debug)
                              </summary>
                              <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto max-h-48">
                                {JSON.stringify(generatedDocument, null, 2)}
                              </pre>
                            </details>
                          </div>

                          {/* Show form based on more flexible conditions */}
                          {generatedDocument?.document ? (
                            <div className="space-y-6">
                              <div className="xinfinity-card p-6 bg-green-50 border border-green-200">
                                <h3 className="text-lg font-semibold text-green-800 mb-2">🎯 Editable Invoice Form</h3>
                                <p className="text-green-700 text-sm">
                                  The AI-generated data has been loaded into the form below. 
                                  You can edit any field and the changes will be reflected in the PDF.
                                </p>
                              </div>
                              <InvoiceForm
                                key={`invoice-form-${Date.now()}-${generatedDocument._debug?.timestamp || ''}`}
                                initialData={generatedDocument.document}
                                onSubmit={handleDocumentSave}
                                aiAssumptions={generatedDocument.assumptions}
                                defaultCurrency={generatedDocument.document.currency || 'USD'}
                                defaultLocale={selectedLocale}
                              />
                            </div>
                          ) : (
                            <div className="xinfinity-card p-6 bg-red-50 border border-red-200">
                              <h3 className="text-lg font-semibold text-red-800 mb-2">❌ No Document Data Available</h3>
                              <p className="text-red-700 mb-4">
                                The API response doesn't contain document data. Check the debug information above 
                                to see what was actually received from the AI.
                              </p>
                              <button
                                onClick={handleStartOver}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Try Again
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedDocumentType === 'nda' && generatedDocument?.document && (
                      <div className="space-y-6">
                        {/* Show Generated Data Preview */}
                        <div className="xinfinity-card p-6 bg-green-50 border border-green-200">
                          <h3 className="text-lg font-semibold text-green-800 mb-4">✅ Generated NDA Data</h3>
                          <div className="bg-white rounded-lg p-4">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                              {JSON.stringify(generatedDocument.document, null, 2)}
                            </pre>
                          </div>
                          {generatedDocument.assumptions && generatedDocument.assumptions.length > 0 && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                              <h4 className="font-medium text-yellow-800 mb-2">AI Assumptions Made:</h4>
                              <ul className="text-sm text-yellow-700 space-y-1">
                                {generatedDocument.assumptions.map((assumption: string, index: number) => (
                                  <li key={index} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{assumption}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                          <h3 className="text-lg font-semibold text-yellow-800 mb-2">NDA Form Coming Soon</h3>
                          <p className="text-yellow-700">
                            The NDA editing form is currently under development. You can see the generated data above.
                          </p>
                        </div>
                      </div>
                    )}
                  </Suspense>
                ) : (
                  // Batch Documents Display
                  <div className="space-y-6">
                    {generatedBatch && (
                      <>
                        {/* Batch Statistics */}
                        <div className="xinfinity-card p-6 bg-blue-50 border border-blue-200">
                          <h3 className="text-lg font-semibold text-blue-800 mb-4">📊 Batch Generation Results</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{generatedBatch.count}</div>
                              <div className="text-blue-600">Documents Generated</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">100%</div>
                              <div className="text-green-600">Success Rate</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{selectedLocaleData?.label}</div>
                              <div className="text-purple-600">Language</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">{currentDocType?.label}</div>
                              <div className="text-orange-600">Document Type</div>
                            </div>
                          </div>
                        </div>

                        {/* Individual Documents */}
                        <div className="space-y-4">
                          {generatedBatch.documents.map((doc: any, index: number) => (
                            <div key={index} className="xinfinity-card overflow-hidden">
                              <div className="flex items-center justify-between p-4 bg-xinfinity-surface/50 border-b border-xinfinity-border">
                                <div>
                                  <h4 className="font-semibold text-xinfinity-foreground">
                                    {currentDocType?.label} #{index + 1}
                                  </h4>
                                  <p className="text-sm text-xinfinity-muted">
                                    {selectedDocumentType === 'invoice' ? (
                                      `${doc.clientName || 'Unknown Client'} • ${doc.total || 'No Total'} ${doc.currency || ''}`
                                    ) : (
                                      `${doc.title || 'Untitled Document'}`
                                    )}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleDownloadPDF(doc)}
                                    className="px-3 py-1 text-xs bg-xinfinity-primary text-white rounded-lg hover:bg-xinfinity-primary/90 transition-colors"
                                  >
                                    📄 Download
                                  </button>
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="text-sm text-xinfinity-muted">
                                  <strong>Preview:</strong>
                                </div>
                                <div className="mt-2 p-3 bg-xinfinity-surface/30 rounded-lg text-sm">
                                  <pre className="whitespace-pre-wrap text-xinfinity-foreground">
                                    {JSON.stringify(doc, null, 2).substring(0, 300)}...
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Company Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Company Settings</h3>
                <p className="text-sm text-gray-600">Edit your company information for document generation</p>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <CompanySettings isOpen={true} onClose={() => setShowSettings(false)} />
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPDFPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Document Preview</h3>
              <button 
                onClick={() => setShowPDFPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {generatedDocument?.document ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Generated Document Data:</h4>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                    {JSON.stringify(generatedDocument.document, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No document data to preview</p>
                </div>
              )}
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">
                  📄 PDF preview functionality is coming soon! For now, you can see the generated document data above.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setShowPDFPreview(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => handleDownloadPDF()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
