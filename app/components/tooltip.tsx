'use client'

import { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipProps {
  content: string | ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top', 
  delay = 500,
  className = '' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2',
    left: 'left-full top-1/2 transform -translate-y-1/2',
    right: 'right-full top-1/2 transform -translate-y-1/2'
  }

  const arrowBorders = {
    top: 'border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    bottom: 'border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
    right: 'border-t-transparent border-b-transparent border-l-transparent border-r-gray-800'
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => {
        setTimeout(() => setIsVisible(true), delay)
      }}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionClasses[position]}`}
          >
            <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-xl max-w-xs whitespace-nowrap">
              {content}
              {/* Arrow */}
              <div 
                className={`absolute w-0 h-0 border-4 ${arrowClasses[position]} ${arrowBorders[position]}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Tooltip
