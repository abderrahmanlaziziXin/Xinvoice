"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  PencilIcon,
  EyeIcon,
  PrinterIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "../../../hooks/use-toast";

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxRate: number;
}

interface Client {
  id: string;
  name: string;
  email?: string;
  address?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client?: Client;
  date: string;
  dueDate: string;
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  locale: string;
  terms?: string;
  notes?: string;
  paymentInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InvoiceDetailPage() {
  // Demo mode - no authentication required
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const invoiceId = params?.id as string;

  // Function definitions must come before useEffect hooks that use them
  const fetchInvoice = useCallback(async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (response.ok) {
        const data = await response.json();
        setInvoice(data.invoice);
      } else {
        error("Invoice not found");
        router.push("/dashboard/invoices");
      }
    } catch (err) {
      error("Failed to load invoice");
      router.push("/dashboard/invoices");
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId, error, router]);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (err) {
      console.error("Failed to load clients");
    }
  };

  const calculateTotals = useCallback(() => {
    if (!invoice) return;

    const subtotal = invoice.items.reduce((sum, item) => {
      const itemAmount = item.quantity * item.rate;
      return sum + itemAmount;
    }, 0);

    const taxAmount = subtotal * invoice.taxRate;
    const total =
      subtotal + taxAmount - invoice.discountAmount + invoice.shippingAmount;

    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            subtotal: Math.round(subtotal * 100) / 100,
            taxAmount: Math.round(taxAmount * 100) / 100,
            total: Math.round(total * 100) / 100,
            items: prev.items.map((item) => ({
              ...item,
              amount: Math.round(item.quantity * item.rate * 100) / 100,
            })),
          }
        : null
    );
  }, [invoice]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setInvoice((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    if (!invoice) return;

    const newItems = [...invoice.items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === "description" ? value : Number(value),
    };
    setInvoice((prev) => (prev ? { ...prev, items: newItems } : null));
  };

  const addItem = () => {
    if (!invoice) return;

    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            items: [
              ...prev.items,
              {
                description: "",
                quantity: 1,
                rate: 0,
                amount: 0,
                taxRate: 0,
              },
            ],
          }
        : null
    );
  };

  const removeItem = (index: number) => {
    if (!invoice || invoice.items.length <= 1) return;

    setInvoice((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
          }
        : null
    );
  };

  const validateForm = () => {
    if (!invoice) return false;

    const newErrors: any = {};

    if (!invoice.clientId) {
      newErrors.clientId = "Please select a client";
    }

    if (!invoice.invoiceNumber) {
      newErrors.invoiceNumber = "Invoice number is required";
    }

    if (!invoice.date) {
      newErrors.date = "Date is required";
    }

    if (!invoice.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    // Validate items
    invoice.items.forEach((item, index) => {
      if (!item.description) {
        newErrors[`item_${index}_description`] = "Description is required";
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = "Quantity must be positive";
      }
      if (item.rate <= 0) {
        newErrors[`item_${index}_rate`] = "Rate must be positive";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoice || !validateForm()) {
      error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoice),
      });

      if (response.ok) {
        const data = await response.json();
        setInvoice(data.invoice);
        setIsEditing(false);
        setErrors({}); // Clear any errors
        success("Invoice updated successfully");

        // Force a small delay to ensure state updates are complete
        setTimeout(() => {
          window.dispatchEvent(new Event("invoiceUpdated"));
        }, 100);
      } else {
        const data = await response.json();
        error(data.error || "Failed to update invoice");
      }
    } catch (err) {
      console.error("Error updating invoice:", err);
      error("Error updating invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!invoice) return;

    // Optimistic update
    const previousInvoice = invoice;
    setInvoice((prev) => (prev ? { ...prev, status: newStatus } : null));

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...invoice, status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setInvoice(data.invoice);
        success(`Invoice marked as ${newStatus.toLowerCase()}`);

        // Trigger refresh for any listening components (including dashboard)
        window.dispatchEvent(new Event("invoiceUpdated"));
        window.dispatchEvent(
          new CustomEvent("invoiceStatusChanged", {
            detail: {
              type: "statusChanged",
              invoice: data.invoice,
              previousStatus: previousInvoice.status,
              newStatus: newStatus,
            },
          })
        );
      } else {
        // Revert optimistic update on error
        setInvoice(previousInvoice);
        error("Failed to update invoice status");
      }
    } catch (err) {
      // Revert optimistic update on error
      setInvoice(previousInvoice);
      console.error("Error updating invoice status:", err);
      error("Error updating invoice status");
    }
  };

  const handleDelete = async () => {
    if (
      !invoice ||
      !window.confirm("Are you sure you want to delete this invoice?")
    )
      return;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        success("Invoice deleted successfully");
        window.dispatchEvent(new CustomEvent("dashboardFocus"));
        router.push("/dashboard/invoices");
      } else {
        error("Failed to delete invoice");
      }
    } catch (err) {
      error("Error deleting invoice");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice?.currency || "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "SENT":
        return "bg-blue-100 text-blue-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // useEffect hooks after all function definitions
  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
      fetchClients();
    }
  }, [invoiceId, fetchInvoice]);

  useEffect(() => {
    if (invoice && isEditing) {
      calculateTotals();
    }
  }, [
    invoice?.items,
    invoice?.taxRate,
    invoice?.discountAmount,
    invoice?.shippingAmount,
    isEditing,
    calculateTotals,
    invoice,
  ]);

  // Early returns after all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Demo mode - no authentication required

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Invoice not found
          </h2>
          <p className="text-gray-600 mt-2">
            The invoice you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("dashboardFocus"));
              router.push("/dashboard/invoices");
            }}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("dashboardFocus"));
                  router.push("/dashboard/invoices");
                }}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Invoice {invoice.invoiceNumber}
                </h1>
                <p className="text-gray-600 mt-2">
                  Created on {formatDate(invoice.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  invoice.status
                )}`}
              >
                {invoice.status}
              </span>

              {!isEditing && (
                <>
                  <Link
                    href="/dashboard/invoices/new"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Invoice
                  </Link>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                  </button>

                  {invoice.status === "DRAFT" && (
                    <button
                      onClick={() => handleStatusChange("SENT")}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <EnvelopeIcon className="w-4 h-4 mr-2" />
                      Mark as Sent
                    </button>
                  )}

                  {invoice.status === "SENT" && (
                    <button
                      onClick={() => handleStatusChange("PAID")}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Mark as Paid
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Form/Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow rounded-lg p-6"
        >
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Selection */}
                <div>
                  <label
                    htmlFor="clientId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Client *
                  </label>
                  <select
                    id="clientId"
                    name="clientId"
                    required
                    value={invoice.clientId}
                    onChange={handleChange}
                    className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.clientId
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-transparent"
                    }`}
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.clientId}
                    </p>
                  )}
                </div>

                {/* Invoice Number */}
                <div>
                  <label
                    htmlFor="invoiceNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    id="invoiceNumber"
                    name="invoiceNumber"
                    required
                    value={invoice.invoiceNumber}
                    onChange={handleChange}
                    className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.invoiceNumber
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-transparent"
                    }`}
                  />
                  {errors.invoiceNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.invoiceNumber}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Invoice Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={invoice.date}
                    onChange={handleChange}
                    className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.date
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-transparent"
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Due Date *
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    required
                    value={invoice.dueDate}
                    onChange={handleChange}
                    className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dueDate
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-transparent"
                    }`}
                  />
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dueDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Invoice Items
                  </h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {invoice.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-4 items-start p-4 border border-gray-200 rounded-lg"
                    >
                      {/* Description */}
                      <div className="col-span-12 md:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`item_${index}_description`]
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Item description"
                        />
                        {errors[`item_${index}_description`] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`item_${index}_description`]}
                          </p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Qty *
                        </label>
                        <input
                          type="number"
                          required
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`item_${index}_quantity`]
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`item_${index}_quantity`]}
                          </p>
                        )}
                      </div>

                      {/* Rate */}
                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rate *
                        </label>
                        <input
                          type="number"
                          required
                          min="0.01"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(index, "rate", e.target.value)
                          }
                          className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`item_${index}_rate`]
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                        {errors[`item_${index}_rate`] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[`item_${index}_rate`]}
                          </p>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="col-span-3 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-medium text-gray-900">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-1 md:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={invoice.items.length === 1}
                          className="mt-6 p-2 text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Tax Rate */}
                  <div>
                    <label
                      htmlFor="taxRate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      id="taxRate"
                      name="taxRate"
                      min="0"
                      max="100"
                      step="0.01"
                      value={invoice.taxRate * 100}
                      onChange={(e) =>
                        setInvoice((prev) =>
                          prev
                            ? { ...prev, taxRate: Number(e.target.value) / 100 }
                            : null
                        )
                      }
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Discount Amount */}
                  <div>
                    <label
                      htmlFor="discountAmount"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Discount Amount
                    </label>
                    <input
                      type="number"
                      id="discountAmount"
                      name="discountAmount"
                      min="0"
                      step="0.01"
                      value={invoice.discountAmount}
                      onChange={(e) =>
                        setInvoice((prev) =>
                          prev
                            ? {
                                ...prev,
                                discountAmount: Number(e.target.value),
                              }
                            : null
                        )
                      }
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Totals Display */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(invoice.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Tax ({(invoice.taxRate * 100).toFixed(1)}%):
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(invoice.taxAmount)}
                      </span>
                    </div>
                    {invoice.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Discount:</span>
                        <span className="text-sm font-medium">
                          -{formatCurrency(invoice.discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          Total:
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency(invoice.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={invoice.notes || ""}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes for this invoice..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="terms"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Terms & Conditions
                  </label>
                  <textarea
                    id="terms"
                    name="terms"
                    rows={4}
                    value={invoice.terms || ""}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Payment terms and conditions..."
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Invoice
                </button>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Display Mode */
            <div className="space-y-8">
              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Invoice Details
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Client
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {invoice.client?.name || "Unknown Client"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Invoice Number
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {invoice.invoiceNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Invoice Date
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {formatDate(invoice.date)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Due Date
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {formatDate(invoice.dueDate)}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Totals Display */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Payment Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(invoice.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Tax ({(invoice.taxRate * 100).toFixed(1)}%):
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(invoice.taxAmount)}
                      </span>
                    </div>
                    {invoice.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Discount:</span>
                        <span className="text-sm font-medium">
                          -{formatCurrency(invoice.discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          Total:
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency(invoice.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Display */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Invoice Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.rate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes and Terms */}
              {(invoice.notes || invoice.terms) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {invoice.notes && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Notes
                      </h3>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {invoice.notes}
                      </p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Terms & Conditions
                      </h3>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {invoice.terms}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
