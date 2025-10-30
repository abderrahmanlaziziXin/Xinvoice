"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "../../hooks/use-toast";

interface ReportData {
  monthlyRevenue: {
    month: string;
    revenue: number;
    invoices: number;
  }[];
  statusBreakdown: {
    status: string;
    count: number;
    amount: number;
  }[];
  topClients: {
    name: string;
    email: string;
    totalAmount: number;
    invoiceCount: number;
  }[];
  overallStats: {
    totalRevenue: number;
    totalInvoices: number;
    averageInvoice: number;
    paidPercentage: number;
  };
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0], // Start of year
    to: new Date().toISOString().split("T")[0], // Today
  });

  const fetchReportData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/reports?from=${dateRange.from}&to=${dateRange.to}`
      );
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        throw new Error("Failed to fetch reports");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      error("Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, error]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Temporarily disabled authentication check for AI agent testing
  // if (!session) {
  //   redirect("/auth/signin");
  // }

  const exportReport = async (format: "csv" | "pdf") => {
    try {
      const response = await fetch(
        `/api/reports/export?format=${format}&from=${dateRange.from}&to=${dateRange.to}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `invoice-report-${dateRange.from}-to-${dateRange.to}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        success(`Report exported successfully!`);
      } else {
        throw new Error(`Failed to export ${format.toUpperCase()}`);
      }
    } catch (err) {
      console.error("Error exporting report:", err);
      error(`Failed to export ${format.toUpperCase()}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="h-64 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Reports & Analytics
                </h1>
                <p className="text-gray-600">
                  Insights and analytics for your invoice data
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
                {/* Date Range Filter */}
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        from: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) =>
                      setDateRange((prev) => ({ ...prev, to: e.target.value }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Export Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => exportReport("csv")}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportReport("pdf")}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {reportData && (
            <>
              {/* Overview Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Revenue
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {formatCurrency(reportData.overallStats.totalRevenue)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Invoices
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {reportData.overallStats.totalInvoices}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Average Invoice
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {formatCurrency(
                            reportData.overallStats.averageInvoice
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FunnelIcon className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Paid Rate
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {reportData.overallStats.paidPercentage.toFixed(1)}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Status Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Invoice Status Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {reportData.statusBreakdown.map((status) => (
                    <div key={status.status} className="text-center">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          status.status
                        )} mb-2`}
                      >
                        {status.status}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {status.count}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(status.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Monthly Revenue Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Monthly Revenue Trend
                </h3>
                <div className="space-y-4">
                  {reportData.monthlyRevenue.map((month) => (
                    <div
                      key={month.month}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-20 text-sm font-medium text-gray-700">
                        {month.month}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${Math.min(
                                (month.revenue /
                                  Math.max(
                                    ...reportData.monthlyRevenue.map(
                                      (m) => m.revenue
                                    )
                                  )) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-32 text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(month.revenue)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {month.invoices} invoices
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top Clients */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Top Clients
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/50 rounded-lg">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoices
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-gray-200">
                      {reportData.topClients.map((client, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {client.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {client.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {client.invoiceCount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(client.totalAmount)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
          )}

          {!reportData && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No data available
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No invoices found for the selected date range.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
