"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import {
  PlusIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  useDashboardData,
  formatCurrency,
  formatDate,
  getStatusColor,
} from "../hooks/use-dashboard-data";
import {
  DashboardSkeleton,
  DashboardError,
} from "../components/dashboard-skeleton";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { data: dashboardData, isLoading, error, refetch } = useDashboardData();

  // Trigger data refresh when component mounts (user navigates back to dashboard)
  useEffect(() => {
    // Dispatch dashboard focus event to trigger data reset
    window.dispatchEvent(new CustomEvent("dashboardFocus"));
  }, []);

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  // Temporarily disabled authentication check for AI agent testing
  // if (!session) {
  //   redirect("/auth/signin");
  // }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <DashboardError error={error} onRetry={refetch} />;
  }

  if (!dashboardData) {
    return <DashboardError error="No data available" onRetry={refetch} />;
  }

  const { stats, recentInvoices, metadata } = dashboardData;

  // Map stats to display format with icons and colors
  const statsDisplay = [
    {
      label: stats.totalInvoices.label,
      value: stats.totalInvoices.count.toString(),
      icon: DocumentTextIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: stats.outstanding.label,
      value: formatCurrency(stats.outstanding.amount, metadata.currency),
      subValue: `${stats.outstanding.count} invoices`,
      icon: CurrencyDollarIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: stats.paidThisMonth.label,
      value: formatCurrency(stats.paidThisMonth.amount, metadata.currency),
      subValue: `${stats.paidThisMonth.count} payments`,
      icon: CheckCircleIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: stats.overdue.label,
      value: stats.overdue.count.toString(),
      subValue: formatCurrency(stats.overdue.amount, metadata.currency),
      icon: ExclamationTriangleIcon,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Notice */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Demo Mode:</strong> Authentication is temporarily disabled for AI agent testing. All features are fully functional.
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session?.user?.name || "Demo User"}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Here&apos;s what&apos;s happening with your invoices today.
            </p>
          </div>
          <Link
            href="/dashboard/invoices/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Invoice
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsDisplay.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.subValue && (
                    <p className="text-xs text-gray-400 mt-1">
                      {stat.subValue}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white shadow rounded-lg"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Invoices
              </h2>
              <Link
                href="/dashboard/invoices"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No invoices yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first invoice.
              </p>
              <div className="mt-6">
                <Link
                  href="/dashboard/invoices/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Your First Invoice
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {invoice.client}
                        </div>
                        {invoice.clientEmail && (
                          <div className="text-xs text-gray-500">
                            {invoice.clientEmail}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount, metadata.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{formatDate(invoice.dueDate)}</div>
                        <div className="text-xs text-gray-400">
                          Created {formatDate(invoice.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Link
            href="/dashboard/clients"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-lg">
                <EyeIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Manage Clients
                </h3>
                <p className="text-sm text-gray-500">
                  Add and organize your clients
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/settings"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <ClockIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Company Settings
                </h3>
                <p className="text-sm text-gray-500">
                  Update your business details
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/reports"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Reports</h3>
                <p className="text-sm text-gray-500">
                  View your earnings and trends
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
