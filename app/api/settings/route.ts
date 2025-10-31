import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Always return demo settings
    return NextResponse.json({
      companyName: 'Demo Company Inc',
      email: 'demo@example.com',
      companyPhone: '+1 (555) 123-4567',
      companyAddress: '123 Demo Street, Demo City, DC 12345',
      website: 'https://democompany.com',
      taxNumber: 'TAX123456789',
      currency: 'USD',
      locale: 'en-US',
      timezone: 'America/New_York',
      invoicePrefix: 'INV',
      demoMode: true
    })


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
    const body = await req.json()
    
    // Validate required fields
    if (!body.companyName || !body.email) {
      return NextResponse.json(
        { error: 'Company name and email are required' },
        { status: 400 }
      )
    }

    // For demo mode, return the submitted settings as if they were saved
    const formattedSettings = {
      companyName: body.companyName || 'Demo Company Inc',
      email: body.email || 'demo@example.com',
      phone: body.phone || '+1 (555) 123-4567',
      address: body.address || '123 Demo Street, Demo City, DC 12345',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      currency: body.currency || 'USD',
      taxRate: parseFloat(body.taxRate) || 0,
      invoicePrefix: 'INV',
      invoiceNumberStart: 1000,
      website: body.website || 'https://democompany.com',
      taxId: body.taxId || 'TAX123456789',
      demoMode: true
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