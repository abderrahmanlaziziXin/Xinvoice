import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Types from Prisma
type InvoiceWithRelations = {
  id: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  status: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number | null;
  shippingAmount: number | null;
  total: number;
  currency: string;
  terms: string | null;
  notes: string | null;
  paymentInstructions: string | null;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  items: {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    taxRate: number | null;
  }[];
  user: {
    id: string;
    name: string | null;
    email: string;
    companyName: string | null;
    companyAddress: string | null;
    companyPhone: string | null;
    plan: string;
  } | null;
};

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export async function createInvoicePDF(invoice: InvoiceWithRelations, isFreeTier: boolean = false): Promise<Buffer> {
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: 40,
      fontFamily: 'Helvetica',
      fontSize: 11,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 40,
    },
    companyInfo: {
      flex: 1,
    },
    companyName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 8,
    },
    companyDetails: {
      fontSize: 10,
      color: '#6b7280',
      lineHeight: 1.4,
    },
    invoiceTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#3b82f6',
      textAlign: 'right',
      marginBottom: 8,
    },
    invoiceNumber: {
      fontSize: 14,
      color: '#6b7280',
      textAlign: 'right',
    },
    invoiceDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 40,
    },
    billTo: {
      flex: 1,
    },
    invoiceInfo: {
      flex: 1,
      alignItems: 'flex-end',
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#374151',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    clientInfo: {
      fontSize: 11,
      color: '#1f2937',
      lineHeight: 1.5,
    },
    dateInfo: {
      fontSize: 11,
      color: '#1f2937',
      textAlign: 'right',
      lineHeight: 1.5,
    },
    table: {
      marginBottom: 30,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f3f4f6',
      padding: 12,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    },
    tableHeaderCell: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#374151',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      padding: 12,
      minHeight: 40,
    },
    tableCell: {
      fontSize: 11,
      color: '#1f2937',
      justifyContent: 'center',
    },
    description: {
      flex: 3,
    },
    quantity: {
      flex: 1,
      textAlign: 'center',
    },
    rate: {
      flex: 1.5,
      textAlign: 'right',
    },
    amount: {
      flex: 1.5,
      textAlign: 'right',
    },
    totals: {
      alignItems: 'flex-end',
      marginTop: 20,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 200,
      paddingVertical: 4,
    },
    totalLabel: {
      fontSize: 11,
      color: '#6b7280',
    },
    totalValue: {
      fontSize: 11,
      color: '#1f2937',
    },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 200,
      paddingVertical: 6,
      borderTopWidth: 2,
      borderTopColor: '#3b82f6',
      marginTop: 8,
    },
    grandTotalLabel: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#1f2937',
    },
    grandTotalValue: {
      fontSize: 13,
      fontWeight: 'bold',
      color: '#3b82f6',
    },
    footer: {
      marginTop: 40,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
    },
    footerTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#374151',
      marginBottom: 8,
    },
    footerText: {
      fontSize: 10,
      color: '#6b7280',
      lineHeight: 1.5,
      marginBottom: 12,
    },
    statusBadge: {
      position: 'absolute',
      top: 40,
      right: 40,
      backgroundColor: '#10b981',
      color: '#ffffff',
      padding: '6 12',
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    watermark: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(-45deg)',
      fontSize: 60,
      color: '#f3f4f6',
      fontWeight: 'bold',
      zIndex: -1,
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return '#10b981';
      case 'SENT':
        return '#3b82f6';
      case 'OVERDUE':
        return '#ef4444';
      case 'DRAFT':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const document = React.createElement(Document, {}, 
    React.createElement(Page, { size: 'A4', style: styles.page }, [
      // Watermark for free tier
      isFreeTier && React.createElement(Text, { key: 'watermark', style: styles.watermark }, 'XINVOICE DEMO'),
      
      // Status Badge
      React.createElement(View, { 
        key: 'status', 
        style: [styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }] 
      }, 
        React.createElement(Text, {}, invoice.status)
      ),

      // Header
      React.createElement(View, { key: 'header', style: styles.header }, [
        React.createElement(View, { key: 'company', style: styles.companyInfo }, [
          React.createElement(Text, { key: 'name', style: styles.companyName }, 
            invoice.user?.companyName || invoice.user?.name || 'Your Company'
          ),
          React.createElement(Text, { key: 'details', style: styles.companyDetails }, 
            [
              invoice.user?.companyAddress && `${invoice.user.companyAddress}\n`,
              invoice.user?.companyPhone && `Phone: ${invoice.user.companyPhone}\n`,
              invoice.user?.email && `Email: ${invoice.user.email}`
            ].filter(Boolean).join('')
          ),
        ]),
        React.createElement(View, { key: 'title' }, [
          React.createElement(Text, { key: 'invoice-title', style: styles.invoiceTitle }, 'INVOICE'),
          React.createElement(Text, { key: 'invoice-number', style: styles.invoiceNumber }, invoice.invoiceNumber),
        ]),
      ]),

      // Invoice Details
      React.createElement(View, { key: 'details', style: styles.invoiceDetails }, [
        React.createElement(View, { key: 'bill-to', style: styles.billTo }, [
          React.createElement(Text, { key: 'bill-title', style: styles.sectionTitle }, 'Bill To'),
          React.createElement(Text, { key: 'client-info', style: styles.clientInfo }, 
            [
              invoice.client?.name || 'Client Name',
              invoice.client?.address && `\n${invoice.client.address}`,
              invoice.client?.email && `\n${invoice.client.email}`,
              invoice.client?.phone && `\n${invoice.client.phone}`
            ].filter(Boolean).join('')
          ),
        ]),
        React.createElement(View, { key: 'invoice-info', style: styles.invoiceInfo }, [
          React.createElement(Text, { key: 'details-title', style: styles.sectionTitle }, 'Invoice Details'),
          React.createElement(View, { key: 'date-info', style: styles.dateInfo }, [
            React.createElement(Text, { key: 'date' }, `Invoice Date: ${formatDate(invoice.date)}`),
            React.createElement(Text, { key: 'due' }, `Due Date: ${formatDate(invoice.dueDate)}`),
            React.createElement(Text, { key: 'currency' }, `Currency: ${invoice.currency}`),
          ]),
        ]),
      ]),

      // Items Table
      React.createElement(View, { key: 'table', style: styles.table }, [
        // Table Header
        React.createElement(View, { key: 'table-header', style: styles.tableHeader }, [
          React.createElement(Text, { key: 'desc-header', style: [styles.tableHeaderCell, styles.description] }, 'Description'),
          React.createElement(Text, { key: 'qty-header', style: [styles.tableHeaderCell, styles.quantity] }, 'Qty'),
          React.createElement(Text, { key: 'rate-header', style: [styles.tableHeaderCell, styles.rate] }, 'Rate'),
          React.createElement(Text, { key: 'amount-header', style: [styles.tableHeaderCell, styles.amount] }, 'Amount'),
        ]),
        
        // Table Rows
        ...invoice.items.map((item, index) => 
          React.createElement(View, { key: `row-${index}`, style: styles.tableRow }, [
            React.createElement(Text, { key: 'desc', style: [styles.tableCell, styles.description] }, item.description),
            React.createElement(Text, { key: 'qty', style: [styles.tableCell, styles.quantity] }, item.quantity.toString()),
            React.createElement(Text, { key: 'rate', style: [styles.tableCell, styles.rate] }, formatCurrency(item.rate, invoice.currency)),
            React.createElement(Text, { key: 'amount', style: [styles.tableCell, styles.amount] }, formatCurrency(item.amount, invoice.currency)),
          ])
        ),
      ]),

      // Totals
      React.createElement(View, { key: 'totals', style: styles.totals }, [
        React.createElement(View, { key: 'subtotal', style: styles.totalRow }, [
          React.createElement(Text, { key: 'subtotal-label', style: styles.totalLabel }, 'Subtotal:'),
          React.createElement(Text, { key: 'subtotal-value', style: styles.totalValue }, formatCurrency(invoice.subtotal, invoice.currency)),
        ]),

        invoice.discountAmount && invoice.discountAmount > 0 && React.createElement(View, { key: 'discount', style: styles.totalRow }, [
          React.createElement(Text, { key: 'discount-label', style: styles.totalLabel }, 'Discount:'),
          React.createElement(Text, { key: 'discount-value', style: styles.totalValue }, `-${formatCurrency(invoice.discountAmount, invoice.currency)}`),
        ]),

        invoice.shippingAmount && invoice.shippingAmount > 0 && React.createElement(View, { key: 'shipping', style: styles.totalRow }, [
          React.createElement(Text, { key: 'shipping-label', style: styles.totalLabel }, 'Shipping:'),
          React.createElement(Text, { key: 'shipping-value', style: styles.totalValue }, formatCurrency(invoice.shippingAmount, invoice.currency)),
        ]),

        React.createElement(View, { key: 'tax', style: styles.totalRow }, [
          React.createElement(Text, { key: 'tax-label', style: styles.totalLabel }, `Tax (${(invoice.taxRate * 100).toFixed(1)}%):`),
          React.createElement(Text, { key: 'tax-value', style: styles.totalValue }, formatCurrency(invoice.taxAmount, invoice.currency)),
        ]),

        React.createElement(View, { key: 'total', style: styles.grandTotalRow }, [
          React.createElement(Text, { key: 'total-label', style: styles.grandTotalLabel }, 'Total:'),
          React.createElement(Text, { key: 'total-value', style: styles.grandTotalValue }, formatCurrency(invoice.total, invoice.currency)),
        ]),
      ]),

      // Footer
      React.createElement(View, { key: 'footer', style: styles.footer }, [
        invoice.terms && React.createElement(View, { key: 'terms' }, [
          React.createElement(Text, { key: 'terms-title', style: styles.footerTitle }, 'Terms & Conditions'),
          React.createElement(Text, { key: 'terms-text', style: styles.footerText }, invoice.terms),
        ]),

        invoice.notes && React.createElement(View, { key: 'notes' }, [
          React.createElement(Text, { key: 'notes-title', style: styles.footerTitle }, 'Notes'),
          React.createElement(Text, { key: 'notes-text', style: styles.footerText }, invoice.notes),
        ]),

        invoice.paymentInstructions && React.createElement(View, { key: 'payment' }, [
          React.createElement(Text, { key: 'payment-title', style: styles.footerTitle }, 'Payment Instructions'),
          React.createElement(Text, { key: 'payment-text', style: styles.footerText }, invoice.paymentInstructions),
        ]),

        isFreeTier && React.createElement(Text, { 
          key: 'promo', 
          style: [styles.footerText, { textAlign: 'center', marginTop: 20, fontWeight: 'bold', color: '#3b82f6' }] 
        }, 
          'Generated with Xinvoice - Upgrade to Pro to remove this watermark'
        ),
      ].filter(Boolean)),
    ].filter(Boolean))
  );

  const pdfBuffer = await renderToBuffer(document);
  return pdfBuffer;
}