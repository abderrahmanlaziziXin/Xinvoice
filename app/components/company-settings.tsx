"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useUserContext } from "../lib/user-context";
import { UserContext, Currency, Locale } from "../../packages/core/schemas";
import {
  getPopularCurrencies,
  getRegionalCurrencies,
  getCurrencySymbol,
  getSuggestedCurrency,
} from "../lib/currency";
import {
  usePersistedUserSettings,
  usePersistedCurrency,
  usePersistedLocale,
} from "../hooks/use-persisted-settings";
import { LanguageSelector } from "./language-selector";

interface CompanySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompanySettings({ isOpen, onClose }: CompanySettingsProps) {
  const { context, updateContext } = useUserContext();
  const { settings, setSettings } = usePersistedUserSettings();
  const [lastUsedCurrency, setLastUsedCurrency] = usePersistedCurrency();
  const [lastUsedLocale, setLastUsedLocale] = usePersistedLocale();
  const [formData, setFormData] = useState<Partial<UserContext>>({});

  useEffect(() => {
    if (isOpen) {
      // Merge persisted settings with context
      const mergedData = {
        ...context,
        ...settings,
        defaultCurrency:
          (settings.defaultCurrency as Currency) ||
          (lastUsedCurrency as Currency),
        defaultLocale:
          (settings.defaultLocale as Locale) || (lastUsedLocale as Locale),
      };
      setFormData(mergedData);
    }
  }, [isOpen, context, settings, lastUsedCurrency, lastUsedLocale]);

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSave = () => {
    // Save to both context and localStorage
    updateContext(formData);
    setSettings({
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
      companyEmail: formData.companyEmail,
      companyPhone: formData.companyPhone,
      defaultCurrency: formData.defaultCurrency,
      defaultLocale: formData.defaultLocale,
      defaultTaxRate: formData.defaultTaxRate,
      logoUrl: formData.logoUrl,
      website: formData.website,
      taxNumber: formData.taxNumber,
      bankDetails: formData.bankDetails,
    });

    // Update last used preferences
    if (formData.defaultCurrency) {
      setLastUsedCurrency(formData.defaultCurrency);
    }
    if (formData.defaultLocale) {
      setLastUsedLocale(formData.defaultLocale);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header - Fixed */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-xl font-bold text-gray-900">
              Company Settings
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Form - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Company Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Email
                </label>
                <input
                  type="email"
                  value={formData.companyEmail || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, companyEmail: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="billing@company.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Address
                </label>
                <textarea
                  value={formData.companyAddress || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, companyAddress: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Business St, City, State, ZIP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Phone
                </label>
                <input
                  type="tel"
                  value={formData.companyPhone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, companyPhone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency
                </label>
                <select
                  value={formData.defaultCurrency || "USD"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultCurrency: e.target.value as Currency,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <optgroup label="Popular Currencies">
                    {getPopularCurrencies().map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol}) - {currency.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="African Currencies">
                    {getRegionalCurrencies("africa").map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol}) - {currency.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="European Currencies">
                    {getRegionalCurrencies("europe").map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol}) - {currency.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <LanguageSelector
                onLocaleChange={(newLocale) => {
                  const suggestedCurrency = getSuggestedCurrency(newLocale);
                  setFormData({
                    ...formData,
                    defaultLocale: newLocale,
                    // Auto-suggest currency based on locale if not set
                    defaultCurrency:
                      formData.defaultCurrency || suggestedCurrency,
                  });
                }}
                currentLocale={formData.defaultLocale || "en-US"}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={((formData.defaultTaxRate ?? 0) * 100).toFixed(1)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultTaxRate: parseFloat(e.target.value) / 100,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jurisdiction
                </label>
                <input
                  type="text"
                  value={formData.jurisdiction || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, jurisdiction: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="New York, USA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Number / VAT ID
                </label>
                <input
                  type="text"
                  value={formData.taxNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, taxNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VAT123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.company.com"
                />
              </div>

              {/* Logo Upload Section */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="space-y-3">
                  {formData.logoUrl && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <Image
                        src={formData.logoUrl}
                        alt="Company logo preview"
                        width={64}
                        height={64}
                        className="object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: undefined })}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove Logo
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                    <svg className="w-6 h-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const logoData = event.target?.result as string;
                            setFormData({ ...formData, logoUrl: logoData });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {!formData.logoUrl && (
                    <p className="text-xs text-gray-500">
                      Upload your company logo to personalize invoices and documents. Recommended size: 200x200px or smaller.
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Payment Terms
                </label>
                <textarea
                  value={formData.defaultTerms || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultTerms: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Payment due within 30 days of invoice date."
                />
              </div>
            </div>
          </div>

          {/* Footer - Sticky */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-xl">
            <button
              type="button"
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              onClick={handleSave}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
