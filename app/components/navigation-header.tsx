"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
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
  EnvelopeIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { LogoWithText } from "./logo";
import { useTranslations } from "../lib/i18n/context";
import { LanguageSelector } from "./language-selector";

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
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { t } = useTranslations();

  const isAuthenticated = !!session;
  const isLoading = status === "loading";

  const publicNavigation: NavigationItem[] = [
    {
      name: "Home",
      href: "/",
      icon: HomeIcon,
      current: pathname === "/",
    },
    {
      name: "Features",
      href: "/features",
      icon: DocumentTextIcon,
      current: pathname?.startsWith("/features"),
    },
    {
      name: "Pricing",
      href: "/pricing",
      icon: ShieldCheckIcon,
      current: pathname?.startsWith("/pricing"),
    },
    {
      name: "Support",
      href: "/support",
      icon: EnvelopeIcon,
      current: pathname === "/support",
    },
  ];

  const dashboardNavigation: NavigationItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
      current: pathname === "/dashboard",
    },
    {
      name: "Invoices",
      href: "/dashboard/invoices",
      icon: DocumentTextIcon,
      current: pathname?.startsWith("/dashboard/invoices"),
    },
    {
      name: "Clients",
      href: "/dashboard/clients",
      icon: UserCircleIcon,
      current: pathname?.startsWith("/dashboard/clients"),
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: ChartBarIcon,
      current: pathname?.startsWith("/dashboard/reports"),
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: CogIcon,
      current: pathname?.startsWith("/dashboard/settings"),
    },
  ];

  const navigation = dashboardNavigation; // Always show dashboard nav in demo mode

  const handleContactSupport = () => {
    window.open(
      "mailto:support@xinfinitylabs.com?subject=Xinvoice Support Request",
      "_blank"
    );
  };

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

          {/* Auth and Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector variant="compact" />

            {/* Authentication-aware user menu */}
            {isAuthenticated ? (
              /* Authenticated User Menu */
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDropdownToggle("user")}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-xinfinity-primary hover:bg-white/50 transition-all duration-200"
                >
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-5 h-5 mr-2 rounded-full"
                    />
                  ) : (
                    <UserCircleIcon className="w-5 h-5 mr-2" />
                  )}
                  {session?.user?.name || "User"}
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                </motion.button>

                <AnimatePresence>
                  {openDropdown === "user" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-48 xinfinity-card rounded-lg shadow-glass overflow-hidden"
                    >
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:text-xinfinity-primary hover:bg-white/50 transition-all duration-200"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <CogIcon className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:text-red-600 hover:bg-white/50 transition-all duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Public Navigation Actions */
              <>
                {/* Contact Support Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleContactSupport}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-xinfinity-primary hover:bg-white/50 transition-all duration-200"
                  title="Contact Support - support@xinfinitylabs.com"
                >
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  Support
                </motion.button>

                {/* Loading state */}
                {isLoading ? (
                  <div className="flex items-center px-3 py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Sign In Button */}
                    <button
                      onClick={() => signIn()}
                      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-xinfinity-primary hover:bg-white/50 transition-all duration-200"
                    >
                      <UserCircleIcon className="w-4 h-4 mr-2" />
                      Sign In
                    </button>

                    {/* Get Started Button */}
                    <button
                      onClick={() => signIn()}
                      className="xinfinity-button text-sm px-4 py-2"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </>
            )}
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

              {/* Mobile Contact Support */}
              <button
                onClick={() => {
                  handleContactSupport();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:text-xinfinity-primary hover:bg-white/50 transition-all duration-200"
              >
                <EnvelopeIcon className="w-5 h-5 mr-3" />
                Contact Support
              </button>

              {/* Mobile Settings */}
              {isAuthenticated && (
                <button className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:text-xinfinity-primary hover:bg-white/50 transition-all duration-200">
                  <CogIcon className="w-5 h-5 mr-3" />
                  {t("nav.companySettings")}
                </button>
              )}

              {/* Mobile Authentication Buttons */}
              <div className="border-t border-white/20 pt-4 mt-4">
                {isLoading ? (
                  <div className="flex items-center justify-center px-4 py-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading...</span>
                  </div>
                ) : isAuthenticated ? (
                  <>
                    {/* Mobile User Info */}
                    <div className="flex items-center px-4 py-3 rounded-lg bg-white/20 mb-2">
                      <UserCircleIcon className="w-5 h-5 mr-3 text-xinfinity-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {session?.user?.name || session?.user?.email}
                        </p>
                        <p className="text-xs text-gray-600">{session?.user?.email}</p>
                      </div>
                    </div>
                    
                    {/* Mobile Sign Out Button */}
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/" });
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    {/* Mobile Sign In Button */}
                    <button
                      onClick={() => {
                        signIn();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:text-xinfinity-primary hover:bg-white/50 transition-all duration-200 mb-2"
                    >
                      <UserCircleIcon className="w-5 h-5 mr-3" />
                      Sign In
                    </button>

                    {/* Mobile Get Started Button */}
                    <button
                      onClick={() => {
                        signIn();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full xinfinity-button text-sm px-4 py-3 text-center"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
