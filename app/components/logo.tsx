'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  variant?: 'default' | 'white' | 'mono'
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
}

export function Logo({ 
  className = '', 
  size = 'md', 
  animated = true,
  variant = 'default'
}: LogoProps) {
  const getGradientColors = () => {
    switch (variant) {
      case 'white':
        return {
          gradMain: 'from-white to-gray-100',
          gradReverse: 'from-gray-100 to-white'
        }
      case 'mono':
        return {
          gradMain: 'from-gray-800 to-gray-600',
          gradReverse: 'from-gray-600 to-gray-800'
        }
      default:
        return {
          gradMain: 'from-xinfinity-blue-900 to-xinfinity-blue-800',
          gradReverse: 'from-xinfinity-cyan-500 to-xinfinity-blue-500'
        }
    }
  }

  const colors = getGradientColors()

  const logoVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.05, 
      rotate: [0, -2, 2, 0],
      transition: { 
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    },
    pulse: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    }
  }

  const pathVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 2,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
        delay: 0.2
      }
    }
  }

  return (
    <motion.div
      className={`${sizeMap[size]} ${className} relative`}
      variants={logoVariants}
      initial="initial"
      animate={animated ? 'pulse' : 'initial'}
      whileHover="hover"
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 261.8 261.8" 
        preserveAspectRatio="xMidYMid meet" 
        xmlns="http://www.w3.org/2000/svg" 
        role="img" 
        aria-label="Xinfinity ribbon logo"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id={`gradMain-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--xinfinity-blue-900)" />
            <stop offset="100%" stopColor="var(--xinfinity-blue-800)" />
          </linearGradient>
          <linearGradient id={`gradReverse-${variant}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--xinfinity-cyan-500)" />
            <stop offset="100%" stopColor="var(--xinfinity-blue-500)" />
          </linearGradient>
          <filter id={`glowMain-${variant}`} filterUnits="userSpaceOnUse" x="-80" y="-80" width="420" height="322" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="var(--xinfinity-blue-800)" />
          </filter>
          <filter id={`glowReverse-${variant}`} filterUnits="userSpaceOnUse" x="-80" y="-80" width="420" height="322" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="var(--xinfinity-blue-500)" />
          </filter>
        </defs>
        <g transform="translate(-8,22) scale(1.28)">
          <motion.path 
            d="M80,75 Q115,20 130,75 T180,75" 
            fill="none" 
            stroke={`url(#gradMain-${variant})`}
            strokeWidth="26" 
            strokeLinecap="round"
            filter={`url(#glowMain-${variant})`}
            variants={animated ? pathVariants : undefined}
            initial={animated ? 'initial' : undefined}
            animate={animated ? 'animate' : undefined}
          />
          <motion.path 
            d="M80,87 Q115,142 130,87 T180,87" 
            fill="none" 
            stroke={`url(#gradReverse-${variant})`}
            strokeWidth="26" 
            strokeLinecap="round"
            filter={`url(#glowReverse-${variant})`}
            variants={animated ? pathVariants : undefined}
            initial={animated ? 'initial' : undefined}
            animate={animated ? 'animate' : undefined}
          />
        </g>
      </svg>
    </motion.div>
  )
}

// Brand text component that pairs with the logo
export function BrandText({ 
  className = '', 
  size = 'md',
  variant = 'default'
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white' | 'mono'
}) {
  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-xl font-bold',
    lg: 'text-2xl font-bold',
    xl: 'text-3xl font-bold'
  }

  const variantClasses = {
    default: 'xinfinity-text-gradient',
    white: 'text-white',
    mono: 'text-gray-800'
  }

  return (
    <span className={`${sizeClasses[size]} ${variantClasses[variant]} ${className} font-sans tracking-tight`}>
      Xinfinity
    </span>
  )
}

// Combined logo and text component
export function LogoWithText({ 
  className = '', 
  size = 'md',
  variant = 'default',
  animated = true
}: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={size} variant={variant} animated={animated} />
      <BrandText size={size} variant={variant} />
    </div>
  )
}
