/**
 * Language Selector Component
 * Allows users to change the platform language
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, LanguageIcon } from "@heroicons/react/24/outline";
import { Locale } from "../../packages/core/schemas";
import { useLocale } from "../lib/i18n/context";

const localeOptions: { value: Locale; label: string; flag: string }[] = [
  { value: "en-US", label: "English (US)", flag: "🇺🇸" },
  { value: "en-GB", label: "English (UK)", flag: "🇬🇧" },
  { value: "fr-FR", label: "Français", flag: "🇫🇷" },
  { value: "fr-CA", label: "Français (Canada)", flag: "🇨🇦" },
  { value: "de-DE", label: "Deutsch", flag: "🇩🇪" },
  { value: "es-ES", label: "Español", flag: "🇪🇸" },
  { value: "ar-DZ", label: "العربية (الجزائر)", flag: "🇩🇿" },
  { value: "ar-MA", label: "العربية (المغرب)", flag: "🇲🇦" },
  { value: "ar-SA", label: "العربية (السعودية)", flag: "🇸🇦" },
  { value: "ar-AE", label: "العربية (الإمارات)", flag: "🇦🇪" },
];

interface LanguageSelectorProps {
  className?: string;
  variant?: "default" | "compact";
  onLocaleChange?: (locale: Locale) => void;
  currentLocale?: Locale;
}

export function LanguageSelector({
  className = "",
  variant = "default",
  onLocaleChange,
  currentLocale: propCurrentLocale,
}: LanguageSelectorProps) {
  const { currentLocale: contextLocale, setLocale, isRTL } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Use prop locale if provided, otherwise use context locale
  const currentLocale = propCurrentLocale || contextLocale;
  const currentOption =
    localeOptions.find((option) => option.value === currentLocale) ||
    localeOptions[0];

  // Handle hydration to prevent SSR/client mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSelect = (locale: Locale) => {
    if (onLocaleChange) {
      onLocaleChange(locale);
    } else {
      setLocale(locale);
    }
    setIsOpen(false);
  };

  if (variant === "compact") {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-xinfinity-primary/20 transition-colors"
        >
          <span className="text-lg">
            {isHydrated ? currentOption.flag : "🇺🇸"}
          </span>
          <span className="hidden sm:inline">
            {isHydrated ? currentOption.label : "English (US)"}
          </span>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
                isRTL ? "right-0" : "left-0"
              }`}
            >
              <div className="py-2 max-h-60 overflow-y-auto">
                {localeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      option.value === currentLocale
                        ? "bg-xinfinity-primary/10 text-xinfinity-primary"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="text-lg">{option.flag}</span>
                    <span>{option.label}</span>
                    {option.value === currentLocale && (
                      <div className="ml-auto w-2 h-2 bg-xinfinity-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        <LanguageIcon className="w-4 h-4 inline mr-2" />
        Platform Language
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-xinfinity-primary/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">
              {isHydrated ? currentOption.flag : "🇺🇸"}
            </span>
            <div className="text-left">
              <div className="font-medium text-gray-900">
                {isHydrated ? currentOption.label : "English (US)"}
              </div>
              <div className="text-xs text-gray-500">
                {isHydrated ? currentOption.value : "en-US"}
              </div>
            </div>
          </div>
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            >
              <div className="py-2 max-h-60 overflow-y-auto">
                {localeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      option.value === currentLocale
                        ? "bg-xinfinity-primary/10"
                        : ""
                    }`}
                  >
                    <span className="text-xl">{option.flag}</span>
                    <div className="text-left flex-1">
                      <div
                        className={`font-medium ${
                          option.value === currentLocale
                            ? "text-xinfinity-primary"
                            : "text-gray-900"
                        }`}
                      >
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {option.value}
                      </div>
                    </div>
                    {option.value === currentLocale && (
                      <div className="w-2 h-2 bg-xinfinity-primary rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
