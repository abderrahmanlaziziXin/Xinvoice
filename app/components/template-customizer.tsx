'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { PaintBrushIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

export interface TemplateSettings {
  primaryColor: string
  secondaryColor: string
  logo?: string
  fontFamily: 'helvetica' | 'times' | 'courier'
  theme: 'professional' | 'modern' | 'minimal'
}

interface TemplateCustomizerProps {
  isOpen: boolean
  onClose: () => void
  settings: TemplateSettings
  onSettingsChange: (settings: TemplateSettings) => void
}

export function TemplateCustomizer({ isOpen, onClose, settings, onSettingsChange }: TemplateCustomizerProps) {
  const [localSettings, setLocalSettings] = useState<TemplateSettings>(settings)

  const handleSave = () => {
    onSettingsChange(localSettings)
    onClose()
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoData = e.target?.result as string
        setLocalSettings(prev => ({ ...prev, logo: logoData }))
      }
      reader.readAsDataURL(file)
    }
  }

  const colorPresets = [
    { name: 'Professional Blue', primary: '#2563eb', secondary: '#1e40af' },
    { name: 'Corporate Gray', primary: '#374151', secondary: '#6b7280' },
    { name: 'Modern Purple', primary: '#7c3aed', secondary: '#5b21b6' },
    { name: 'Success Green', primary: '#059669', secondary: '#047857' },
    { name: 'Elegant Black', primary: '#1f2937', secondary: '#374151' },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center">
            <PaintBrushIcon className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Template Customizer</h3>
              <p className="text-sm text-gray-600">Customize your document style</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Color Presets */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Color Presets</h4>
            <div className="grid grid-cols-1 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setLocalSettings(prev => ({
                    ...prev,
                    primaryColor: preset.primary,
                    secondaryColor: preset.secondary
                  }))}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all hover:border-gray-300 ${
                    localSettings.primaryColor === preset.primary
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex mr-3">
                    <div 
                      className="w-6 h-6 rounded-l-md border border-gray-300"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div 
                      className="w-6 h-6 rounded-r-md border border-gray-300"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-sm font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Custom Colors</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Primary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={localSettings.primaryColor}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localSettings.primaryColor}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    placeholder="#2563eb"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Secondary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={localSettings.secondaryColor}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={localSettings.secondaryColor}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                    placeholder="#1e40af"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Logo</h4>
            <div className="space-y-3">
              {localSettings.logo && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Image 
                    src={localSettings.logo} 
                    alt="Logo preview" 
                    width={64}
                    height={64}
                    className="object-contain rounded"
                  />
                  <button
                    onClick={() => setLocalSettings(prev => ({ ...prev, logo: undefined }))}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
              <label className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                <PhotoIcon className="w-6 h-6 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Upload Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Font Family */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Font</h4>
            <select
              value={localSettings.fontFamily}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, fontFamily: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="helvetica">Helvetica (Modern)</option>
              <option value="times">Times (Traditional)</option>
              <option value="courier">Courier (Monospace)</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Theme</h4>
            <div className="space-y-2">
              {(['professional', 'modern', 'minimal'] as const).map((theme) => (
                <label key={theme} className="flex items-center">
                  <input
                    type="radio"
                    value={theme}
                    checked={localSettings.theme === theme}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, theme: e.target.value as any }))}
                    className="mr-3"
                  />
                  <span className="text-sm capitalize">{theme}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </motion.div>
    </div>
  )
}
