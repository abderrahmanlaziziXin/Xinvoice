import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/invoices/overdue - Mark overdue invoices
export async function POST(request: NextRequest) {
  try {
    const now = new Date()
    
    // Find invoices that are past due date and not paid
    const overdueInvoices = await prisma.invoice.updateMany({
      where: {
        dueDate: {
          lt: now
        },
        status: {
          in: ['SENT', 'VIEWED']
        }
      },
      data: {
        status: 'OVERDUE'
      }
    })

    return NextResponse.json({ 
      message: `Marked ${overdueInvoices.count} invoices as overdue`,
      count: overdueInvoices.count
    })
  } catch (error) {
    console.error('Error marking invoices as overdue:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// This can be called periodically or as a webhook