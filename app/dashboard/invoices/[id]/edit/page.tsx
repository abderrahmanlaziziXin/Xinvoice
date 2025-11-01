"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "../../../../hooks/use-toast";
import { DateInput } from "../../../../components/date-input";

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
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
  client: Client;
  date: string;
  dueDate: string;
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
}

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
      fetchClients();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (response.ok) {
        const data = await response.json();
        // Format dates for input fields
        const formattedInvoice = {
          ...data.invoice,
          date: new Date(data.invoice.date).toISOString().split("T")[0],
          dueDate: new Date(data.invoice.dueDate).toISOString().split("T")[0],
        };
        setInvoice(formattedInvoice);
      } else {
        error("Failed to load invoice");
        router.push("/dashboard/invoices");
      }
    } catch (err) {
      error("Failed to load invoice");
      router.push("/dashboard/invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    }
  };

  const handleInputChange = (field: keyof Invoice, value: any) => {
    if (!invoice) return;
    setInvoice({ ...invoice, [field]: value });
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: any
  ) => {
    if (!invoice) return;
    const newItems = [...invoice.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate amount for this item
    if (field === "quantity" || field === "rate") {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }

    // Recalculate totals
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * invoice.taxRate;
    const total = subtotal + taxAmount;

    setInvoice({
      ...invoice,
      items: newItems,
      subtotal,
      taxAmount,
      total,
    });
  };

  const addItem = () => {
    if (!invoice) return;
    const newItem: InvoiceItem = {
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setInvoice({
      ...invoice,
      items: [...invoice.items, newItem],
    });
  };

  const removeItem = (index: number) => {
    if (!invoice) return;
    const newItems = invoice.items.filter((_, i) => i !== index);
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * invoice.taxRate;
    const total = subtotal + taxAmount;

    setInvoice({
      ...invoice,
      items: newItems,
      subtotal,
      taxAmount,
      total,
    });
  };

  const handleSave = async () => {
    if (!invoice) return;

    // Validation
    if (!invoice.clientId) {
      error("Please select a client");
      return;
    }

    if (!invoice.items.length) {
      error("Please add at least one item");
      return;
    }

    // Validate all items have required fields
    for (let i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      if (!item.description.trim()) {
        error(`Item ${i + 1} description is required`);
        return;
      }
      if (item.quantity <= 0) {
        error(`Item ${i + 1} quantity must be greater than 0`);
        return;
      }
      if (item.rate <= 0) {
        error(`Item ${i + 1} rate must be greater than 0`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: invoice.clientId,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date,
          dueDate: invoice.dueDate,
          items: invoice.items,
          subtotal: invoice.subtotal,
          taxRate: invoice.taxRate,
          taxAmount: invoice.taxAmount,
          total: invoice.total,
          notes: invoice.notes,
          terms: invoice.terms,
          currency: invoice.currency,
          locale: invoice.currency === "USD" ? "en-US" : "en-GB",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        success("Invoice updated successfully!");
        // Refresh the router cache and navigate
        router.refresh();
        setTimeout(() => {
          router.push(`/dashboard/invoices/${invoiceId}`);
        }, 100);
      } else {
        const data = await response.json();
        error(data.error || "Failed to update invoice");
      }
    } catch (err) {
      console.error("Save error:", err);
      error("Failed to update invoice");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice?.currency || "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Invoice not found
          </h1>
          <button
            onClick={() => router.push("/dashboard/invoices")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <PencilIcon className="w-8 h-8 mr-3 text-blue-600" />
                Edit Invoice {invoice.invoiceNumber}
              </h1>
              <p className="text-gray-600 mt-2">
                Modify invoice details and items
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/dashboard/invoices/${invoiceId}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white shadow-lg rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Invoice Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client
                  </label>
                  <select
                    value={invoice.clientId}
                    onChange={(e) =>
                      handleInputChange("clientId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={invoice.currency}
                    onChange={(e) =>
                      handleInputChange("currency", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div>
                  <DateInput
                    label="Invoice Date"
                    value={invoice.date}
                    onChange={(date: string) => handleInputChange("date", date)}
                    required
                  />
                </div>

                <div>
                  <DateInput
                    label="Due Date"
                    value={invoice.dueDate}
                    onChange={(date: string) =>
                      handleInputChange("dueDate", date)
                    }
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white shadow-lg rounded-lg p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Items</h2>
                <button
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {invoice.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
                  >
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Item description"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rate
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "rate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Notes & Terms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white shadow-lg rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Additional Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={invoice.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Internal notes or additional information"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={invoice.terms || ""}
                    onChange={(e) => handleInputChange("terms", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Payment terms and conditions"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white shadow-lg rounded-lg p-6 sticky top-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.subtotal)}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tax Rate:</span>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={invoice.taxRate * 100}
                        onChange={(e) => {
                          const newTaxRate =
                            parseFloat(e.target.value) / 100 || 0;
                          const taxAmount = invoice.subtotal * newTaxRate;
                          const total = invoice.subtotal + taxAmount;
                          setInvoice({
                            ...invoice,
                            taxRate: newTaxRate,
                            taxAmount,
                            total,
                          });
                        }}
                        className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="ml-1 text-xs text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.taxAmount)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
