import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'csv'
    const from = searchParams.get('from') || new Date(new Date().getFullYear(), 0, 1).toISOString()
    const to = searchParams.get('to') || new Date().toISOString()

    // Demo CSV data
    const csvData = `Invoice Number,Client,Date,Due Date,Status,Amount
INV-001,Acme Corporation,2025-10-01,2025-11-01,PAID,1500.00
INV-002,Global Tech Solutions,2025-10-15,2025-11-15,SENT,950.00
INV-003,Enterprise Corp,2025-10-20,2025-11-20,OVERDUE,850.00`

    if (format === 'csv') {
      return new Response(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=invoices-export.csv'
        }
      })
    }

    // Default to JSON if not CSV
    return NextResponse.json({
      invoices: [
        {
          invoiceNumber: 'INV-001',
          client: 'Acme Corporation',
          date: '2025-10-01',
          dueDate: '2025-11-01',
          status: 'PAID',
          amount: 1500.00
        }
      ]
    })
  } catch (error) {
    console.error('Error exporting reports:', error)
    return NextResponse.json(
      { error: 'Failed to export reports' },
      { status: 500 }
    )
  }
}
