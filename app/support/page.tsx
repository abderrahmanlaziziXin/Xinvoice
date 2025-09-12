"use client";

import { motion } from "framer-motion";
import {
  EnvelopeIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CogIcon,
  SparklesIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function SupportPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("support@xinfinitylabs.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      window.open("mailto:support@xinfinitylabs.com", "_blank");
    }
  };

  const handleCustomSolution = () => {
    const subject = "Custom Solution Inquiry";
    const body =
      "Hi! I'm interested in a custom document generation solution for my business. Please contact me to discuss my requirements.";
    window.open(
      `mailto:support@xinfinitylabs.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="p-4 bg-blue-100 rounded-2xl"
            >
              <EnvelopeIcon className="w-12 h-12 text-blue-600" />
            </motion.div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Need Help?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We&apos;re here to support you! Get in touch with our team for any
            questions, custom solutions, bug reports, or feature requests.
          </p>
        </motion.div>

        {/* Custom Solutions Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-12"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex justify-center mb-4"
            >
              <SparklesIcon className="w-12 h-12 text-yellow-300" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-4">Need Something Custom?</h2>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              We specialize in creating tailored document generation solutions
              for businesses. Whether you need custom templates, specific
              integrations, or entirely new document types, we can build it for
              you.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <CogIcon className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Custom Templates</h3>
                <p className="text-sm text-purple-100">
                  Branded templates matching your business identity
                </p>
              </div>
              <div className="text-center">
                <GlobeAltIcon className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">API Integration</h3>
                <p className="text-sm text-purple-100">
                  Connect with your existing systems and workflows
                </p>
              </div>
              <div className="text-center">
                <DocumentTextIcon className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">New Document Types</h3>
                <p className="text-sm text-purple-100">
                  Beyond invoices - contracts, reports, certificates
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCustomSolution}
              className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors duration-200"
            >
              Discuss Your Custom Solution
            </motion.button>
          </div>
        </motion.div>

        {/* Support Options */}
        <div className="grid gap-6 mb-12">
          {/* General Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  General Support
                </h3>
                <p className="text-gray-600 mb-4">
                  Get help via email for general inquiries and technical support
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="text-sm text-gray-500">
                    📧 support@xinfinitylabs.com
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      window.open(
                        "mailto:support@xinfinitylabs.com?subject=Xinvoice Support Request",
                        "_blank"
                      )
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Email Us
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bug Reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-red-100 rounded-xl">
                  <DocumentTextIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Bug Reports
                </h3>
                <p className="text-gray-600 mb-4">
                  Report issues or unexpected behavior in the application
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="text-sm text-gray-500">
                    📧 support@xinfinitylabs.com
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      window.open(
                        "mailto:support@xinfinitylabs.com?subject=Xinvoice Bug Report",
                        "_blank"
                      )
                    }
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Report Bug
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-100 rounded-xl">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Feature Requests
                </h3>
                <p className="text-gray-600 mb-4">
                  Suggest new features or improvements to Xinvoice
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="text-sm text-gray-500">
                    📧 support@xinfinitylabs.com
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      window.open(
                        "mailto:support@xinfinitylabs.com?subject=Xinvoice Feature Request",
                        "_blank"
                      )
                    }
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Request Feature
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center mb-12"
        >
          <h2 className="text-2xl font-bold mb-4">Quick Contact</h2>
          <p className="text-blue-100 mb-6">
            Copy our email address for quick access
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyEmail}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
          >
            <EnvelopeIcon className="w-5 h-5" />
            <span>{copied ? "Copied!" : "Copy Email Address"}</span>
          </motion.button>
          <div className="mt-4 text-sm text-blue-100">
            support@xinfinitylabs.com
          </div>
        </motion.div>

        {/* Response Time Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">
                Response Time
              </h3>
              <p className="text-yellow-700">
                We typically respond to all inquiries within 24 hours during
                business days. For urgent issues, please mention
                &quot;URGENT&quot; in your subject line.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
