import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user settings
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return company settings from user model
    const settings = {
      companyName: user.companyName || user.name || '',
      email: user.email || '',
      phone: user.companyPhone || '',
      address: user.companyAddress || '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      currency: user.defaultCurrency || 'USD',
      taxRate: user.defaultTaxRate || 0,
      invoicePrefix: 'INV',
      invoiceNumberStart: 1000,
      website: user.website || '',
      taxId: user.taxNumber || '',
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    
    // Validate required fields
    if (!body.companyName || !body.email) {
      return NextResponse.json(
        { error: 'Company name and email are required' },
        { status: 400 }
      )
    }

    // Update user settings
    const settings = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        companyName: body.companyName,
        email: body.email,
        companyPhone: body.phone || null,
        companyAddress: body.address || null,
        website: body.website || null,
        taxNumber: body.taxId || null,
        defaultCurrency: body.currency || 'USD',
        defaultTaxRate: parseFloat(body.taxRate) || 0,
      },
    })

    // Return formatted settings
    const formattedSettings = {
      companyName: settings.companyName || '',
      email: settings.email || '',
      phone: settings.companyPhone || '',
      address: settings.companyAddress || '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      currency: settings.defaultCurrency || 'USD',
      taxRate: settings.defaultTaxRate || 0,
      invoicePrefix: 'INV',
      invoiceNumberStart: 1000,
      website: settings.website || '',
      taxId: settings.taxNumber || '',
    }

    return NextResponse.json(formattedSettings)
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}