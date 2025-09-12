/**
 * Multilingual Document Generation Platform
 * Professional document creation with AI-powered multilingual support
 */

"use client";

import React, { useState, useEffect, Suspense, lazy } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerateEnhancedDocument } from "../../../hooks/use-generate-enhanced-document";
import { useGenerateBatchDocuments } from "../../../hooks/use-generate-batch-documents";
import { usePersistedSettings } from "../../../hooks/use-persisted-settings";
import { useToast } from "../../../hooks/use-toast";
import { LoadingSpinner } from "../../../components/loading";
import { Logo } from "../../../components/logo";
import { CompanySettings } from "../../../components/company-settings";
import { FileUpload } from "../../../components/file-upload";
import {
  DocumentType,
  Locale,
  InvoiceSchema,
  Invoice,
} from "../../../../packages/core";
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
  BeakerIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useTranslations } from "../../../lib/i18n/context";

// Lazy load components
const InvoiceForm = lazy(() => import("../../../components/invoice-form"));

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
  );
}

const supportedLocales: {
  value: Locale;
  label: string;
  flag: string;
  rtl: boolean;
}[] = [
  { value: "en-US", label: "English (US)", flag: "🇺🇸", rtl: false },
  { value: "fr-FR", label: "Français (France)", flag: "🇫🇷", rtl: false },
  { value: "de-DE", label: "Deutsch (Deutschland)", flag: "🇩🇪", rtl: false },
  { value: "es-ES", label: "Español (España)", flag: "🇪🇸", rtl: false },
  { value: "ar-SA", label: "العربية (السعودية)", flag: "🇸🇦", rtl: true },
  { value: "zh-CN", label: "中文 (简体)", flag: "🇨🇳", rtl: false },
  { value: "ja-JP", label: "日本語", flag: "🇯🇵", rtl: false },
  { value: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷", rtl: false },
  { value: "it-IT", label: "Italiano (Italia)", flag: "🇮🇹", rtl: false },
  { value: "ru-RU", label: "Русский (Россия)", flag: "🇷🇺", rtl: false },
  { value: "hi-IN", label: "हिन्दी (भारत)", flag: "🇮🇳", rtl: false },
];

// Enhanced sample prompts with more professional examples
const samplePrompts = {
  invoice: {
    "en-US":
      "Create an invoice for TechCorp Inc. for $3,500 including: Frontend development with React/TypeScript ($2,000), Backend API development with Node.js ($1,200), and Database design and implementation ($300). Due in 30 days.",
    "fr-FR":
      "Créer une facture pour TechCorp Inc. de 3 200 € comprenant : Développement frontend avec React/TypeScript (1 800 €), Développement API backend avec Node.js (1 100 €), et Conception et implémentation de base de données (300 €). Échéance 30 jours.",
    "de-DE":
      "Erstellen Sie eine Rechnung für TechCorp Inc. über 3.200 € einschließlich: Frontend-Entwicklung mit React/TypeScript (1.800 €), Backend-API-Entwicklung mit Node.js (1.100 €) und Datenbankdesign und -implementierung (300 €). Fällig in 30 Tagen.",
    "es-ES":
      "Crear una factura para TechCorp Inc. por 3.200 € incluyendo: Desarrollo frontend con React/TypeScript (1.800 €), Desarrollo de API backend con Node.js (1.100 €), y Diseño e implementación de base de datos (300 €). Vence en 30 días.",
    "ar-SA":
      "إنشاء فاتورة لشركة TechCorp Inc. بمبلغ 3500 دولار تتضمن: تطوير الواجهة الأمامية باستخدام React/TypeScript (2000 دولار)، تطوير API الخلفية باستخدام Node.js (1200 دولار)، وتصميم وتنفيذ قاعدة البيانات (300 دولار). الاستحقاق خلال 30 يوماً.",
    "zh-CN":
      "为TechCorp Inc.创建一张3500美元的发票，包括：使用React/TypeScript的前端开发（2000美元）、使用Node.js的后端API开发（1200美元）、数据库设计和实施（300美元）。30天内到期。",
    "ja-JP":
      "TechCorp Inc.向けに3,500ドルの請求書を作成してください。内容：React/TypeScriptによるフロントエンド開発（2,000ドル）、Node.jsによるバックエンドAPI開発（1,200ドル）、データベース設計と実装（300ドル）。支払期限は30日後。",
    "pt-BR":
      "Criar uma fatura para TechCorp Inc. no valor de R$ 3.500 incluindo: Desenvolvimento frontend com React/TypeScript (R$ 2.000), Desenvolvimento de API backend com Node.js (R$ 1.200), e Design e implementação de banco de dados (R$ 300). Vencimento em 30 dias.",
    "it-IT":
      "Creare una fattura per TechCorp Inc. per 3.200 € inclusi: Sviluppo frontend con React/TypeScript (1.800 €), Sviluppo API backend con Node.js (1.100 €), e Progettazione e implementazione database (300 €). Scadenza 30 giorni.",
    "ru-RU":
      "Создать счет-фактуру для TechCorp Inc. на сумму 3500 долларов, включая: Разработка фронтенда с React/TypeScript (2000 долларов), Разработка бэкенд API с Node.js (1200 долларов), и Проектирование и реализация базы данных (300 долларов). Срок оплаты 30 дней.",
    "hi-IN":
      "TechCorp Inc. के लिए ₹3,50,000 का चालान बनाएं जिसमें शामिल है: React/TypeScript के साथ फ्रंटएंड डेवलपमेंट (₹2,00,000), Node.js के साथ बैकएंड API डेवलपमेंट (₹1,20,000), और डेटाबेस डिज़ाइन और इम्प्लीमेंटेशन (₹30,000)। 30 दिन में देय।",
  },
};

export default function MultilingualDocumentPlatform() {
  const { t, locale: currentLocale } = useTranslations();

  // Helper function to replace placeholders in translation strings
  const formatTranslation = (
    key: string,
    replacements: Record<string, string>
  ) => {
    let translation = t(key);
    Object.entries(replacements).forEach(([placeholder, value]) => {
      translation = translation.replace(`{${placeholder}}`, value);
    });
    return translation;
  };

  // Document types with translations
  const translatedDocumentTypes = [
    {
      type: "invoice" as DocumentType,
      label: t("demo.invoice"),
      icon: DocumentTextIcon,
      description: t("demo.invoiceDesc"),
      color: "blue",
    },
  ];

  const [selectedLocale, setSelectedLocale] = useState<Locale>("en-US");
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<DocumentType>("invoice");
  const [prompt, setPrompt] = useState("");
  const [batchPrompts, setBatchPrompts] = useState<string[]>([""]);
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [batchInputMode, setBatchInputMode] = useState<"text" | "file">("text");
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);
  const [generatedBatch, setGeneratedBatch] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [includeTranslations, setIncludeTranslations] = useState(true);
  const [culturalContext, setCulturalContext] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // New state for batch editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);

  // Ensure component is mounted before allowing operations
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { userContext } = usePersistedSettings();
  const generateSingle = useGenerateEnhancedDocument();
  const generateBatch = useGenerateBatchDocuments();
  const { success, error } = useToast();

  // Get selected locale data
  const selectedLocaleData = supportedLocales.find(
    (l) => l.value === selectedLocale
  );
  const isRTL = selectedLocaleData?.rtl || false;

  // Get current document type config
  const currentDocType = translatedDocumentTypes.find(
    (dt) => dt.type === selectedDocumentType
  );

  const handleGenerateDocument = async () => {
    if (mode === "single") {
      if (!prompt.trim()) {
        error("Please enter a description for your document");
        return;
      }

      // Reset previous generation state
      setGeneratedDocument(null);
      setShowForm(false);
      setIsGenerating(true);

      try {
        console.log("🚀 Starting generation...", {
          prompt: prompt.trim(),
          documentType: selectedDocumentType,
          userContext: userContext,
        });

        const result = await generateSingle.mutateAsync({
          prompt: prompt.trim(),
          documentType: selectedDocumentType,
          userContext: {
            ...userContext,
            defaultCurrency: userContext?.defaultCurrency as any,
            defaultLocale: userContext?.defaultLocale as any,
            // Add language instruction to ensure AI responds in selected language
            languageInstruction: `Please generate the response in ${
              selectedLocaleData?.label || "English"
            } language (${selectedLocale}), regardless of the input language.`,
            outputLanguage: selectedLocale,
            culturalContext: selectedLocaleData?.label,
          },
        });

        console.log("✅ Generation result:", result);

        if (result.success) {
          // Simple extraction - use AI response directly
          let document = result.document || result.content || {};

          console.log("✅ AI Response:", document);

          // Ensure basic required fields exist with simple defaults
          if (!document.from) document.from = {};
          if (!document.to) document.to = {};
          if (!document.from.name)
            document.from.name = userContext?.companyName || "Your Company";
          if (!document.to.name) document.to.name = "Client";
          if (!document.items || !Array.isArray(document.items)) {
            document.items = [
              { description: "Service", quantity: 1, rate: 100, amount: 100 },
            ];
          }
          if (!document.currency)
            document.currency = userContext?.defaultCurrency || "USD";
          if (!document.locale) document.locale = selectedLocale;
          if (document.taxRate === undefined)
            document.taxRate = userContext?.defaultTaxRate || 0;
          if (!document.invoiceNumber)
            document.invoiceNumber = `INV-${Date.now()}`;
          if (!document.date)
            document.date = new Date().toISOString().split("T")[0];

          // Simple totals calculation
          const subtotal = document.items.reduce(
            (sum: number, item: any) =>
              sum + (item.quantity || 0) * (item.rate || 0),
            0
          );
          const taxAmount = subtotal * (document.taxRate || 0);
          const total = subtotal + taxAmount;

          document.subtotal = subtotal;
          document.taxAmount = taxAmount;
          document.total = total;

          const finalResult = {
            success: true,
            document: document,
            content: document,
            assumptions: result.assumptions || [],
          };

          console.log("📋 Final mapped result:", finalResult);
          console.log("🎯 Document ready for form:", finalResult.document);
          console.log("🔍 Document validation:", {
            hasDocument: !!finalResult.document,
            documentKeys: finalResult.document
              ? Object.keys(finalResult.document)
              : [],
            hasFromName: finalResult.document?.from?.name,
            hasToName: finalResult.document?.to?.name,
            hasItems: finalResult.document?.items?.length,
            currency: finalResult.document?.currency,
            total: finalResult.document?.total,
          });
          setGeneratedDocument(finalResult);
          setShowForm(true);
          success(
            `${currentDocType?.label} generated successfully in ${selectedLocaleData?.label}!`
          );
        } else {
          throw new Error(result.error || "Generation failed");
        }
      } catch (err) {
        console.error("❌ Generation failed:", err);
        error(
          `Failed to generate ${currentDocType?.label.toLowerCase()}: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Batch mode
      const validPrompts = batchPrompts.filter((p) => p.trim());
      if (validPrompts.length === 0) {
        error(
          batchInputMode === "file"
            ? "Please upload a file first"
            : "Please enter at least one prompt for batch generation"
        );
        return;
      }

      // Reset previous batch generation state
      setGeneratedBatch(null);
      setShowForm(false);
      setIsGenerating(true);

      try {
        console.log("🚀 Starting batch generation...", {
          prompts: validPrompts,
          documentType: selectedDocumentType,
          inputMode: batchInputMode,
          uploadedDataCount: uploadedData.length,
        });

        const result = await generateBatch.mutateAsync({
          prompts: validPrompts,
          documentType: selectedDocumentType,
          userContext: {
            ...userContext,
            defaultCurrency: userContext?.defaultCurrency as any,
            defaultLocale: userContext?.defaultLocale as any,
            // Add language instruction for batch processing
            languageInstruction: `Please generate all responses in ${
              selectedLocaleData?.label || "English"
            } language (${selectedLocale}), regardless of the input language.`,
            outputLanguage: selectedLocale,
            culturalContext: selectedLocaleData?.label,
          },
        });

        console.log("✅ Batch generation result:", result);

        if (result.success) {
          // Simple batch processing - use AI response directly
          const processedDocuments = (result.documents || []).map(
            (doc: any, index: number) => {
              // Use AI response as-is with minimal defaults
              if (!doc.from) doc.from = {};
              if (!doc.to) doc.to = {};
              if (!doc.from.name)
                doc.from.name = userContext?.companyName || "Your Company";
              if (!doc.to.name) doc.to.name = `Client ${index + 1}`;
              if (!doc.items || !Array.isArray(doc.items)) {
                doc.items = [
                  {
                    description: `Service ${index + 1}`,
                    quantity: 1,
                    rate: 100,
                    amount: 100,
                  },
                ];
              }
              if (!doc.currency)
                doc.currency = userContext?.defaultCurrency || "USD";
              if (!doc.locale) doc.locale = selectedLocale;
              if (doc.taxRate === undefined)
                doc.taxRate = userContext?.defaultTaxRate || 0;
              if (!doc.invoiceNumber)
                doc.invoiceNumber = `INV-${String(index + 1).padStart(3, "0")}`;
              if (!doc.date) doc.date = new Date().toISOString().split("T")[0];

              // Simple totals
              const subtotal = doc.items.reduce(
                (sum: number, item: any) =>
                  sum + (item.quantity || 0) * (item.rate || 0),
                0
              );
              const taxAmount = subtotal * (doc.taxRate || 0);
              const total = subtotal + taxAmount;

              doc.subtotal = subtotal;
              doc.taxAmount = taxAmount;
              doc.total = total;

              return doc;
            }
          );

          const mappedResult = {
            success: true,
            documents: processedDocuments,
            count: processedDocuments.length,
          };

          console.log("📋 Mapped batch result:", mappedResult);
          setGeneratedBatch(mappedResult);
          setShowForm(true);
          success(
            `${validPrompts.length} ${currentDocType?.label}s generated successfully!`
          );
        } else {
          throw new Error(result.error || "Batch generation failed");
        }
      } catch (err) {
        console.error("❌ Batch generation failed:", err);
        error(
          `Failed to generate batch ${currentDocType?.label.toLowerCase()}s: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleDocumentSave = (documentData: Invoice) => {
    console.log("Document saved:", documentData);
    success("Document saved successfully!");
  };

  const handleFileUpload = async (data: any[]) => {
    try {
      console.log("📂 File uploaded with data:", data);

      if (!data || data.length === 0) {
        error("No data found in uploaded file");
        return;
      }

      // Store uploaded data and switch to file mode
      setUploadedData(data);
      setBatchInputMode("file");

      // Convert uploaded data to prompts for batch generation
      const generatedPrompts = data.map((row, index) => {
        if (selectedDocumentType === "invoice") {
          return `Create an invoice for ${
            row.client_name || row.customer || row.to || `Client ${index + 1}`
          } with amount ${row.total || row.amount || "TBD"} ${
            row.currency || "USD"
          }. ${row.description || row.services || row.items || ""}`;
        }
        return `Create a ${selectedDocumentType} document with the following data: ${JSON.stringify(
          row
        )}`;
      });

      setBatchPrompts(generatedPrompts);
      success(
        `📂 Uploaded ${data.length} records! Ready for batch generation.`
      );
    } catch (err) {
      console.error("File upload error:", err);
      error("Failed to process uploaded file");
    }
  };

  const handleEditDocument = (index: number, document: any) => {
    setEditingIndex(index);
    setEditData({ ...document });
  };

  const handleSaveEdit = (updatedDocument: any) => {
    if (editingIndex !== null && generatedBatch) {
      const updatedDocuments = [...generatedBatch.documents];
      updatedDocuments[editingIndex] = updatedDocument;
      setGeneratedBatch({
        ...generatedBatch,
        documents: updatedDocuments,
      });
      setEditingIndex(null);
      setEditData(null);
      success("Document updated successfully!");
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditData(null);
  };

  const handleDeleteDocument = (index: number) => {
    if (
      generatedBatch &&
      window.confirm("Are you sure you want to delete this document?")
    ) {
      const updatedDocuments = generatedBatch.documents.filter(
        (_: any, i: number) => i !== index
      );
      setGeneratedBatch({
        ...generatedBatch,
        documents: updatedDocuments,
        count: updatedDocuments.length,
      });
      success("Document deleted successfully!");
    }
  };

  const handleDownloadAllBatch = async () => {
    if (!generatedBatch?.documents || generatedBatch.documents.length === 0) {
      error("No documents to download");
      return;
    }

    try {
      const { downloadMultiplePDFsAsZip } = await import(
        "../../../lib/pdf-generator"
      );
      toast.loading("📦 Creating ZIP file with all PDFs...", {
        id: "download-batch",
      });
      await downloadMultiplePDFsAsZip(
        generatedBatch.documents,
        `batch-${selectedDocumentType}s-${selectedLocale}`
      );
      toast.success("✅ ZIP file downloaded successfully!", {
        id: "download-batch",
      });
    } catch (err) {
      console.error("Download error:", err);
      toast.error("❌ Failed to download ZIP file", { id: "download-batch" });
    }
  };

  const handleDownloadPDF = async (document?: any) => {
    const docToDownload = document || generatedDocument?.document;
    if (!docToDownload || !isMounted || typeof window === "undefined") {
      error("No document available for download");
      return;
    }

    try {
      console.log("📄 Downloading PDF for document:", docToDownload);

      if (selectedDocumentType === "invoice") {
        // Use the enhanced PDF generator for invoices
        const { EnhancedInvoicePDFGenerator } = await import(
          "../../../lib/pdf-generator-enhanced"
        );

        const pdfGenerator = new EnhancedInvoicePDFGenerator({
          theme: "primary", // Use primary theme with your brand colors
          customTemplate: "modern",
          includeWatermark: false,
          companyLogo: userContext?.logoUrl || null,
          websiteUrl: userContext?.website || "",
          showQRCode: false,
        });

        const pdfDataUri = pdfGenerator.generateInvoicePDF(
          docToDownload as any
        );

        // Convert data URI to blob
        const byteCharacters = atob(pdfDataUri.split(",")[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const pdfBlob = new Blob([byteArray], { type: "application/pdf" });

        // Create download link safely
        if (typeof window !== "undefined" && window.document) {
          const url = URL.createObjectURL(pdfBlob);
          const a = window.document.createElement("a");
          a.href = url;
          a.download = `invoice_${
            docToDownload.invoiceNumber || Date.now()
          }.pdf`;
          window.document.body.appendChild(a);
          a.click();
          window.document.body.removeChild(a);
          URL.revokeObjectURL(url);

          success("Invoice PDF downloaded successfully!");
        } else {
          throw new Error("Browser environment not available");
        }
      } else {
        // For other document types, create a simple text preview for now
        const pdfContent = `
${currentDocType?.label} DOCUMENT
${"=".repeat(50)}

Generated Document: ${currentDocType?.label}
Language: ${selectedLocaleData?.label}
Generated on: ${new Date().toLocaleString()}

Document Data:
${JSON.stringify(docToDownload, null, 2)}

---
Full PDF generation for ${selectedDocumentType} will be available soon.
        `;

        // Create a downloadable text file for non-invoice documents
        if (typeof window !== "undefined" && window.document) {
          const blob = new Blob([pdfContent], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = window.document.createElement("a");
          a.href = url;
          a.download = `${selectedDocumentType}_${selectedLocale}_${Date.now()}.txt`;
          window.document.body.appendChild(a);
          a.click();
          window.document.body.removeChild(a);
          URL.revokeObjectURL(url);

          success(
            "Document downloaded successfully! (PDF coming soon for this document type)"
          );
        } else {
          throw new Error("Browser environment not available");
        }
      }
    } catch (err) {
      console.error("❌ Download failed:", err);
      error(
        `Failed to download document: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const loadSamplePrompt = () => {
    const sample =
      (samplePrompts as any)[selectedDocumentType]?.[selectedLocale] ||
      (samplePrompts as any)[selectedDocumentType]?.["en-US"];
    if (sample) {
      if (mode === "single") {
        setPrompt(sample);
      } else {
        setBatchPrompts([sample, ...batchPrompts.slice(1)]);
      }
    }
  };

  const addBatchPrompt = () => {
    setBatchPrompts([...batchPrompts, ""]);
  };

  const updateBatchPrompt = (index: number, value: string) => {
    const updated = [...batchPrompts];
    updated[index] = value;
    setBatchPrompts(updated);
  };

  const removeBatchPrompt = (index: number) => {
    if (batchPrompts.length > 1) {
      setBatchPrompts(batchPrompts.filter((_, i) => i !== index));
    }
  };

  const handleStartOver = () => {
    setPrompt("");
    setBatchPrompts([""]);
    setGeneratedDocument(null);
    setGeneratedBatch(null);
    setShowForm(false);
    setIsGenerating(false);
    generateSingle.reset();
    generateBatch.reset();
  };

  const isButtonDisabled =
    mode === "single"
      ? !prompt.trim() || isGenerating
      : batchInputMode === "file"
      ? uploadedData.length === 0 || isGenerating
      : batchPrompts.filter((p) => p.trim()).length === 0 || isGenerating;

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
                        {t("demo.title")}
                      </h1>
                      <p className="mt-1 text-sm text-xinfinity-muted">
                        {t("demo.subtitle")}
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
                  {t("demo.companySettings")}
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
                        <h3 className="text-lg font-semibold text-xinfinity-foreground">
                          {t("demo.languageSelection")}
                        </h3>
                      </div>
                      <select
                        value={selectedLocale}
                        onChange={(e) =>
                          setSelectedLocale(e.target.value as Locale)
                        }
                        className="w-full p-3 border border-xinfinity-border rounded-xl focus:ring-2 focus:ring-xinfinity-primary focus:border-transparent bg-white"
                        dir={isRTL ? "rtl" : "ltr"}
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
                            <div>
                              {t("demo.direction")}:{" "}
                              {isRTL
                                ? t("demo.rightToLeft")
                                : t("demo.leftToRight")}
                            </div>
                            <div>
                              {t("demo.culturalContext")}:{" "}
                              {culturalContext
                                ? t("demo.enabled")
                                : t("demo.disabled")}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Document Type Selection */}
                    <div className="xinfinity-card p-6">
                      <div className="flex items-center mb-4">
                        <DocumentDuplicateIcon className="w-5 h-5 text-xinfinity-primary mr-2" />
                        <h3 className="text-lg font-semibold text-xinfinity-foreground">
                          {t("demo.documentType")}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {translatedDocumentTypes.map((docType) => {
                          const Icon = docType.icon;
                          const isSelected =
                            selectedDocumentType === docType.type;
                          return (
                            <button
                              key={docType.type}
                              onClick={() =>
                                setSelectedDocumentType(docType.type)
                              }
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? "border-xinfinity-primary bg-xinfinity-primary/5 text-xinfinity-primary"
                                  : "border-xinfinity-border hover:border-xinfinity-primary/50 text-xinfinity-foreground hover:bg-xinfinity-surface/50"
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <Icon
                                  className={`w-6 h-6 flex-shrink-0 ${
                                    isSelected
                                      ? "text-xinfinity-primary"
                                      : "text-xinfinity-muted"
                                  }`}
                                />
                                <div>
                                  <h4 className="font-medium">
                                    {docType.label}
                                  </h4>
                                  <p className="text-sm text-xinfinity-muted mt-1">
                                    {docType.description}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Generation Mode */}
                    <div className="xinfinity-card p-6">
                      <div className="flex items-center mb-4">
                        <BeakerIcon className="w-5 h-5 text-xinfinity-primary mr-2" />
                        <h3 className="text-lg font-semibold text-xinfinity-foreground">
                          {t("demo.generationMode")}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setMode("single")}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            mode === "single"
                              ? "border-xinfinity-primary bg-xinfinity-primary/5 text-xinfinity-primary"
                              : "border-xinfinity-border hover:border-xinfinity-primary/50 text-xinfinity-foreground hover:bg-xinfinity-surface/50"
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <DocumentTextIcon
                              className={`w-6 h-6 ${
                                mode === "single"
                                  ? "text-xinfinity-primary"
                                  : "text-xinfinity-muted"
                              }`}
                            />
                            <div>
                              <h4 className="font-medium">
                                {t("demo.single")}
                              </h4>
                              <p className="text-xs text-xinfinity-muted">
                                {t("demo.singleDesc")}
                              </p>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => setMode("batch")}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            mode === "batch"
                              ? "border-xinfinity-primary bg-xinfinity-primary/5 text-xinfinity-primary"
                              : "border-xinfinity-border hover:border-xinfinity-primary/50 text-xinfinity-foreground hover:bg-xinfinity-surface/50"
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <ClipboardDocumentListIcon
                              className={`w-6 h-6 ${
                                mode === "batch"
                                  ? "text-xinfinity-primary"
                                  : "text-xinfinity-muted"
                              }`}
                            />
                            <div>
                              <h4 className="font-medium">{t("demo.batch")}</h4>
                              <p className="text-xs text-xinfinity-muted">
                                {t("demo.batchDesc")}
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Batch Input Mode (only show when batch mode is selected) */}
                    {mode === "batch" && (
                      <div className="xinfinity-card p-6">
                        <div className="flex items-center mb-4">
                          <DocumentArrowUpIcon className="w-5 h-5 text-xinfinity-primary mr-2" />
                          <h3 className="text-lg font-semibold text-xinfinity-foreground">
                            Batch Input Method
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setBatchInputMode("text")}
                            className={`p-4 rounded-xl border-2 transition-all text-center ${
                              batchInputMode === "text"
                                ? "border-xinfinity-primary bg-xinfinity-primary/5 text-xinfinity-primary"
                                : "border-xinfinity-border hover:border-xinfinity-primary/50 text-xinfinity-foreground hover:bg-xinfinity-surface/50"
                            }`}
                          >
                            <div className="flex flex-col items-center space-y-2">
                              <DocumentTextIcon
                                className={`w-6 h-6 ${
                                  batchInputMode === "text"
                                    ? "text-xinfinity-primary"
                                    : "text-xinfinity-muted"
                                }`}
                              />
                              <div>
                                <h4 className="font-medium">Manual Input</h4>
                                <p className="text-xs text-xinfinity-muted">
                                  Type prompts manually
                                </p>
                              </div>
                            </div>
                          </button>
                          <button
                            onClick={() => setBatchInputMode("file")}
                            className={`p-4 rounded-xl border-2 transition-all text-center ${
                              batchInputMode === "file"
                                ? "border-xinfinity-primary bg-xinfinity-primary/5 text-xinfinity-primary"
                                : "border-xinfinity-border hover:border-xinfinity-primary/50 text-xinfinity-foreground hover:bg-xinfinity-surface/50"
                            }`}
                          >
                            <div className="flex flex-col items-center space-y-2">
                              <DocumentArrowUpIcon
                                className={`w-6 h-6 ${
                                  batchInputMode === "file"
                                    ? "text-xinfinity-primary"
                                    : "text-xinfinity-muted"
                                }`}
                              />
                              <div>
                                <h4 className="font-medium">File Upload</h4>
                                <p className="text-xs text-xinfinity-muted">
                                  Upload CSV/Excel
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>

                        {batchInputMode === "file" && (
                          <div className="mt-4">
                            <FileUpload
                              onFileProcessed={(result) => {
                                if (result.success && result.data) {
                                  handleFileUpload(result.data);
                                } else {
                                  error(
                                    result.error ||
                                      "Failed to process uploaded file"
                                  );
                                }
                              }}
                              onError={(errorMsg) => error(errorMsg)}
                              accept=".csv,.xlsx,.xls"
                              className="border-2 border-dashed border-xinfinity-border hover:border-xinfinity-primary rounded-xl p-6"
                            />
                            {uploadedData.length > 0 && (
                              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-sm text-green-800">
                                  ✅ <strong>{uploadedData.length}</strong>{" "}
                                  records uploaded successfully!
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                  Data has been converted to prompts for batch
                                  generation.
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Options */}
                    <div className="xinfinity-card p-6">
                      <h3 className="text-lg font-semibold text-xinfinity-foreground mb-4">
                        {t("demo.generationOptions")}
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={includeTranslations}
                            onChange={(e) =>
                              setIncludeTranslations(e.target.checked)
                            }
                            className="rounded border-xinfinity-border text-xinfinity-primary shadow-sm focus:border-xinfinity-primary focus:ring focus:ring-xinfinity-primary/20"
                          />
                          <span className="ml-3 text-sm text-xinfinity-foreground">
                            {t("demo.includeUITranslations")}
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={culturalContext}
                            onChange={(e) =>
                              setCulturalContext(e.target.checked)
                            }
                            className="rounded border-xinfinity-border text-xinfinity-primary shadow-sm focus:border-xinfinity-primary focus:ring focus:ring-xinfinity-primary/20"
                          />
                          <span className="ml-3 text-sm text-xinfinity-foreground">
                            {t("demo.applyCulturalContext")}
                          </span>
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
                      {currentDocType && (
                        <currentDocType.icon className="w-8 h-8 text-white" />
                      )}
                    </motion.div>
                    <h2 className="text-3xl font-bold text-xinfinity-foreground mb-3">
                      {formatTranslation("demo.createTitle", {
                        documentType: currentDocType?.label || "",
                        locale: selectedLocaleData?.label || "",
                      })}
                    </h2>
                    <p
                      className="text-xinfinity-muted text-lg max-w-2xl mx-auto"
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      {formatTranslation("demo.createDescription", {
                        documentType: currentDocType?.label.toLowerCase() || "",
                      })}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Language Flexibility Info */}
                    <div className="xinfinity-card p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                      <div className="flex items-center mb-2">
                        <LanguageIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-blue-800">
                          🌍 {t("demo.smartLanguageProcessing")}
                        </h4>
                      </div>
                      <p className="text-sm text-blue-700">
                        <strong>
                          {formatTranslation("demo.smartLanguageDesc", {
                            locale: selectedLocaleData?.label || "",
                          })}
                        </strong>
                      </p>
                      <div className="mt-2 text-xs text-blue-600">
                        💡 {t("demo.examplesTitle")}: {t("demo.examplesDesc")}
                      </div>
                    </div>

                    {/* Mode-specific Input */}
                    {mode === "single" ? (
                      <div className="relative">
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder={formatTranslation(
                            "demo.promptPlaceholder",
                            {
                              documentType:
                                currentDocType?.label.toLowerCase() || "",
                              locale: selectedLocaleData?.label || "",
                            }
                          )}
                          className="w-full h-32 p-4 border border-xinfinity-border rounded-xl resize-none focus:ring-2 focus:ring-xinfinity-primary focus:border-transparent bg-white"
                          dir={isRTL ? "rtl" : "ltr"}
                        />
                        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                          <button
                            onClick={loadSamplePrompt}
                            className="px-3 py-1 text-xs bg-xinfinity-surface hover:bg-xinfinity-border rounded-lg transition-colors"
                          >
                            {t("demo.loadSample")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-xinfinity-foreground">
                            {batchInputMode === "file"
                              ? "File-Based Batch Generation"
                              : "Batch Prompts"}
                          </h3>
                          {batchInputMode === "text" && (
                            <button
                              onClick={loadSamplePrompt}
                              className="px-3 py-1 text-xs bg-xinfinity-surface hover:bg-xinfinity-border rounded-lg transition-colors"
                            >
                              Load Sample
                            </button>
                          )}
                        </div>

                        {batchInputMode === "file" ? (
                          // File-based batch input
                          <div className="space-y-4">
                            {uploadedData.length > 0 ? (
                              <div className="space-y-4">
                                <div className="xinfinity-card p-4 bg-blue-50 border border-blue-200">
                                  <h4 className="font-medium text-blue-800 mb-2">
                                    📂 Ready to generate {uploadedData.length}{" "}
                                    documents
                                  </h4>
                                  <p className="text-sm text-blue-700">
                                    Your uploaded data has been converted to
                                    generation prompts. Click
                                    &quot;Generate&quot; to create all documents
                                    in {selectedLocaleData?.label}.
                                  </p>
                                </div>

                                {/* Show preview of generated prompts */}
                                <details className="xinfinity-card p-4">
                                  <summary className="cursor-pointer font-medium text-xinfinity-foreground hover:text-xinfinity-primary">
                                    🔍 Preview Generated Prompts (
                                    {batchPrompts.length})
                                  </summary>
                                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                                    {batchPrompts
                                      .slice(0, 5)
                                      .map((prompt, index) => (
                                        <div
                                          key={index}
                                          className="p-2 bg-xinfinity-surface/50 rounded text-sm"
                                        >
                                          <span className="font-medium text-xinfinity-primary">
                                            #{index + 1}:
                                          </span>{" "}
                                          {prompt.substring(0, 100)}...
                                        </div>
                                      ))}
                                    {batchPrompts.length > 5 && (
                                      <div className="text-xs text-xinfinity-muted text-center">
                                        ... and {batchPrompts.length - 5} more
                                        prompts
                                      </div>
                                    )}
                                  </div>
                                </details>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <DocumentArrowUpIcon className="w-12 h-12 text-xinfinity-muted mx-auto mb-3" />
                                <h4 className="font-medium text-xinfinity-foreground mb-2">
                                  Upload a file to get started
                                </h4>
                                <p className="text-sm text-xinfinity-muted">
                                  Go to the &quot;Batch Input Method&quot;
                                  section above and select &quot;File
                                  Upload&quot; to upload your CSV or Excel file.
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Text-based batch input
                          <>
                            {batchPrompts.map((batchPrompt, index) => (
                              <div key={index} className="flex gap-3">
                                <div className="flex-1 relative">
                                  <textarea
                                    value={batchPrompt}
                                    onChange={(e) =>
                                      updateBatchPrompt(index, e.target.value)
                                    }
                                    placeholder={`${currentDocType?.label} ${
                                      index + 1
                                    } in any language - output in ${
                                      selectedLocaleData?.label
                                    }...`}
                                    className="w-full h-24 p-4 border border-xinfinity-border rounded-xl resize-none focus:ring-2 focus:ring-xinfinity-primary focus:border-transparent bg-white"
                                    dir={isRTL ? "rtl" : "ltr"}
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
                          </>
                        )}
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
                          ? "bg-xinfinity-muted cursor-not-allowed"
                          : "bg-gradient-to-r from-xinfinity-primary to-xinfinity-secondary hover:shadow-lg hover:shadow-xinfinity-primary/25"
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
                          {mode === "single"
                            ? formatTranslation("demo.generateButton", {
                                documentType: currentDocType?.label || "",
                                locale: selectedLocaleData?.label || "",
                              })
                            : `Generate ${
                                batchInputMode === "file"
                                  ? uploadedData.length
                                  : batchPrompts.filter((p) => p.trim()).length
                              } ${currentDocType?.label}s in ${
                                selectedLocaleData?.label
                              }`}
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
                      {mode === "single"
                        ? `Edit ${currentDocType?.label} (${selectedLocaleData?.label})`
                        : `Review ${generatedBatch?.count || 0} Generated ${
                            currentDocType?.label
                          }s`}
                    </h2>
                    <p className="text-xinfinity-muted">
                      {mode === "single"
                        ? "Review and customize your generated document"
                        : "Review your batch-generated documents and download individually"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {mode === "single" && (
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
                {mode === "single" ? (
                  // Single Document Form
                  <Suspense fallback={<FormSkeleton />}>
                    {selectedDocumentType === "invoice" &&
                      generatedDocument?.document && (
                        <div className="space-y-6">
                          {/* Show Generated Data Preview */}
                          {/* Invoice Form */}
                          <div className="space-y-6">
                            {/* Debug: Show what we actually received */}

                            {/* Show form based on more flexible conditions */}
                            {generatedDocument?.document ? (
                              <div className="space-y-6">
                                <div className="xinfinity-card p-6 bg-green-50 border border-green-200">
                                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                                    🎯 Editable Invoice Form
                                  </h3>
                                  <p className="text-green-700 text-sm">
                                    The AI-generated data has been loaded into
                                    the form below. You can edit any field and
                                    the changes will be reflected in the PDF.
                                  </p>
                                </div>
                                <InvoiceForm
                                  key={`invoice-form-${Date.now()}-${
                                    generatedDocument._debug?.timestamp || ""
                                  }`}
                                  initialData={generatedDocument.document}
                                  onSubmit={handleDocumentSave}
                                  aiAssumptions={generatedDocument.assumptions}
                                  defaultCurrency={
                                    generatedDocument.document.currency || "USD"
                                  }
                                  defaultLocale={selectedLocale}
                                />
                              </div>
                            ) : (
                              <div className="xinfinity-card p-6 bg-red-50 border border-red-200">
                                <h3 className="text-lg font-semibold text-red-800 mb-2">
                                  ❌ No Document Data Available
                                </h3>
                                <p className="text-red-700 mb-4">
                                  The API response doesn&apos;t contain document
                                  data. Check the debug information above to see
                                  what was actually received from the AI.
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
                  </Suspense>
                ) : (
                  // Batch Documents Display
                  <div className="space-y-6">
                    {generatedBatch && (
                      <>
                        {/* Batch Statistics */}
                        {/* Enhanced Batch Operations */}
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg font-semibold text-blue-800">
                              📊 Batch Generation Results
                            </h3>
                            <p className="text-sm text-blue-700">
                              Generated {generatedBatch.count} documents in{" "}
                              {selectedLocaleData?.label}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={handleDownloadAllBatch}
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center space-x-2"
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                              <span>📦 Download All as ZIP</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {generatedBatch.count}
                            </div>
                            <div className="text-blue-600">
                              Documents Generated
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              100%
                            </div>
                            <div className="text-green-600">Success Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {selectedLocaleData?.label}
                            </div>
                            <div className="text-purple-600">Language</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {currentDocType?.label}
                            </div>
                            <div className="text-orange-600">Document Type</div>
                          </div>
                        </div>

                        {/* Individual Documents with Edit Capabilities */}
                        <div className="space-y-4">
                          {generatedBatch.documents.map(
                            (doc: any, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="xinfinity-card overflow-hidden border-l-4 border-l-xinfinity-primary"
                              >
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-xinfinity-surface/50 to-xinfinity-primary/5 border-b border-xinfinity-border">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-xinfinity-primary/10 text-xinfinity-primary">
                                        #{index + 1}
                                      </span>
                                      <h4 className="font-semibold text-xinfinity-foreground">
                                        {currentDocType?.label}
                                      </h4>
                                    </div>
                                    <p className="text-sm text-xinfinity-muted mt-1">
                                      {selectedDocumentType === "invoice"
                                        ? `${
                                            doc.to?.name ||
                                            doc.clientName ||
                                            "Unknown Client"
                                          } • ${doc.total || "No Total"} ${
                                            doc.currency || ""
                                          }`
                                        : `${doc.title || "Untitled Document"}`}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() =>
                                        handleEditDocument(index, doc)
                                      }
                                      className="px-3 py-1 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-1"
                                    >
                                      <EyeIcon className="w-3 h-3" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDownloadPDF(doc)}
                                      className="px-3 py-1 text-xs bg-xinfinity-primary text-white rounded-lg hover:bg-xinfinity-primary/90 transition-colors flex items-center space-x-1"
                                    >
                                      <ArrowDownTrayIcon className="w-3 h-3" />
                                      <span>PDF</span>
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteDocument(index)
                                      }
                                      className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                                    >
                                      <TrashIcon className="w-3 h-3" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Expandable Preview */}
                                <div className="p-4">
                                  <details className="group">
                                    <summary className="cursor-pointer text-sm font-medium text-xinfinity-primary hover:text-xinfinity-secondary transition-colors list-none">
                                      <div className="flex items-center space-x-2">
                                        <span>🔍 Preview Document Data</span>
                                        <span className="group-open:rotate-90 transition-transform">
                                          ▶
                                        </span>
                                      </div>
                                    </summary>
                                    <div className="mt-3 p-3 bg-xinfinity-surface/30 rounded-lg text-sm">
                                      {selectedDocumentType === "invoice" ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                          <div>
                                            <span className="font-medium text-xinfinity-muted">
                                              Invoice #:
                                            </span>
                                            <div className="text-xinfinity-foreground">
                                              {doc.invoiceNumber || "N/A"}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-xinfinity-muted">
                                              Client:
                                            </span>
                                            <div className="text-xinfinity-foreground">
                                              {doc.to?.name ||
                                                doc.clientName ||
                                                "N/A"}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-xinfinity-muted">
                                              Total:
                                            </span>
                                            <div className="text-xinfinity-foreground">
                                              {doc.total || "N/A"}{" "}
                                              {doc.currency || ""}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-xinfinity-muted">
                                              Due Date:
                                            </span>
                                            <div className="text-xinfinity-foreground">
                                              {doc.dueDate || "N/A"}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-xinfinity-muted">
                                              Items:
                                            </span>
                                            <div className="text-xinfinity-foreground">
                                              {doc.items?.length || 0}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-xinfinity-muted">
                                              Status:
                                            </span>
                                            <div className="text-green-600">
                                              ✅ Generated
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <pre className="whitespace-pre-wrap text-xinfinity-foreground overflow-x-auto">
                                          {JSON.stringify(
                                            doc,
                                            null,
                                            2
                                          ).substring(0, 500)}
                                          ...
                                        </pre>
                                      )}
                                    </div>
                                  </details>
                                </div>
                              </motion.div>
                            )
                          )}
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

      {/* Edit Document Modal */}
      {editingIndex !== null && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit {currentDocType?.label} #{editingIndex + 1}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <TrashIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedDocumentType === "invoice" && editData && (
                <Suspense fallback={<FormSkeleton />}>
                  <InvoiceForm
                    key={`edit-invoice-${editingIndex}`}
                    initialData={editData}
                    onSubmit={handleSaveEdit}
                    defaultCurrency={editData.currency || "USD"}
                    defaultLocale={selectedLocale}
                  />
                </Suspense>
              )}
            </div>
          </motion.div>
        </div>
      )}

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
                <h3 className="text-xl font-semibold text-gray-900">
                  Company Settings
                </h3>
                <p className="text-sm text-gray-600">
                  Edit your company information for document generation
                </p>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <CompanySettings
              isOpen={true}
              onClose={() => setShowSettings(false)}
            />

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
              <h3 className="text-xl font-semibold text-gray-900">
                Document Preview
              </h3>
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
                  <h4 className="font-medium text-gray-900 mb-3">
                    Generated Document Data:
                  </h4>
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
                  📄 PDF preview functionality is coming soon! For now, you can
                  see the generated document data above.
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
  );
}
