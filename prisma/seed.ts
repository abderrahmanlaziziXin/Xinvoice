import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create demo user
  const user = await prisma.user.upsert({
    where: { id: 'demo-user-1' },
    update: {},
    create: {
      id: 'demo-user-1',
      email: 'demo@xinvoice.com',
      name: 'Demo User',
      companyName: 'Xinvoice Demo Company',
      companyAddress: '123 Demo Street, Demo City, DC 12345',
      companyPhone: '+1 (555) 123-4567',
      defaultCurrency: 'USD',
      defaultLocale: 'en-US',
      defaultTaxRate: 0.08
    }
  })

  // Create demo clients
  const client1 = await prisma.client.upsert({
    where: { id: 'demo-client-1' },
    update: {},
    create: {
      id: 'demo-client-1',
      userId: user.id,
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '+1 (555) 987-6543',
      address: '456 Business Ave, Corporate City, CC 54321'
    }
  })

  const client2 = await prisma.client.upsert({
    where: { id: 'demo-client-2' },
    update: {},
    create: {
      id: 'demo-client-2',
      userId: user.id,
      name: 'Global Tech Solutions',
      email: 'hello@globaltech.com',
      phone: '+1 (555) 456-7890',
      address: '789 Tech Park, Innovation City, IC 98765'
    }
  })

  // Create demo invoices
  const invoice1 = await prisma.invoice.upsert({
    where: { id: 'demo-invoice-1' },
    update: {},
    create: {
      id: 'demo-invoice-1',
      userId: user.id,
      clientId: client1.id,
      invoiceNumber: 'INV-001',
      date: new Date(Date.now() - 86400000 * 3),
      dueDate: new Date(Date.now() + 86400000 * 27),
      subtotal: 1350.00,
      taxRate: 0.08,
      taxAmount: 108.00,
      total: 1458.00,
      currency: 'USD',
      locale: 'en-US',
      status: 'PAID',
      notes: 'Thank you for your business!',
      terms: 'Net 30',
      paidAt: new Date(Date.now() - 86400000 * 1),
      items: {
        create: [
          {
            description: 'Web Development Services',
            quantity: 15,
            rate: 90.00,
            amount: 1350.00,
            taxRate: 0.08
          }
        ]
      }
    }
  })

  const invoice2 = await prisma.invoice.upsert({
    where: { id: 'demo-invoice-2' },
    update: {},
    create: {
      id: 'demo-invoice-2',
      userId: user.id,
      clientId: client2.id,
      invoiceNumber: 'INV-002',
      date: new Date(Date.now() - 86400000 * 1),
      dueDate: new Date(Date.now() + 86400000 * 29),
      subtotal: 950.00,
      taxRate: 0.08,
      taxAmount: 76.00,
      total: 1026.00,
      currency: 'USD',
      locale: 'en-US',
      status: 'SENT',
      notes: 'Consulting services as discussed.',
      terms: 'Net 30',
      sentAt: new Date(Date.now() - 86400000 * 1),
      items: {
        create: [
          {
            description: 'Business Consulting Services',
            quantity: 10,
            rate: 95.00,
            amount: 950.00,
            taxRate: 0.08
          }
        ]
      }
    }
  })

  const invoice3 = await prisma.invoice.upsert({
    where: { id: 'demo-invoice-3' },
    update: {},
    create: {
      id: 'demo-invoice-3',
      userId: user.id,
      clientId: client1.id,
      invoiceNumber: 'INV-003',
      date: new Date(),
      dueDate: new Date(Date.now() + 86400000 * 30),
      subtotal: 750.00,
      taxRate: 0.08,
      taxAmount: 60.00,
      total: 810.00,
      currency: 'USD',
      locale: 'en-US',
      status: 'DRAFT',
      notes: 'Monthly maintenance retainer.',
      terms: 'Net 30',
      items: {
        create: [
          {
            description: 'Website Maintenance Services',
            quantity: 1,
            rate: 750.00,
            amount: 750.00,
            taxRate: 0.08
          }
        ]
      }
    }
  })

  console.log('Database seeded successfully!')
  console.log({
    user: user.id,
    clients: [client1.id, client2.id],
    invoices: [invoice1.id, invoice2.id, invoice3.id]
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })