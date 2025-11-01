import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/invoices/public/[token] - View invoice by token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Find invoice by view token
    const invoice = await prisma.invoice.findFirst({
      where: {
        viewToken: params.token
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        items: {
          select: {
            id: true,
            description: true,
            quantity: true,
            rate: true,
            amount: true,
            taxRate: true
          }
        },
        user: {
          select: {
            companyName: true,
            companyAddress: true,
            companyPhone: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Update status to VIEWED if it was SENT
    if (invoice.status === 'SENT') {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { 
          status: 'VIEWED',
          viewedAt: new Date()
        }
      })
      
      invoice.status = 'VIEWED'
      invoice.viewedAt = new Date()
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Error fetching public invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}