import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { resolveUserId } from '@/lib/request-user';

// GET /api/dashboard/stats - Get dashboard overview statistics
export async function GET(request: NextRequest) {
  try {
    const userId = resolveUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    try {
      const [
        totalInvoices,
        paidThisMonth,
        outstanding,
        overdue,
        recentInvoices
      ] = await Promise.all([
        prisma.invoice.count({ where: { userId } }),
        
        prisma.invoice.aggregate({
          where: {
            userId,
            status: 'PAID',
            paidAt: { gte: startOfMonth, lte: endOfMonth }
          },
          _sum: { total: true },
          _count: true
        }),
        
        prisma.invoice.aggregate({
          where: {
            userId,
            status: { in: ['SENT', 'VIEWED'] },
            dueDate: { gte: now }
          },
          _sum: { total: true },
          _count: true
        }),
        
        prisma.invoice.aggregate({
          where: {
            userId,
            status: { in: ['SENT', 'VIEWED'] },
            dueDate: { lt: now }
          },
          _sum: { total: true },
          _count: true
        }),
        
        prisma.invoice.findMany({
          where: { userId },
          include: { client: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      ]);

      const stats = {
        totalInvoices: { label: "Total Invoices", count: totalInvoices },
        paidThisMonth: { label: "Paid This Month", amount: paidThisMonth._sum.total || 0, count: paidThisMonth._count },
        outstanding: { label: "Outstanding", amount: outstanding._sum.total || 0, count: outstanding._count },
        overdue: { label: "Overdue", amount: overdue._sum.total || 0, count: overdue._count }
      };

      const formattedRecentInvoices = recentInvoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        client: invoice.client?.name || 'Unknown Client',
        clientEmail: invoice.client?.email || '',
        amount: invoice.total,
        status: invoice.status,
        date: invoice.date.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString()
      }));

      return NextResponse.json({
        stats,
        recentInvoices: formattedRecentInvoices,
        metadata: { currency: "USD", lastUpdated: now.toISOString(), demoMode: false }
      });
    } catch (dbError) {
      console.error("Database error, falling back to demo data:", dbError);
      return NextResponse.json({
        stats: {
          totalInvoices: { label: "Total Invoices", count: 12 },
          paidThisMonth: { label: "Paid This Month", amount: 8750.00, count: 8 },
          outstanding: { label: "Outstanding", amount: 2450.00, count: 3 },
          overdue: { label: "Overdue", amount: 850.00, count: 1 }
        },
        recentInvoices: [
          {
            id: "demo-1", invoiceNumber: "INV-001", client: "Demo Client 1", clientEmail: "client1@demo.com",
            amount: 1500.00, status: "PAID", date: new Date(Date.now() - 86400000).toISOString(),
            dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        metadata: { lastUpdated: now.toISOString(), currency: "USD", demoMode: true }
      });
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
