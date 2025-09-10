"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, lazy, Suspense } from "react";
import {
  InformationCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { InvoiceSchema, Invoice, InvoiceItem } from "../../packages/core";
import { EmailWarningModal } from "./modal";
import { downloadEnhancedInvoicePDF } from "../lib/pdf-generator-enhanced";
import { formatCurrency, getCurrencySymbol } from "../lib/currency";
import { useUserContext } from "../lib/user-context";
import { Tooltip } from "./tooltip";
import { motion, Variants } from "framer-motion";

// Lazy load the heavy PDF preview modal
const PDFPreviewModal = lazy(() =>
  import("./pdf-preview-modal").then((module) => ({
    default: module.PDFPreviewModal,
  }))
);

// Simple loading component for PDF modal
function PDFModalSkeleton() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF Preview...</p>
        </div>
      </div>
    </div>
  );
}

interface InvoiceFormProps {
  initialData?: Partial<Invoice>;
  onSubmit: (data: Invoice) => void;
  isSubmitting?: boolean;
  aiAssumptions?: string[];
  defaultCurrency?: string;
  defaultLocale?: string;
  persistSettings?: (currency: string, locale: string) => void;
}

export default function InvoiceForm({
  initialData,
  onSubmit,
  isSubmitting,
  aiAssumptions,
  defaultCurrency = "USD",
  defaultLocale = "en-US",
  persistSettings,
}: InvoiceFormProps) {
  const [showEmailWarning, setShowEmailWarning] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [formData, setFormData] = useState<Invoice | null>(null);
  const [missingEmails, setMissingEmails] = useState<string[]>([]);
  const [pendingSubmitData, setPendingSubmitData] = useState<Invoice | null>(
    null
  );

  // Get user context for company settings
  const { context: userContext } = useUserContext();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<Invoice>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: {
      type: "invoice",
      invoiceNumber: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: "",
      from: { name: "", address: "", email: "", phone: "" },
      to: { name: "", address: "", email: "", phone: "" },
      items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
      subtotal: 0,
      taxRate: userContext?.defaultTaxRate || 0,
      taxAmount: 0,
      total: 0,
      currency: (userContext?.defaultCurrency || defaultCurrency) as any,
      locale: (userContext?.defaultLocale || defaultLocale) as any,
      terms: "",
      notes: "",
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      const formData = {
        type: "invoice" as const,
        invoiceNumber: initialData.invoiceNumber || "",
        date: initialData.date || new Date().toISOString().split("T")[0],
        dueDate: initialData.dueDate || "",
        from: {
          name: initialData.from?.name || "",
          address: initialData.from?.address || "",
          email: initialData.from?.email || "",
          phone: initialData.from?.phone || "",
        },
        to: {
          name:
            initialData.to?.name ||
            (initialData as any)?._originalApiResponse?.client_name ||
            "",
          address:
            initialData.to?.address ||
            (initialData as any)?._originalApiResponse?.client_address ||
            "",
          email:
            initialData.to?.email ||
            (initialData as any)?._originalApiResponse?.client_email ||
            "",
          phone:
            initialData.to?.phone ||
            (initialData as any)?._originalApiResponse?.client_phone ||
            "",
        },
        items: initialData.items?.length
          ? initialData.items
          : [{ description: "", quantity: 1, rate: 0, amount: 0 }],
        subtotal: initialData.subtotal ?? 0,
        taxRate: initialData.taxRate ?? userContext?.defaultTaxRate ?? 0,
        taxAmount: initialData.taxAmount ?? 0,
        total: initialData.total ?? 0,
        currency: (initialData.currency ||
          userContext?.defaultCurrency ||
          defaultCurrency) as any,
        locale: (initialData.locale ||
          userContext?.defaultLocale ||
          defaultLocale) as any,
        terms: initialData.terms || "",
        notes: initialData.notes || "",
      };
      reset(formData);
    }
  }, [initialData, reset, defaultCurrency, defaultLocale, userContext]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const watchedTaxRate = watch("taxRate");

  // Calculate totals whenever items or tax rate changes
  useEffect(() => {
    const subtotal = watchedItems.reduce((sum: number, item: InvoiceItem) => {
      const amount = (item.quantity || 0) * (item.rate || 0);
      return sum + amount;
    }, 0);

    // Convert percentage to decimal for calculation (e.g., 8% becomes 0.08)
    const taxAmount = subtotal * ((watchedTaxRate || 0) / 100);
    const total = subtotal + taxAmount;

    // Update item amounts
    watchedItems.forEach((item: InvoiceItem, index: number) => {
      const amount = (item.quantity || 0) * (item.rate || 0);
      setValue(`items.${index}.amount`, amount);
    });

    setValue("subtotal", subtotal);
    setValue("taxAmount", taxAmount);
    setValue("total", total);
  }, [watchedItems, watchedTaxRate, setValue]);

  const addItem = () => {
    append({ description: "", quantity: 1, rate: 0, amount: 0 });
  };

  const validateEmailsAndSubmit = (data: Invoice) => {
    const missing: string[] = [];

    if (!data.from.email) {
      missing.push(`From: ${data.from.name || "Sender"}`);
    }

    if (!data.to.email) {
      missing.push(`To: ${data.to.name || "Recipient"}`);
    }

    if (missing.length > 0) {
      setMissingEmails(missing);
      setPendingSubmitData(data);
      setShowEmailWarning(true);
    } else {
      onSubmit(data);
    }
  };

  const handleContinueWithoutEmails = () => {
    if (pendingSubmitData) {
      onSubmit(pendingSubmitData);
      setPendingSubmitData(null);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
      <EmailWarningModal
        isOpen={showEmailWarning}
        onClose={() => setShowEmailWarning(false)}
        onContinue={handleContinueWithoutEmails}
        missingEmails={missingEmails}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-fibonacci mx-auto"
      >
        <form
          onSubmit={handleSubmit(validateEmailsAndSubmit)}
          className="space-y-12"
        >
          {/* AI Assumptions Display */}
          {aiAssumptions && aiAssumptions.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="xinfinity-card bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/50"
            >
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 text-xinfinity-primary mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-xinfinity-primary mb-3">
                    AI Generated Content - Assumptions Made
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {aiAssumptions.map((assumption, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-xinfinity-secondary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {assumption}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-xinfinity-primary/70 mt-3 italic">
                    Please review and modify the generated content as needed to
                    ensure accuracy.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Header Information */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <div className="xinfinity-card">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  Invoice Number
                  <Tooltip content="A unique identifier for this invoice. Use a format like INV-001, INV-2024-001, etc.">
                    <InformationCircleIcon className="w-4 h-4 ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <input
                  {...register("invoiceNumber")}
                  className="xinfinity-input"
                  placeholder="INV-001"
                  aria-describedby="invoice-number-help"
                />
                {errors.invoiceNumber && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.invoiceNumber.message}
                  </p>
                )}
                <p
                  id="invoice-number-help"
                  className="text-xs text-gray-500 mt-2"
                >
                  This will appear on your invoice and should be unique for each
                  invoice
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="xinfinity-card">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  Date
                  <Tooltip content="The date this invoice was created/issued">
                    <InformationCircleIcon className="w-4 h-4 ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <input
                  {...register("date")}
                  type="date"
                  className="xinfinity-input"
                  aria-describedby="date-help"
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div className="xinfinity-card">
                <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  Due Date
                  <Tooltip content="When payment is expected. Typically 15-30 days from invoice date">
                    <InformationCircleIcon className="w-4 h-4 ml-2 text-gray-400 cursor-help" />
                  </Tooltip>
                </label>
                <input
                  {...register("dueDate")}
                  type="date"
                  className="xinfinity-input"
                  aria-describedby="due-date-help"
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.dueDate.message}
                  </p>
                )}
                <p id="due-date-help" className="text-xs text-gray-500 mt-2">
                  Payment deadline for this invoice
                </p>
              </div>
            </div>
          </motion.div>

          {/* From/To Information */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="xinfinity-card">
              <h3 className="text-lg font-semibold xinfinity-text-gradient mb-6">
                From (Your Information)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    {...register("from.name")}
                    className="xinfinity-input"
                    placeholder="Your Company Name"
                  />
                  {errors.from?.name && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.from.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    {...register("from.address")}
                    className="xinfinity-input min-h-[80px] resize-none"
                    rows={3}
                    placeholder="Your Address"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      {...register("from.email")}
                      type="email"
                      className="xinfinity-input"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      {...register("from.phone")}
                      className="xinfinity-input"
                      placeholder="Your Phone Number"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="xinfinity-card">
              <h3 className="text-lg font-semibold xinfinity-text-gradient mb-6">
                To (Client Information)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    {...register("to.name")}
                    className="xinfinity-input"
                    placeholder="Client Company Name"
                  />
                  {errors.to?.name && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.to.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    {...register("to.address")}
                    className="xinfinity-input min-h-[80px] resize-none"
                    rows={3}
                    placeholder="Client Address"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      {...register("to.email")}
                      type="email"
                      className="xinfinity-input"
                      placeholder="client@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      {...register("to.phone")}
                      className="xinfinity-input"
                      placeholder="Client Phone Number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Items Section */}
          <motion.div variants={itemVariants} className="xinfinity-card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold xinfinity-text-gradient">
                Invoice Items
              </h3>
              <motion.button
                type="button"
                onClick={addItem}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="xinfinity-button text-sm"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Item
              </motion.button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xinfinity-card bg-white/50 border border-gray-200/50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        {...register(`items.${index}.description`)}
                        className="xinfinity-input"
                        placeholder="Item description"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="0"
                        step="0.01"
                        className="xinfinity-input"
                        placeholder="1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rate
                      </label>
                      <input
                        {...register(`items.${index}.rate`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min="0"
                        step="0.01"
                        className="xinfinity-input"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Amount
                      </label>
                      <input
                        {...register(`items.${index}.amount`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        readOnly
                        className="xinfinity-input bg-gray-50 cursor-not-allowed"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      {fields.length > 1 && (
                        <motion.button
                          type="button"
                          onClick={() => remove(index)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Totals Section */}
          <motion.div variants={itemVariants} className="flex justify-end">
            <div className="w-full max-w-md xinfinity-card bg-gradient-to-br from-gray-50 to-blue-50/30">
              <h3 className="text-lg font-semibold xinfinity-text-gradient mb-4">
                Invoice Totals
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Subtotal:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(
                      watch("subtotal") || 0,
                      watch("currency") ||
                        userContext?.defaultCurrency ||
                        defaultCurrency
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">
                    Tax Rate (%):
                  </label>
                  <div className="w-20">
                    <input
                      {...register("taxRate", { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="xinfinity-input text-right text-sm"
                      placeholder={(
                        userContext?.defaultTaxRate || 0
                      ).toString()}
                      defaultValue={userContext?.defaultTaxRate || 0}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Tax Amount:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(
                      watch("taxAmount") || 0,
                      watch("currency") ||
                        userContext?.defaultCurrency ||
                        defaultCurrency
                    )}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total:
                    </span>
                    <span className="text-lg font-bold xinfinity-text-gradient">
                      {formatCurrency(
                        watch("total") || 0,
                        watch("currency") ||
                          userContext?.defaultCurrency ||
                          defaultCurrency
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Terms and Notes */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="xinfinity-card">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Terms & Conditions
              </label>
              <textarea
                {...register("terms")}
                className="xinfinity-input min-h-[120px] resize-none"
                rows={5}
                placeholder="Payment terms and conditions"
              />
            </div>
            <div className="xinfinity-card">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Notes
              </label>
              <textarea
                {...register("notes")}
                className="xinfinity-input min-h-[120px] resize-none"
                rows={5}
                placeholder="Additional notes"
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t border-gray-200"
          >
            <motion.button
              type="button"
              onClick={() => {
                const currentData = getValues() as Invoice;
                setFormData(currentData);
                setShowPDFPreview(true);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-lg font-medium text-xinfinity-primary border-2 border-xinfinity-primary/20 hover:border-xinfinity-primary/40 bg-white hover:bg-white/70 transition-all duration-300 backdrop-blur-sm"
            >
              Preview PDF
            </motion.button>

            <motion.button
              type="button"
              onClick={() => {
                const currentData = getValues() as Invoice;
                downloadEnhancedInvoicePDF(
                  currentData,
                  `invoice-${currentData.invoiceNumber}.pdf`,
                  {
                    theme: "primary", // Use primary theme with your brand colors
                    customTemplate: "modern",
                    includeWatermark: false,
                  }
                );
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-xinfinity-secondary to-xinfinity-primary-light hover:from-xinfinity-secondary/90 hover:to-xinfinity-primary-light/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Download PDF
            </motion.button>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="xinfinity-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Invoice"}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      {/* PDF Preview Modal with Lazy Loading */}
      {showPDFPreview && formData && (
        <Suspense fallback={<PDFModalSkeleton />}>
          <PDFPreviewModal
            isOpen={showPDFPreview}
            onClose={() => setShowPDFPreview(false)}
            invoice={formData}
            onDownload={() => setShowPDFPreview(false)}
          />
        </Suspense>
      )}
    </>
  );
}
