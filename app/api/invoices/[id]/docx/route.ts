import { NextRequest, NextResponse } from 'next/server'
import { resolveUserId } from '@/lib/request-user'
import { prisma } from '@/lib/prisma'
import { invoiceDOCXGenerator, DOCXInvoiceData } from '@/app/lib/docx-generator'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('DOCX generation - Invoice ID:', params.id)

    // Resolve user
    const userId = resolveUserId()
    if (!userId) {
      console.log('DOCX generation - No user ID found')
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    console.log('DOCX generation - User ID:', userId)

    // Fetch invoice with client and items
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: userId
      },
      include: {
        client: true,
        items: true
      }
    })

    if (!invoice) {
      console.log('DOCX generation - Invoice not found for user:', userId)
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    console.log('DOCX generation - Invoice found:', invoice.id)

    // Transform the invoice data to match the DOCX generator interface
    const docxInvoiceData: DOCXInvoiceData = {
      id: invoice.id,
      number: invoice.invoiceNumber || undefined,
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      currency: invoice.currency,
      status: (invoice.status as any) || undefined,
      subtotal: parseFloat(invoice.subtotal.toString()),
      tax: parseFloat(invoice.taxAmount.toString()),
      total: parseFloat(invoice.total.toString()),
      notes: invoice.notes || undefined,
      client: invoice.client ? {
        name: invoice.client.name,
        email: invoice.client.email || undefined,
        address: invoice.client.address || undefined,
        city: undefined, // Not in schema
        state: undefined, // Not in schema
        zip: undefined, // Not in schema
        country: undefined // Not in schema
      } : undefined,
      items: invoice.items.map((item: any) => ({
        description: item.description,
        quantity: parseFloat(item.quantity.toString()),
        rate: parseFloat(item.rate.toString()),
        amount: parseFloat(item.amount.toString())
      }))
    }

    console.log('DOCX generation - Generating DOCX...')

    // Generate DOCX
    const docxBuffer = await invoiceDOCXGenerator.generateBuffer(docxInvoiceData)

    console.log('DOCX generation - DOCX generated successfully, size:', docxBuffer.length)

    // Return the DOCX file
    return new NextResponse(new Uint8Array(docxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber || invoice.id}.docx"`
      }
    })

  } catch (error) {
    console.error('DOCX generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate DOCX',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // For consistency with PDF route, support POST as well
  return GET(request, { params })
}