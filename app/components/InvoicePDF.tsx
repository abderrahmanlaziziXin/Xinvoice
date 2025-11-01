import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/opensans/v34/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVIGxA.woff2',
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
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

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxRate?: number;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface User {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  name?: string;
  email?: string;
}

interface InvoicePDFProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    client?: Client;
    date: string;
    dueDate: string;
    status: string;
    items: InvoiceItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountAmount?: number;
    shippingAmount?: number;
    total: number;
    currency: string;
    terms?: string;
    notes?: string;
    paymentInstructions?: string;
    user?: User;
  };
  isFreeTier?: boolean;
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
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

export const InvoicePDF = ({ invoice, isFreeTier = false }: InvoicePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Watermark for free tier */}
      {isFreeTier && (
        <Text style={styles.watermark}>XINVOICE DEMO</Text>
      )}

      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
        <Text>{invoice.status}</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>
            {invoice.user?.companyName || invoice.user?.name || 'Your Company'}
          </Text>
          <Text style={styles.companyDetails}>
            {invoice.user?.companyAddress && `${invoice.user.companyAddress}\n`}
            {invoice.user?.companyPhone && `Phone: ${invoice.user.companyPhone}\n`}
            {invoice.user?.email && `Email: ${invoice.user.email}`}
          </Text>
        </View>
        <View>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
        </View>
      </View>

      {/* Invoice Details */}
      <View style={styles.invoiceDetails}>
        <View style={styles.billTo}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.clientInfo}>
            {invoice.client?.name || 'Client Name'}
            {'\n'}
            {invoice.client?.address && `${invoice.client.address}\n`}
            {invoice.client?.email && `${invoice.client.email}\n`}
            {invoice.client?.phone && invoice.client.phone}
          </Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>
          <View style={styles.dateInfo}>
            <Text>Invoice Date: {formatDate(invoice.date)}</Text>
            <Text>Due Date: {formatDate(invoice.dueDate)}</Text>
            <Text>Currency: {invoice.currency}</Text>
          </View>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.description]}>Description</Text>
          <Text style={[styles.tableHeaderCell, styles.quantity]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.rate]}>Rate</Text>
          <Text style={[styles.tableHeaderCell, styles.amount]}>Amount</Text>
        </View>

        {/* Table Rows */}
        {invoice.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.description]}>{item.description}</Text>
            <Text style={[styles.tableCell, styles.quantity]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.rate]}>
              {formatCurrency(item.rate, invoice.currency)}
            </Text>
            <Text style={[styles.tableCell, styles.amount]}>
              {formatCurrency(item.amount, invoice.currency)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(invoice.subtotal, invoice.currency)}
          </Text>
        </View>
        
        {invoice.discountAmount && invoice.discountAmount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount:</Text>
            <Text style={styles.totalValue}>
              -{formatCurrency(invoice.discountAmount, invoice.currency)}
            </Text>
          </View>
        )}
        
        {invoice.shippingAmount && invoice.shippingAmount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.shippingAmount, invoice.currency)}
            </Text>
          </View>
        )}
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax ({(invoice.taxRate * 100).toFixed(1)}%):</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(invoice.taxAmount, invoice.currency)}
          </Text>
        </View>
        
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Total:</Text>
          <Text style={styles.grandTotalValue}>
            {formatCurrency(invoice.total, invoice.currency)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {invoice.terms && (
          <>
            <Text style={styles.footerTitle}>Terms & Conditions</Text>
            <Text style={styles.footerText}>{invoice.terms}</Text>
          </>
        )}
        
        {invoice.notes && (
          <>
            <Text style={styles.footerTitle}>Notes</Text>
            <Text style={styles.footerText}>{invoice.notes}</Text>
          </>
        )}
        
        {invoice.paymentInstructions && (
          <>
            <Text style={styles.footerTitle}>Payment Instructions</Text>
            <Text style={styles.footerText}>{invoice.paymentInstructions}</Text>
          </>
        )}

        {isFreeTier && (
          <Text style={[styles.footerText, { textAlign: 'center', marginTop: 20, fontWeight: 'bold', color: '#3b82f6' }]}>
            Generated with Xinvoice - Upgrade to Pro to remove this watermark
          </Text>
        )}
      </View>
    </Page>
  </Document>
);