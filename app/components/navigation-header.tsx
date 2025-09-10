"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon,
  CogIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { LogoWithText } from "./logo";
import { useTranslations } from "../lib/i18n/context";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current?: boolean;
  children?: NavigationItem[];
}

export function NavigationHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { t } = useTranslations();

  const navigation: NavigationItem[] = [
    {
      name: t('nav.home'),
      href: "/",
      icon: HomeIcon,
      current: pathname === "/",
    },
    {
      name: t('nav.newInvoice'),
      href: "/new/invoice",
      icon: DocumentTextIcon,
      current:
        pathname?.startsWith("/new/invoice") || pathname?.startsWith("/invoice"),
      children: [
        {
          name: t('nav.newInvoice'),
          href: "/new/invoice",
          icon: DocumentTextIcon,
        },
        {
          name: t('nav.batchInvoice'),
          href: "/new/invoice-batch",
          icon: DocumentTextIcon,
        },
      ],
    },
    {
      name: t('nav.newNDA'),
      href: "/new/nda",
      icon: ShieldCheckIcon,
      current: pathname?.startsWith("/new/nda") || pathname?.startsWith("/nda"),
      children: [
        { name: t('nav.newNDA'), href: "/new/nda", icon: ShieldCheckIcon },
        {
          name: "AI Assisted",
          href: "/nda/ai-assisted",
          icon: ShieldCheckIcon,
        },
        { name: "Editor", href: "/nda/editor", icon: ShieldCheckIcon },
      ],
    },
    {
      name: t('nav.multilingualDemo'),
      href: "/demo/multilang-pdf",
      icon: CogIcon,
      current: pathname?.startsWith("/demo/multilang"),
    },
    // {
    //   name: 'Recent',
    //   href: '/recent',
    //   icon: ClockIcon,
    //   current: pathname === '/recent'
    // }
  ];

  const handleDropdownToggle = (itemName: string) => {
    setOpenDropdown(openDropdown === itemName ? null : itemName);
  };

  return (
    <header className="sticky top-0 z-50 w-full xinfinity-nav animate-slideDown">
      <div className="max-w-fibonacci mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/" className="flex items-center">
              <LogoWithText size="md" animated={true} />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.children ? (
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDropdownToggle(item.name)}
                      className={`
                        flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          item.current
                            ? "xinfinity-gradient text-white shadow-xinfinity"
                            : "text-gray-700 hover:text-xinfinity-primary hover:bg-white/50"
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                      <ChevronDownIcon
                        className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {openDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-48 xinfinity-card rounded-lg shadow-glass overflow-hidden"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:text-xinfinity-primary hover:bg-white/50 transition-all duration-200"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <child.icon className="w-4 h-4 mr-3" />
                              {child.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      className={`
                        flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          item.current
                            ? "xinfinity-gradient text-white shadow-xinfinity"
                            : "text-gray-700 hover:text-xinfinity-primary hover:bg-white/50"
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  </motion.div>
                )}
              </div>
            ))}
          </nav>

          {/* Settings Button */}
          <div className="hidden lg:flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg text-gray-700 hover:text-xinfinity-primary hover:bg-white/50 transition-all duration-200"
              aria-label="Settings"
            >
              <CogIcon className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-xinfinity-primary hover:bg-white/50 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-white/20"
          >
            <div className="px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => handleDropdownToggle(item.name)}
                        className={`
                          flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                          ${
                            item.current
                              ? "xinfinity-gradient text-white shadow-xinfinity"
                              : "text-gray-700 hover:text-xinfinity-primary hover:bg-white/50"
                          }
                        `}
                      >
                        <div className="flex items-center">
                          <item.icon className="w-5 h-5 mr-3" />
                          {item.name}
                        </div>
                        <ChevronDownIcon
                          className={`w-4 h-4 transition-transform duration-200 ${
                            openDropdown === item.name ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {openDropdown === item.name && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2 ml-4 space-y-1"
                          >
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className="flex items-center px-4 py-2 rounded-lg text-sm text-gray-600 hover:text-xinfinity-primary hover:bg-white/50 transition-all duration-200"
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setOpenDropdown(null);
                                }}
                              >
                                <child.icon className="w-4 h-4 mr-3" />
                                {child.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`
                        flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          item.current
                            ? "xinfinity-gradient text-white shadow-xinfinity"
                            : "text-gray-700 hover:text-xinfinity-primary hover:bg-white/50"
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile Settings */}
              <button className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:text-xinfinity-primary hover:bg-white/50 transition-all duration-200">
                <CogIcon className="w-5 h-5 mr-3" />
                {t('nav.companySettings')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
