import { Resend } from 'resend';
import { createInvoicePDF } from './pdf-generator-enhanced';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailInvoiceParams {
  invoice: any;
  recipientEmail: string;
  senderEmail: string;
  senderName: string;
  viewUrl?: string;
}

export async function sendInvoiceEmail({
  invoice,
  recipientEmail,
  senderEmail,
  senderName,
  viewUrl
}: EmailInvoiceParams) {
  try {
    // Generate PDF attachment
    const isFreeTier = invoice.user?.plan === 'free';
    const pdfBuffer = await createInvoicePDF(invoice, isFreeTier);

    const subject = `Invoice ${invoice.invoiceNumber} from ${senderName}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .invoice-details { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #666; }
          .amount { font-size: 24px; font-weight: bold; color: #28a745; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Invoice from ${senderName}</h1>
            <p>You have received a new invoice. Please find the details below.</p>
          </div>

          <div class="invoice-details">
            <h2>Invoice Details</h2>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p><strong>Amount Due:</strong> <span class="amount">$${invoice.total.toFixed(2)}</span></p>
            
            ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            ${viewUrl ? `<a href="${viewUrl}" class="button">View Invoice Online</a>` : ''}
            <p>The invoice is also attached as a PDF to this email.</p>
          </div>

          <div class="footer">
            <p>This email was sent from ${senderName} using Xinvoice.</p>
            <p>If you have any questions about this invoice, please reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Invoice ${invoice.invoiceNumber} from ${senderName}

You have received a new invoice.

Invoice Details:
- Invoice Number: ${invoice.invoiceNumber}
- Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
- Amount Due: $${invoice.total.toFixed(2)}

${invoice.notes ? `Notes: ${invoice.notes}` : ''}

${viewUrl ? `View online: ${viewUrl}` : ''}

The invoice is also attached as a PDF to this email.

---
This email was sent from ${senderName} using Xinvoice.
If you have any questions about this invoice, please reply to this email.
    `;

    // In demo mode, we'll just simulate sending
    if (process.env.RESEND_API_KEY === 're_demo_key_for_testing') {
      console.log('📧 Demo Mode: Email would be sent to:', recipientEmail);
      console.log('📧 Subject:', subject);
      console.log('📧 PDF attached:', pdfBuffer.length, 'bytes');
      
      return {
        success: true,
        messageId: `demo_${Date.now()}`,
        message: 'Email sent successfully (demo mode)'
      };
    }

    // Send actual email in production
    const emailResult = await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
      text: textContent,
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: Buffer.from(pdfBuffer).toString('base64'),
        },
      ],
    });

    return {
      success: true,
      messageId: emailResult.data?.id,
      message: 'Email sent successfully'
    };

  } catch (error) {
    console.error('Error sending invoice email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
}

export async function sendPaymentReminderEmail({
  invoice,
  recipientEmail,
  senderEmail,
  senderName,
  viewUrl
}: EmailInvoiceParams) {
  try {
    const subject = `Payment Reminder: Invoice ${invoice.invoiceNumber}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffeaa7; }
          .invoice-details { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 14px; color: #666; }
          .amount { font-size: 24px; font-weight: bold; color: #dc3545; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Reminder</h1>
            <p>This is a friendly reminder that payment for invoice ${invoice.invoiceNumber} is due.</p>
          </div>

          <div class="invoice-details">
            <h2>Invoice Details</h2>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p><strong>Amount Due:</strong> <span class="amount">$${invoice.total.toFixed(2)}</span></p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            ${viewUrl ? `<a href="${viewUrl}" class="button">View & Pay Invoice</a>` : ''}
          </div>

          <div class="footer">
            <p>This reminder was sent from ${senderName} using Xinvoice.</p>
            <p>If you have already made this payment, please disregard this reminder.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // In demo mode, just simulate
    if (process.env.RESEND_API_KEY === 're_demo_key_for_testing') {
      console.log('📧 Demo Mode: Reminder email would be sent to:', recipientEmail);
      
      return {
        success: true,
        messageId: `demo_reminder_${Date.now()}`,
        message: 'Reminder email sent successfully (demo mode)'
      };
    }

    const emailResult = await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: recipientEmail,
      subject: subject,
      html: htmlContent,
    });

    return {
      success: true,
      messageId: emailResult.data?.id,
      message: 'Reminder email sent successfully'
    };

  } catch (error) {
    console.error('Error sending reminder email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reminder'
    };
  }
}