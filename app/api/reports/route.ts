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

    const { searchParams } = new URL(req.url)
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

    // Calculate monthly revenue
    const monthlyRevenue = invoices.reduce((acc, invoice) => {
      const month = new Date(invoice.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      
      if (!acc[month]) {
        acc[month] = { revenue: 0, invoices: 0 }
      }
      
      if (invoice.status === 'PAID') {
        acc[month].revenue += invoice.total
      }
      acc[month].invoices += 1
      
      return acc
    }, {} as Record<string, { revenue: number, invoices: number }>)

    // Convert to array format
    const monthlyRevenueArray = Object.entries(monthlyRevenue).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      invoices: data.invoices,
    }))

    // Status breakdown
    const statusBreakdown = invoices.reduce((acc, invoice) => {
      const status = invoice.status
      
      if (!acc[status]) {
        acc[status] = { count: 0, amount: 0 }
      }
      
      acc[status].count += 1
      acc[status].amount += invoice.total
      
      return acc
    }, {} as Record<string, { count: number, amount: number }>)

    const statusBreakdownArray = Object.entries(statusBreakdown).map(([status, data]) => ({
      status,
      count: data.count,
      amount: data.amount,
    }))

    // Top clients
    const clientData = invoices.reduce((acc, invoice) => {
      if (!invoice.client) return acc
      
      const clientKey = invoice.client.id
      
      if (!acc[clientKey]) {
        acc[clientKey] = {
          name: invoice.client.name,
          email: invoice.client.email || '',
          totalAmount: 0,
          invoiceCount: 0,
        }
      }
      
      if (invoice.status === 'PAID') {
        acc[clientKey].totalAmount += invoice.total
      }
      acc[clientKey].invoiceCount += 1
      
      return acc
    }, {} as Record<string, { name: string, email: string, totalAmount: number, invoiceCount: number }>)

    const topClients = Object.values(clientData)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10)

    // Overall stats
    const totalRevenue = invoices
      .filter(inv => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.total, 0)
    
    const totalInvoices = invoices.length
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID').length
    const averageInvoice = totalInvoices > 0 ? totalRevenue / paidInvoices : 0
    const paidPercentage = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0

    const reportData = {
      monthlyRevenue: monthlyRevenueArray,
      statusBreakdown: statusBreakdownArray,
      topClients,
      overallStats: {
        totalRevenue,
        totalInvoices,
        averageInvoice,
        paidPercentage,
      },
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}