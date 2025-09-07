'use client'

import React, { forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { CalendarIcon } from '@heroicons/react/24/outline'

interface DateInputProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  error?: string
  className?: string
  required?: boolean
  label?: string
}

const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, onChange, placeholder, className, error }, ref) => (
  <div className="relative">
    <input
      ref={ref}
      value={value}
      onClick={onClick}
      onChange={onChange}
      placeholder={placeholder}
      className={`
        xinfinity-input w-full pr-10
        ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
        ${className || ''}
      `}
      readOnly={false}
    />
    <CalendarIcon 
      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
    />
  </div>
))

CustomInput.displayName = 'CustomInput'

export function DateInput({ 
  value, 
  onChange, 
  placeholder = "Select date", 
  error,
  className,
  required = false,
  label
}: DateInputProps) {
  const selectedDate = value ? new Date(value) : null

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Format as YYYY-MM-DD
      const formatted = date.toISOString().split('T')[0]
      onChange(formatted)
    } else {
      onChange('')
    }
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        customInput={<CustomInput error={error} className={className} placeholder={placeholder} />}
        dateFormat="yyyy-MM-dd"
        placeholderText={placeholder}
        showPopperArrow={false}
        popperClassName="z-50"
        popperPlacement="bottom-start"
        calendarClassName="shadow-lg border border-gray-200 rounded-lg"
        dayClassName={(date) => 
          "hover:bg-xinfinity-primary hover:text-white rounded-md transition-colors cursor-pointer"
        }
        wrapperClassName="w-full"
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
