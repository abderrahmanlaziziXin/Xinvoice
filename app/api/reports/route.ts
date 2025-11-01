import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEMO_USER_ID = 'demo-user-1';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') || new Date(new Date().getFullYear(), 0, 1).toISOString();
    const to = searchParams.get('to') || new Date().toISOString();

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Get all invoices for the date range
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: DEMO_USER_ID,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        client: true,
        items: true,
      },
    });

    // Calculate monthly revenue
    const monthlyRevenue = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(fromDate.getFullYear(), month, 1);
      const monthEnd = new Date(fromDate.getFullYear(), month + 1, 0);
      
      const monthInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= monthStart && invoiceDate <= monthEnd;
      });
      
      const revenue = monthInvoices
        .filter(invoice => invoice.status === 'PAID')
        .reduce((sum, invoice) => sum + invoice.total, 0);
      
      if (monthInvoices.length > 0 || revenue > 0) {
        monthlyRevenue.push({
          month: monthNames[month],
          revenue,
          invoices: monthInvoices.length,
        });
      }
    }

    // Calculate status breakdown
    const statusCounts = invoices.reduce((acc: any, invoice) => {
      const status = invoice.status.toLowerCase();
      if (!acc[status]) {
        acc[status] = { count: 0, amount: 0 };
      }
      acc[status].count++;
      acc[status].amount += invoice.total;
      return acc;
    }, {});

    const statusBreakdown = Object.entries(statusCounts).map(([status, data]: [string, any]) => ({
      status,
      count: data.count,
      amount: data.amount,
    }));
    // Calculate top clients
    const clientTotals = invoices.reduce((acc: any, invoice) => {
      if (!invoice.client) return acc;
      
      const clientKey = invoice.client.id;
      if (!acc[clientKey]) {
        acc[clientKey] = {
          name: invoice.client.name,
          email: invoice.client.email || '',
          totalAmount: 0,
          invoiceCount: 0,
        };
      }
      acc[clientKey].totalAmount += invoice.total;
      acc[clientKey].invoiceCount++;
      return acc;
    }, {});

    const topClients = Object.values(clientTotals)
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    // Calculate overall stats
    const totalRevenue = invoices
      .filter(invoice => invoice.status === 'PAID')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    
    const totalInvoices = invoices.length;
    const averageInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    const paidCount = invoices.filter(invoice => invoice.status === 'PAID').length;
    const paidPercentage = totalInvoices > 0 ? (paidCount / totalInvoices) * 100 : 0;

    return NextResponse.json({
      monthlyRevenue,
      statusBreakdown,
      topClients,
      overallStats: {
        totalRevenue,
        totalInvoices,
        averageInvoice,
        paidPercentage,
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
