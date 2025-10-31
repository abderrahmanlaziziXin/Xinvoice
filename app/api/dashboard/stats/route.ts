import { NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"

// GET /api/dashboard/stats - Get dashboard overview statistics
export async function GET(request: NextRequest) {
  try {
    // No authentication - return demo data
    const userId = "demo-user-id"
    const isDemoMode = true

    // Get current date for month calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // If in demo mode, return mock data
    if (isDemoMode) {
      return NextResponse.json({
        stats: {
          totalInvoices: { label: "Total Invoices", count: 12 },
          paidThisMonth: { label: "Paid This Month", amount: 8750.00, count: 8 },
          outstanding: { label: "Outstanding", amount: 2450.00, count: 3 },
          overdue: { label: "Overdue", amount: 850.00, count: 1 }
        },
        recentInvoices: [
          {
            id: "demo-1",
            invoiceNumber: "INV-001",
            client: "Demo Client 1",
            clientEmail: "client1@demo.com",
            amount: 1500.00,
            status: "PAID",
            date: new Date(Date.now() - 86400000).toISOString(),
            dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: "demo-2", 
            invoiceNumber: "INV-002",
            client: "Demo Client 2",
            clientEmail: "client2@demo.com",
            amount: 950.00,
            status: "SENT",
            date: new Date(Date.now() - 86400000 * 2).toISOString(),
            dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
          }
        ],
        metadata: { 
          lastUpdated: now.toISOString(),
          currency: "USD",
          demoMode: true
        }
      })
    }

    // Try to run database queries, fallback to mock data if they fail
    let totalInvoices, paidThisMonth, outstandingInvoices, overdueInvoices, recentInvoices;
    
    try {
      [
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
    } catch (dbError) {
      console.error("Database query failed, returning mock data:", dbError)
      // Return mock data if database queries fail
      return NextResponse.json({
        stats: {
          totalInvoices: { label: "Total Invoices", count: 12 },
          paidThisMonth: { label: "Paid This Month", amount: 8750.00, count: 8 },
          outstanding: { label: "Outstanding", amount: 2450.00, count: 3 },
          overdue: { label: "Overdue", amount: 850.00, count: 1 }
        },
        recentInvoices: [
          {
            id: "demo-1",
            invoiceNumber: "INV-001",
            client: "Demo Client 1",
            clientEmail: "demo1@example.com",
            amount: 1500.00,
            status: "PAID",
            date: new Date(Date.now() - 86400000).toISOString(),
            dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: "demo-2", 
            invoiceNumber: "INV-002",
            client: "Demo Client 2",
            clientEmail: "demo2@example.com",
            amount: 950.00,
            status: "SENT",
            date: new Date(Date.now() - 86400000 * 2).toISOString(),
            dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
          }
        ],
        metadata: { 
          lastUpdated: now.toISOString(),
          currency: "USD",
          demoMode: true
        }
      })
    }

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