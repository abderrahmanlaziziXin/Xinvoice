import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'csv'
    const from = searchParams.get('from') || new Date(new Date().getFullYear(), 0, 1).toISOString()
    const to = searchParams.get('to') || new Date().toISOString()

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all invoices in date range
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: user.id,
        date: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      include: {
        client: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Invoice Number',
        'Client Name',
        'Client Email',
        'Date',
        'Due Date',
        'Status',
        'Subtotal',
        'Tax Amount',
        'Total',
        'Currency',
      ]

      const csvRows = [
        headers.join(','),
        ...invoices.map(invoice => [
          invoice.invoiceNumber,
          invoice.client?.name || 'N/A',
          invoice.client?.email || 'N/A',
          new Date(invoice.date).toLocaleDateString(),
          new Date(invoice.dueDate).toLocaleDateString(),
          invoice.status,
          invoice.subtotal.toFixed(2),
          invoice.taxAmount.toFixed(2),
          invoice.total.toFixed(2),
          invoice.currency,
        ].join(','))
      ]

      const csvContent = csvRows.join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="invoice-report-${from}-to-${to}.csv"`,
        },
      })
    } else if (format === 'pdf') {
      // Generate simple PDF report (text-based)
      const totalRevenue = invoices
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + inv.total, 0)
      
      const totalInvoices = invoices.length
      const paidInvoices = invoices.filter(inv => inv.status === 'PAID').length

      const pdfContent = `
Invoice Report
Generated: ${new Date().toLocaleDateString()}
Period: ${new Date(from).toLocaleDateString()} - ${new Date(to).toLocaleDateString()}

SUMMARY
=======
Total Invoices: ${totalInvoices}
Paid Invoices: ${paidInvoices}
Total Revenue: $${totalRevenue.toFixed(2)}
Average Invoice: $${totalInvoices > 0 ? (totalRevenue / paidInvoices).toFixed(2) : '0.00'}

INVOICES
========
${invoices.map(invoice => `
${invoice.invoiceNumber} | ${invoice.client?.name || 'N/A'} | ${new Date(invoice.date).toLocaleDateString()} | ${invoice.status} | $${invoice.total.toFixed(2)}
`).join('')}
      `.trim()

      return new NextResponse(pdfContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="invoice-report-${from}-to-${to}.txt"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Error exporting reports:', error)
    return NextResponse.json(
      { error: 'Failed to export reports' },
      { status: 500 }
    )
  }
}