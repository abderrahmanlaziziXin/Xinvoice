import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from') || new Date(new Date().getFullYear(), 0, 1).toISOString()
    const to = searchParams.get('to') || new Date().toISOString()

    // Always return demo reports with proper structure
    return NextResponse.json({
      monthlyRevenue: [
        { month: 'Jan', revenue: 2500, invoices: 3 },
        { month: 'Feb', revenue: 1800, invoices: 2 },
        { month: 'Mar', revenue: 3200, invoices: 4 },
        { month: 'Apr', revenue: 2100, invoices: 2 },
        { month: 'May', revenue: 2900, invoices: 1 }
      ],
      statusBreakdown: [
        { status: 'paid', count: 8, amount: 8750.00 },
        { status: 'sent', count: 3, amount: 2450.00 },
        { status: 'overdue', count: 1, amount: 850.00 },
        { status: 'draft', count: 2, amount: 450.00 }
      ],
      topClients: [
        { name: 'Acme Corporation', email: 'contact@acme.com', totalAmount: 7500.00, invoiceCount: 5 },
        { name: 'Tech Solutions Inc', email: 'hello@techsolutions.com', totalAmount: 3200.00, invoiceCount: 3 },
        { name: 'Global Services LLC', email: 'info@globalservices.com', totalAmount: 1800.00, invoiceCount: 4 }
      ],
      overallStats: {
        totalRevenue: 12500.00,
        totalInvoices: 14,
        averageInvoice: 892.86,
        paidPercentage: 70.0
      },
      demoMode: true
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
