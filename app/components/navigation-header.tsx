'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  CogIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  current?: boolean
  children?: NavigationItem[]
}

export function NavigationHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const navigation: NavigationItem[] = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
      current: pathname === '/'
    },
    {
      name: 'Invoice',
      href: '/invoice',
      icon: DocumentTextIcon,
      current: pathname.startsWith('/new/invoice'),
      children: [
        { name: 'Single Invoice', href: '/invoice/single', icon: DocumentTextIcon },
        { name: 'Batch Processing', href: '/invoice/batch', icon: DocumentTextIcon }
      ]
    },
    {
      name: 'NDA',
      href: '/nda/new',
      icon: ShieldCheckIcon,
      current: pathname.startsWith('/nda')
    },
    {
      name: 'History',
      href: '/history',
      icon: ClockIcon,
      current: pathname === '/history'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: CogIcon,
      current: pathname === '/settings'
    }
  ]

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const handleNavigation = (href: string, hasChildren?: boolean) => {
    if (hasChildren) return
    
    // Map new routes to existing ones during transition
    const routeMap: { [key: string]: string } = {
      '/invoice/single': '/new/invoice',
      '/invoice/batch': '/new/invoice-batch',
      '/nda/new': '/new/nda',
      '/history': '/',
      '/settings': '/'
    }

    const targetRoute = routeMap[href] || href
    router.push(targetRoute)
    setIsMobileMenuOpen(false)
    setOpenDropdown(null)
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur-sm opacity-30"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Only-AI
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.children ? (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          item.current
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.name}
                        <ChevronDownIcon 
                          className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                            openDropdown === item.name ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      
                      <AnimatePresence>
                        {openDropdown === item.name && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                          >
                            {item.children.map((child) => (
                              <button
                                key={child.name}
                                onClick={() => handleNavigation(child.href)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <child.icon className="w-4 h-4 mr-2" />
                                {child.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        item.current
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </button>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-3 space-y-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.children ? (
                      <div>
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                            item.current
                              ? 'bg-purple-100 text-purple-700'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center">
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.name}
                          </div>
                          <ChevronDownIcon 
                            className={`w-4 h-4 transition-transform duration-200 ${
                              openDropdown === item.name ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>
                        
                        <AnimatePresence>
                          {openDropdown === item.name && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-1 ml-4 space-y-1"
                            >
                              {item.children.map((child) => (
                                <button
                                  key={child.name}
                                  onClick={() => handleNavigation(child.href)}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center"
                                >
                                  <child.icon className="w-4 h-4 mr-2" />
                                  {child.name}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleNavigation(item.href)}
                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                          item.current
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Click outside to close dropdowns */}
      {(openDropdown || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setOpenDropdown(null)
            setIsMobileMenuOpen(false)
          }}
        />
      )}
    </>
  )
}
