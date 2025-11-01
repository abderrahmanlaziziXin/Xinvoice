"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  PrinterIcon, 
  ArrowDownTrayIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: {
    name: string;
    email?: string;
    address?: string;
  };
  user: {
    name?: string;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
  };
  date: string;
  dueDate: string;
  status: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
}

export default function PublicInvoicePage() {
  const params = useParams();
  const token = params.token as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchInvoice();
    }
  }, [token]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoice/view/${token}`);
      if (response.ok) {
        const data = await response.json();
        setInvoice(data.invoice);
      } else {
        setError('Invoice not found or access denied');
      }
    } catch (err) {
      setError('Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/invoice/view/${token}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice?.invoiceNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  const handlePayNow = async () => {
    if (invoice?.status === 'PAID') {
      return;
    }

    try {
      const response = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice?.id,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert('Failed to create payment session. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initialization failed. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice?.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'SENT':
      case 'VIEWED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'OVERDUE':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Invoice not found'}
          </h1>
          <p className="text-gray-600">
            The invoice you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-lg rounded-lg p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Invoice {invoice.invoiceNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                From {invoice.user.companyName || invoice.user.name}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                {getStatusIcon(invoice.status)}
                <span className="ml-2">{invoice.status}</span>
              </span>
              
              {invoice.status !== 'PAID' && (
                <button
                  onClick={handlePayNow}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCardIcon className="w-4 h-4 mr-2" />
                  Pay Now
                </button>
              )}
              
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>

          {isOverdue && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Payment Overdue
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    This invoice was due on {formatDate(invoice.dueDate)}. Please make payment as soon as possible.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Invoice Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white shadow-lg rounded-lg p-6"
        >
          {/* Billing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">From</h3>
              <div className="text-gray-600">
                <p className="font-medium">{invoice.user.companyName || invoice.user.name}</p>
                {invoice.user.companyAddress && (
                  <p className="mt-1 whitespace-pre-line">{invoice.user.companyAddress}</p>
                )}
                {invoice.user.companyPhone && (
                  <p className="mt-1">{invoice.user.companyPhone}</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">To</h3>
              <div className="text-gray-600">
                <p className="font-medium">{invoice.client.name}</p>
                {invoice.client.email && (
                  <p className="mt-1">{invoice.client.email}</p>
                )}
                {invoice.client.address && (
                  <p className="mt-1 whitespace-pre-line">{invoice.client.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pb-8 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-500">Invoice Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(invoice.date)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Due Date</p>
              <p className={`text-lg font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                {formatDate(invoice.dueDate)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Amount Due</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(invoice.total)}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Description</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">Qty</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">Rate</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 text-gray-900">{item.description}</td>
                      <td className="py-4 text-right text-gray-600">{item.quantity}</td>
                      <td className="py-4 text-right text-gray-600">{formatCurrency(item.rate)}</td>
                      <td className="py-4 text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({(invoice.taxRate * 100).toFixed(1)}%)</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              {invoice.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-gray-600 whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Terms</h4>
                  <p className="text-gray-600 whitespace-pre-line">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Powered by Xinvoice</p>
        </div>
      </div>
    </div>
  );
}