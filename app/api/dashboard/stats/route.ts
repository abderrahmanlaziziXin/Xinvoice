import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { prisma } from "../../../../lib/prisma"

// GET /api/dashboard/stats - Get dashboard overview statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get current date for month calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Run all queries in parallel for better performance
    const [
      totalInvoices,
      paidThisMonth,
      outstandingInvoices,
      overdueInvoices,
      recentInvoices
    ] = await Promise.all([
      // Total invoices count
      prisma.invoice.count({
        where: { userId }
      }),

      // Paid invoices this month
      prisma.invoice.aggregate({
        where: {
          userId,
          status: "PAID",
          updatedAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: { total: true },
        _count: { id: true }
      }),

      // Outstanding invoices (SENT + VIEWED)
      prisma.invoice.aggregate({
        where: {
          userId,
          status: { in: ["SENT", "VIEWED"] }
        },
        _sum: { total: true },
        _count: { id: true }
      }),

      // Overdue invoices (past due date and not paid)
      prisma.invoice.aggregate({
        where: {
          userId,
          status: { in: ["SENT", "VIEWED", "OVERDUE"] },
          dueDate: { lt: now }
        },
        _sum: { total: true },
        _count: { id: true }
      }),

      // Recent invoices (last 5)
      prisma.invoice.findMany({
        where: { userId },
        include: {
          client: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    ])

    // Format the statistics
    const stats = {
      totalInvoices: {
        count: totalInvoices,
        label: "Total Invoices"
      },
      paidThisMonth: {
        amount: paidThisMonth._sum.total || 0,
        count: paidThisMonth._count.id,
        label: "Paid This Month"
      },
      outstanding: {
        amount: outstandingInvoices._sum.total || 0,
        count: outstandingInvoices._count.id,
        label: "Outstanding"
      },
      overdue: {
        amount: overdueInvoices._sum.total || 0,
        count: overdueInvoices._count.id,
        label: "Overdue"
      }
    }

    // Format recent invoices
    const formattedRecentInvoices = recentInvoices.map((invoice: any) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      client: invoice.client?.name || "Unknown Client",
      clientEmail: invoice.client?.email,
      amount: invoice.total,
      status: invoice.status,
      date: invoice.date,
      dueDate: invoice.dueDate,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt
    }))

    return NextResponse.json({
      stats,
      recentInvoices: formattedRecentInvoices,
      metadata: {
        currency: "USD", // TODO: Get from user settings
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}