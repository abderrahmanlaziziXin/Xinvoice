"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SparklesIcon,
  LightBulbIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAIInvoiceItems } from "../hooks/use-ai-invoice-items";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxRate: number;
}

interface AIInvoiceItemsGeneratorProps {
  onItemsGenerated: (items: InvoiceItem[]) => void;
  currency?: string;
  defaultTaxRate?: number;
  className?: string;
}

const examplePrompts = [
  "Website design and development project",
  "Monthly SEO services for 6 months",
  "Logo design with 3 concepts and revisions",
  "Social media management package",
  "E-commerce store setup and configuration",
  "Content writing for blog posts",
  "Consultation services for digital marketing",
  "Mobile app UI/UX design",
];

export default function AIInvoiceItemsGenerator({
  onItemsGenerated,
  currency = "USD",
  defaultTaxRate = 0.08,
  className = "",
}: AIInvoiceItemsGeneratorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [description, setDescription] = useState("");
  const { generateItems, isGenerating } = useAIInvoiceItems();

  const handleGenerate = async () => {
    if (!description.trim()) return;

    const items = await generateItems({
      description: description.trim(),
      currency,
      defaultTaxRate,
    });

    if (items.length > 0) {
      onItemsGenerated(items);
      setDescription("");
      setIsExpanded(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setDescription(example);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI Generator Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
          isExpanded
            ? "border-purple-300 bg-purple-50 text-purple-700"
            : "border-gray-300 bg-gray-50 text-gray-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <SparklesIcon className="w-5 h-5" />
        <span className="font-medium">
          {isExpanded ? "Hide AI Assistant" : "Generate Items with AI"}
        </span>
        {isExpanded && <XMarkIcon className="w-5 h-5" />}
      </motion.button>

      {/* AI Generator Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <SparklesIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    AI Invoice Assistant
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Describe your products or services and I'll generate
                    professional invoice items with realistic pricing.
                  </p>
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe what you're invoicing for:
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Website redesign project with responsive design, SEO optimization, and 3 rounds of revisions..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={isGenerating}
                  />
                </div>

                {/* Example Prompts */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <LightBulbIcon className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Try these examples:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.slice(0, 4).map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example)}
                        className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-purple-300 hover:bg-purple-50 transition-colors"
                        disabled={isGenerating}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={handleGenerate}
                    disabled={!description.trim() || isGenerating}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      !description.trim() || isGenerating
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl"
                    }`}
                    whileHover={
                      !description.trim() || isGenerating ? {} : { scale: 1.02 }
                    }
                    whileTap={
                      !description.trim() || isGenerating ? {} : { scale: 0.98 }
                    }
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4" />
                        <span>Generate Items</span>
                      </>
                    )}
                  </motion.button>

                  <button
                    onClick={() => {
                      setIsExpanded(false);
                      setDescription("");
                    }}
                    className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                    disabled={isGenerating}
                  >
                    Cancel
                  </button>
                </div>

                {/* Info */}
                <div className="text-xs text-gray-500 bg-white/50 rounded-lg p-3">
                  <strong>💡 Tip:</strong> Be specific about quantities,
                  timeframes, and requirements for better results. The AI will
                  generate items with realistic pricing in {currency}.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
