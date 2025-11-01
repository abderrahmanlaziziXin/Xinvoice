// Simple PDF generator function for API routes
export async function createInvoicePDF(invoice: any, includeWatermark: boolean = false): Promise<Buffer> {
  // Simple fallback implementation for build compatibility
  // In a real implementation, you would use a PDF library like jsPDF or PDFKit
  const watermarkText = includeWatermark ? ' [DRAFT]' : '';
  const pdfContent = `Invoice #${invoice.invoiceNumber || 'N/A'}${watermarkText}
  
Client: ${invoice.client?.name || 'Unknown Client'}
Date: ${invoice.date || 'N/A'}
Due Date: ${invoice.dueDate || 'N/A'}
Total: ${invoice.currency || 'USD'} ${invoice.total || '0.00'}

Items:
${invoice.items?.map((item: any, index: number) => 
  `${index + 1}. ${item.description || 'Item'} - Qty: ${item.quantity || 0} - Rate: ${item.rate || 0} - Amount: ${item.amount || 0}`
).join('\n') || 'No items'}

${invoice.notes ? `Notes: ${invoice.notes}` : ''}
${invoice.terms ? `Terms: ${invoice.terms}` : ''}
`;
  
  return Buffer.from(pdfContent, 'utf-8');
}

// Export for compatibility
export default {
  createInvoicePDF
};