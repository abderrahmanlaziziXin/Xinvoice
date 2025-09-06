'use client'

import { useState, useEffect } from 'react'
import { useUserContext } from '../lib/user-context'
import { UserContext, Currency, Locale } from '../../packages/core/schemas'
import { getPopularCurrencies, getRegionalCurrencies, getCurrencySymbol, getSuggestedCurrency } from '../lib/currency'

interface CompanySettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function CompanySettings({ isOpen, onClose }: CompanySettingsProps) {
  const { context, updateContext } = useUserContext()
  const [formData, setFormData] = useState<Partial<UserContext>>({})

  useEffect(() => {
    if (isOpen) {
      setFormData(context || {})
    }
  }, [isOpen, context])

  const handleSave = () => {
    updateContext(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          onClick={onClose} 
        />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">
              Company Settings
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
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
                  value={formData.companyEmail || ''}
                  onChange={(e) => setFormData({...formData, companyEmail: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="billing@company.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Address
                </label>
                <textarea
                  value={formData.companyAddress || ''}
                  onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
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
                  value={formData.companyPhone || ''}
                  onChange={(e) => setFormData({...formData, companyPhone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency
                </label>
                <select
                  value={formData.defaultCurrency || 'USD'}
                  onChange={(e) => setFormData({...formData, defaultCurrency: e.target.value as Currency})}
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
                    {getRegionalCurrencies('africa').map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol}) - {currency.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="European Currencies">
                    {getRegionalCurrencies('europe').map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol}) - {currency.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Locale
                </label>
                <select
                  value={formData.defaultLocale || 'en-US'}
                  onChange={(e) => {
                    const newLocale = e.target.value as Locale
                    const suggestedCurrency = getSuggestedCurrency(newLocale)
                    setFormData({
                      ...formData, 
                      defaultLocale: newLocale,
                      // Auto-suggest currency based on locale if not set
                      defaultCurrency: formData.defaultCurrency || suggestedCurrency
                    })
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <optgroup label="English">
                    <option value="en-US">English (United States)</option>
                    <option value="en-GB">English (United Kingdom)</option>
                    <option value="en-CA">English (Canada)</option>
                    <option value="en-AU">English (Australia)</option>
                  </optgroup>
                  <optgroup label="European">
                    <option value="fr-FR">Français (France)</option>
                    <option value="de-DE">Deutsch (Deutschland)</option>
                    <option value="es-ES">Español (España)</option>
                    <option value="it-IT">Italiano (Italia)</option>
                    <option value="pt-PT">Português (Portugal)</option>
                    <option value="nl-NL">Nederlands (Nederland)</option>
                  </optgroup>
                  <optgroup label="African & Middle Eastern">
                    <option value="ar-DZ">العربية (الجزائر)</option>
                    <option value="ar-MA">العربية (المغرب)</option>
                    <option value="ar-TN">العربية (تونس)</option>
                    <option value="ar-EG">العربية (مصر)</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="zh-CN">中文 (中国)</option>
                    <option value="ja-JP">日本語 (日本)</option>
                    <option value="hi-IN">हिन्दी (भारत)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={((formData.defaultTaxRate || 0.08) * 100).toFixed(1)}
                  onChange={(e) => setFormData({...formData, defaultTaxRate: parseFloat(e.target.value) / 100})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jurisdiction
                </label>
                <input
                  type="text"
                  value={formData.jurisdiction || ''}
                  onChange={(e) => setFormData({...formData, jurisdiction: e.target.value})}
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
                  value={formData.taxNumber || ''}
                  onChange={(e) => setFormData({...formData, taxNumber: e.target.value})}
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
                  value={formData.website || ''}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.company.com"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Payment Terms
                </label>
                <textarea
                  value={formData.defaultTerms || ''}
                  onChange={(e) => setFormData({...formData, defaultTerms: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Payment due within 30 days of invoice date."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleSave}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
