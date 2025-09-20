"use client";

import { useState, useEffect, useCallback } from "react";
import { Invoice } from "../../packages/core";
import { generatePdfDataUri, downloadPdf } from "../lib/pdf-generator-unified";
import { PDFThemeName } from "../lib/pdf-theme-system";
import { getDirection } from "../lib/i18n";
import type { Locale } from "../../packages/core/schemas";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onDownload: () => void;
}

interface PDFOptions {
  template: "modern" | "classic" | "minimal";
  theme: PDFThemeName;
  includeWatermark: boolean;
  accentColor: string;
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  invoice,
  onDownload,
}: PDFPreviewModalProps) {
  const [pdfOptions, setPDFOptions] = useState<PDFOptions>({
    template: "modern",
    theme: "primary", // Use primary theme with your brand colors as default
    includeWatermark: false,
    accentColor: "#2563eb",
  });
  const [pdfDataUri, setPdfDataUri] = useState<string>("");
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewError, setPreviewError] = useState<string>("");

  const generatePreview = useCallback(async () => {
    if (!invoice) {
      console.warn("No invoice data provided for preview");
      setPreviewError("No invoice data available");
      return;
    }

    console.log(
      "Starting PDF preview generation for invoice:",
      invoice.invoiceNumber
    );
    console.log("PDF options:", pdfOptions);
    setIsGenerating(true);
    setPreviewError("");

    try {
      // Clean up previous blob URL
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl("");
      }

      console.log("Calling unified PDF preview...");
      const invoiceLocale = (invoice.locale as Locale) || "en-US";
      const textDirection = getDirection(invoiceLocale);

      const dataUri = await generatePdfDataUri(invoice, {
        documentType: 'invoice',
        locale: invoiceLocale,
        template: pdfOptions.template,
        theme: pdfOptions.theme,
        includeWatermark: pdfOptions.includeWatermark,
        accentColor: pdfOptions.accentColor,
        textDirection,
      });

      console.log("PDF generation completed");
      console.log("Data URI length:", dataUri?.length);
      console.log("Data URI prefix:", dataUri?.substring(0, 50));

      // Validate data URI format
      if (!dataUri || !dataUri.startsWith("data:application/pdf")) {
        console.error(
          "Invalid PDF data URI format:",
          dataUri?.substring(0, 100)
        );
        throw new Error("Invalid PDF data URI format");
      }

      // Convert data URI to blob for better browser compatibility
      try {
        console.log("Converting data URI to blob...");
        const response = await fetch(dataUri);
        const blob = await response.blob();
        console.log("Blob created, size:", blob.size, "type:", blob.type);
        const blobUrl = URL.createObjectURL(blob);
        console.log("Blob URL created:", blobUrl);

        setPdfDataUri(dataUri);
        setPdfBlobUrl(blobUrl);
      } catch (blobError) {
        console.warn("Blob conversion failed, using data URI only:", blobError);
        setPdfDataUri(dataUri);
      }
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      setPreviewError(error instanceof Error ? error.message : "Unknown error");
      setPdfDataUri("");
      setPdfBlobUrl("");
    } finally {
      setIsGenerating(false);
    }
  }, [invoice, pdfOptions, pdfBlobUrl]);

  const handleDownloadWithOptions = () => {
    const invoiceLocale = (invoice.locale as Locale) || "en-US";
    const textDirection = getDirection(invoiceLocale);

    downloadPdf(invoice, {
      documentType: 'invoice',
      locale: invoiceLocale,
      template: pdfOptions.template,
      theme: pdfOptions.theme,
      includeWatermark: pdfOptions.includeWatermark,
      accentColor: pdfOptions.accentColor,
      textDirection,
      filename: `invoice-${invoice.invoiceNumber}.pdf`,
    });
    onDownload();
  };

  // Generate preview when modal opens or options change
  useEffect(() => {
    if (isOpen) {
      generatePreview();
    }

    // Cleanup blob URL when modal closes
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [isOpen, pdfOptions, generatePreview, pdfBlobUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  // Handle escape key and overlay click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={handleOverlayClick}
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden relative">
        {/* Header with improved close button */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 relative">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold">PDF Preview</h2>
              <p className="text-blue-100 mt-1 text-sm sm:text-base">
                Invoice #{invoice.invoiceNumber}
              </p>
            </div>
            {/* Fixed close button positioning */}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg ml-4 flex-shrink-0"
              aria-label="Close preview"
              style={{ position: "relative", zIndex: 10 }}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Emergency close button - always visible */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/10 rounded-md sm:hidden"
            aria-label="Close preview"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(95vh-120px)]">
          {/* Options Panel */}
          <div className="lg:w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              PDF Options
            </h3>

            {/* Template Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Style
              </label>
              <div className="space-y-2">
                {[
                  {
                    value: "modern",
                    label: "Modern",
                    desc: "Clean design with accent colors",
                  },
                  {
                    value: "classic",
                    label: "Classic",
                    desc: "Traditional business format",
                  },
                  {
                    value: "minimal",
                    label: "Minimal",
                    desc: "Simple and clean layout",
                  },
                ].map((template) => (
                  <label
                    key={template.value}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="template"
                      value={template.value}
                      checked={pdfOptions.template === template.value}
                      onChange={(e) =>
                        setPDFOptions({
                          ...pdfOptions,
                          template: e.target.value as any,
                        })
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {template.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {template.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Theme
              </label>
              <div className="space-y-2">
                {[
                  {
                    value: "primary",
                    label: "Primary",
                    desc: "Blue-cyan gradient theme matching platform",
                  },
                  {
                    value: "neutral",
                    label: "Neutral",
                    desc: "Professional grayscale theme",
                  },
                  {
                    value: "neutral",
                    label: "neutral",
                    desc: "Modern dark theme with bright accents",
                  },
                ].map((theme) => (
                  <label
                    key={theme.value}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={pdfOptions.theme === theme.value}
                      onChange={(e) =>
                        setPDFOptions({
                          ...pdfOptions,
                          theme: e.target.value as PDFThemeName,
                        })
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {theme.label}
                      </div>
                      <div className="text-xs text-gray-500">{theme.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <div className="flex space-x-2">
                {[
                  "#2563eb",
                  "#7c3aed",
                  "#dc2626",
                  "#059669",
                  "#d97706",
                  "#1f2937",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setPDFOptions({ ...pdfOptions, accentColor: color })
                    }
                    className={`w-8 h-8 rounded-full border-2 ${
                      pdfOptions.accentColor === color
                        ? "border-gray-800"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={pdfOptions.accentColor}
                onChange={(e) =>
                  setPDFOptions({ ...pdfOptions, accentColor: e.target.value })
                }
                className="mt-2 w-full h-8 rounded border border-gray-300"
              />
            </div>

            {/* Options */}
            <div className="mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pdfOptions.includeWatermark}
                  onChange={(e) =>
                    setPDFOptions({
                      ...pdfOptions,
                      includeWatermark: e.target.checked,
                    })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Include &quot;DRAFT&quot; watermark
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadWithOptions}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Download PDF
              </button>

              <button
                onClick={generatePreview}
                disabled={isGenerating}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Refresh Preview"}
              </button>
            </div>

            {/* Invoice Summary */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">
                Invoice Summary
              </h4>
              <div className="text-sm text-gray-600 space-y-1 bg-white">
                <div>Client: {invoice.to.name}</div>
                <div>Amount: ${invoice.total.toFixed(2)}</div>
                <div>Items: {invoice.items.length}</div>
                <div>Due: {invoice.dueDate}</div>
              </div>
            </div>
          </div>

          {/* PDF Preview with improved error handling */}
          <div className="flex-1 bg-gray-100 p-4 sm:p-6 overflow-auto">
            {isGenerating ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating PDF preview...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take a few seconds
                  </p>
                </div>
              </div>
            ) : previewError ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center text-red-500 max-w-md">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="mb-2 font-medium text-lg">Preview Error</p>
                  <p className="text-sm text-gray-600 mb-4">{previewError}</p>
                  <p className="text-xs text-gray-500 mb-4">
                    This might be due to browser security settings or PDF
                    rendering issues.
                  </p>
                  <div className="space-x-2">
                    <button
                      onClick={generatePreview}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Retry Preview
                    </button>
                    <button
                      onClick={handleDownloadWithOptions}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Download Instead
                    </button>
                  </div>
                </div>
              </div>
            ) : pdfBlobUrl || pdfDataUri ? (
              <div className="h-full min-h-[400px] relative">
                {/* Primary iframe for PDF display */}
                <iframe
                  src={pdfBlobUrl || pdfDataUri}
                  className="w-full h-full border-2 border-gray-300 rounded-lg shadow-lg"
                  title="PDF Preview"
                  onLoad={() => {
                    console.log("PDF iframe loaded successfully");
                    setPreviewError("");
                  }}
                  onError={(e) => {
                    console.error("PDF iframe failed to load:", e);
                    setPreviewError(
                      "Failed to load PDF preview. This may be due to browser security settings."
                    );
                  }}
                  style={{ minHeight: "500px" }}
                />

                {/* Alternative embed fallback */}
                {previewError && (
                  <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center p-4">
                    <div className="text-center max-w-md">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-gray-600 mb-2 font-medium">
                        Preview not available
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        {previewError}
                      </p>

                      {/* Alternative display methods */}
                      <div className="space-y-2">
                        {(pdfBlobUrl || pdfDataUri) && (
                          <a
                            href={pdfBlobUrl || pdfDataUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Open in New Tab
                          </a>
                        )}
                        <button
                          onClick={handleDownloadWithOptions}
                          className="block mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mb-4 font-medium">
                    PDF preview will appear here
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Click the button below to generate the preview
                  </p>
                  <button
                    onClick={generatePreview}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generate Preview
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDFPreviewModal;
