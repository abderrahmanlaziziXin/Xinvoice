import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional(),
  phone: z.string().optional(),
  taxNumber: z.string().optional(),
  contactPerson: z.string().optional(),
});

// GET /api/clients - Return demo clients
export async function GET(request: NextRequest) {
  try {
    // Always return demo data (no authentication)
    return NextResponse.json({
      clients: [
        {
          id: 'demo-client-1',
          name: 'Acme Corporation',
          email: 'contact@acme.com',
          phone: '+1 (555) 123-4567',
          address: '123 Business St, New York, NY 10001',
          taxNumber: 'TAX123456',
          contactPerson: 'John Smith',
          createdAt: new Date().toISOString(),
          _count: { invoices: 5 }
        },
        {
          id: 'demo-client-2',
          name: 'Global Tech Solutions',
          email: 'info@globaltech.com',
          phone: '+1 (555) 987-6543',
          address: '456 Tech Avenue, San Francisco, CA 94102',
          taxNumber: 'TAX789012',
          contactPerson: 'Sarah Johnson',
          createdAt: new Date().toISOString(),
          _count: { invoices: 3 }
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/clients - Create a new client (demo mode)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ClientSchema.parse(body);

    // For demo mode, return a mock created client
    const newClient = {
      id: `demo-client-${Date.now()}`,
      ...validatedData,
      email: validatedData.email === '' ? undefined : validatedData.email,
      createdAt: new Date().toISOString(),
      _count: { invoices: 0 }
    };

    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
