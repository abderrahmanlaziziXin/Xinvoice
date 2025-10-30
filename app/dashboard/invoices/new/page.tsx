"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  CalculatorIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "../../../hooks/use-toast";
import { useNavigationRefresh } from "../../../hooks/use-navigation-refresh";

interface InvoiceItem {
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

interface InvoiceFormData {
  clientId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  locale: string;
  terms: string;
  notes: string;
  paymentInstructions: string;
  status: string;
}

function NewInvoicePage() {
  // Fixed React Hooks Rules violations - hooks now called before conditionals
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();
  const { navigateWithRefresh } = useNavigationRefresh();

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState<InvoiceFormData>({
    clientId: searchParams?.get("client") || "",
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 14 days from now
    items: [
      {
        description: "",
        quantity: 1,
        rate: 0.01,
        amount: 0.01,
        taxRate: 0,
      },
    ],
    subtotal: 0,
    taxRate: 0.08, // 8% default tax rate
    taxAmount: 0,
    discountAmount: 0,
    shippingAmount: 0,
    total: 0,
    currency: "USD",
    locale: "en-US",
    terms: "",
    notes: "",
    paymentInstructions: "",
    status: "DRAFT",
  });

  // Function definitions must come before useEffect hooks that use them
  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (err) {
      error("Failed to load clients");
    } finally {
      setLoadingClients(false);
    }
  }, [error]);

  const generateInvoiceNumber = useCallback(async () => {
    try {
      const response = await fetch("/api/invoices");
      if (response.ok) {
        const data = await response.json();
        const nextNumber = data.invoices.length + 1;
        setFormData((prev) => ({
          ...prev,
          invoiceNumber: `INV-${nextNumber.toString().padStart(3, "0")}`,
        }));
      }
    } catch (err) {
      // Fallback to simple numbering
      setFormData((prev) => ({
        ...prev,
        invoiceNumber: "INV-001",
      }));
    }
  }, []);

  const calculateTotals = useCallback(() => {
    const subtotal = formData.items.reduce((sum, item) => {
      const itemAmount = item.quantity * item.rate;
      return sum + itemAmount;
    }, 0);

    const taxAmount = subtotal * formData.taxRate;
    const total =
      subtotal + taxAmount - formData.discountAmount + formData.shippingAmount;

    const newSubtotal = Math.round(subtotal * 100) / 100;
    const newTaxAmount = Math.round(taxAmount * 100) / 100;
    const newTotal = Math.round(total * 100) / 100;

    // Only update if values actually changed to prevent infinite loop
    setFormData((prev) => {
      if (
        prev.subtotal === newSubtotal &&
        prev.taxAmount === newTaxAmount &&
        prev.total === newTotal
      ) {
        return prev; // No change needed
      }

      return {
        ...prev,
        subtotal: newSubtotal,
        taxAmount: newTaxAmount,
        total: newTotal,
        // Don't update items array here to prevent infinite loop
      };
    });
  }, [
    formData.items,
    formData.taxRate,
    formData.discountAmount,
    formData.shippingAmount,
  ]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const newItems = [...formData.items];
    const updatedItem = {
      ...newItems[index],
      [field]: field === "description" ? value : Number(value),
    };

    // Calculate amount when quantity or rate changes
    if (field === "quantity" || field === "rate") {
      updatedItem.amount =
        Math.round(updatedItem.quantity * updatedItem.rate * 100) / 100;
    }

    newItems[index] = updatedItem;
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          quantity: 1,
          rate: 0.01,
          amount: 0.01,
          taxRate: 0,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.clientId) {
      newErrors.clientId = "Please select a client";
    }

    if (!formData.invoiceNumber) {
      newErrors.invoiceNumber = "Invoice number is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    // Validate items
    formData.items.forEach((item, index) => {
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

    if (!validateForm()) {
      error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    console.log("Submitting invoice data:", formData);

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        success("Invoice created successfully");

        // Clear form state to prevent navigation issues
        setErrors({});
        setIsSubmitting(false);

        // Trigger refresh for any listening components (including dashboard)
        window.dispatchEvent(new Event("invoiceCreated"));

        // Also trigger a general invoice update event for broader listeners
        window.dispatchEvent(
          new CustomEvent("invoiceUpdated", {
            detail: {
              type: "created",
              invoice: data.invoice,
            },
          })
        );

        // Navigate to the new invoice with refresh
        navigateWithRefresh(`/dashboard/invoices/${data.invoice.id}`);
        return; // Early return to prevent setting isSubmitting again
      } else {
        const data = await response.json();
        error(data.error || "Failed to create invoice");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
      error("Error creating invoice");
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: formData.currency,
    }).format(amount);
  };

  // useEffect hooks after all function definitions
  useEffect(() => {
    if (session) {
      fetchClients();
      generateInvoiceNumber();
    }
  }, [session, fetchClients, generateInvoiceNumber]);

  // Debug logging for isSubmitting state
  useEffect(() => {
    console.log("isSubmitting state changed:", isSubmitting);
  }, [isSubmitting]);

  // Only prevent browser refresh/close during submission, not client-side navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSubmitting) {
        // This only affects browser refresh/close, not Next.js routing
        e.preventDefault();
        e.returnValue = "Invoice is being saved...";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSubmitting]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  // Early returns after all hooks
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/dashboard/invoices"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Invoice
              </h1>
              <p className="text-gray-600 mt-2">
                Fill in the details to create a professional invoice
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow rounded-lg p-6"
        >
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
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="clientId"
                    name="clientId"
                    required
                    value={formData.clientId}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                </div>
                {errors.clientId && (
                  <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
                )}
                {!loadingClients && clients.length === 0 && (
                  <p className="mt-1 text-sm text-blue-600">
                    <Link href="/dashboard/clients/new" className="underline">
                      Create a client first
                    </Link>
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
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.invoiceNumber
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-300 focus:border-transparent"
                  }`}
                  placeholder="INV-001"
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
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.date
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-transparent"
                    }`}
                  />
                </div>
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
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    required
                    value={formData.dueDate}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dueDate
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-300 focus:border-transparent"
                    }`}
                  />
                </div>
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
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
                {formData.items.map((item, index) => (
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
                          handleItemChange(index, "description", e.target.value)
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
                        disabled={formData.items.length === 1}
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
                    value={formData.taxRate * 100}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        taxRate: Number(e.target.value) / 100,
                      }))
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
                    value={formData.discountAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        discountAmount: Number(e.target.value),
                      }))
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
                      {formatCurrency(formData.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Tax ({(formData.taxRate * 100).toFixed(1)}%):
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(formData.taxAmount)}
                    </span>
                  </div>
                  {formData.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Discount:</span>
                      <span className="text-sm font-medium">
                        -{formatCurrency(formData.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(formData.total)}
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
                  value={formData.notes}
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
                  value={formData.terms}
                  onChange={handleChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Payment terms and conditions..."
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard/invoices"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Invoice"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function NewInvoicePageWrapper() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewInvoicePage />
    </Suspense>
  );
}
