"use client";

import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  GlobeAltIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const handleContactSupport = () => {
    window.open(
      "mailto:support@xinfinitylabs.com?subject=Xinvoice Support Request",
      "_blank"
    );
  };

  return (
    <footer className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Xinvoice</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              AI-powered document generation platform with advanced features,
              structured prompts, and multi-document support. We also provide
              custom solutions tailored to your business needs.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span>Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>by Xinfinity Labs</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Quick Links</h4>
            <div className="space-y-2">
              <a
                href="/demo/multilang-pdf"
                className="block text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
              >
                Multilingual Demo
              </a>
              <a
                href="/support"
                className="block text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
              >
                Support & Contact
              </a>
              <a
                href="/"
                className="block text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
              >
                Home
              </a>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Support</h4>
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContactSupport}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
              >
                <EnvelopeIcon className="w-4 h-4" />
                <span>support@xinfinitylabs.com</span>
              </motion.button>
              <p className="text-xs text-gray-500">
                We typically respond within 24 hours
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              © {currentYear} Xinfinity Labs. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
