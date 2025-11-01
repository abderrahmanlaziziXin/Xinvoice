"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../../../../hooks/use-toast';

interface Client {
  id: string;
  name: string;
  email?: string;
  address?: string;
  phone?: string;
  taxNumber?: string;
  contactPerson?: string;
}

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setClient(data.client);
      } else {
        error('Failed to load client');
        router.push('/dashboard/clients');
      }
    } catch (err) {
      error('Failed to load client');
      router.push('/dashboard/clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Client, value: string) => {
    if (!client) return;
    setClient({ ...client, [field]: value });
  };

  const handleSave = async () => {
    if (!client) return;

    // Basic validation
    if (!client.name.trim()) {
      error('Client name is required');
      return;
    }

    if (client.email && !isValidEmail(client.email)) {
      error('Please enter a valid email address');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: client.name.trim(),
          email: client.email?.trim() || null,
          address: client.address?.trim() || null,
          phone: client.phone?.trim() || null,
          taxNumber: client.taxNumber?.trim() || null,
          contactPerson: client.contactPerson?.trim() || null,
        }),
      });

      if (response.ok) {
        success('Client updated successfully!');
        router.push(`/dashboard/clients`);
      } else {
        const data = await response.json();
        error(data.error || 'Failed to update client');
      }
    } catch (err) {
      error('Failed to update client');
    } finally {
      setIsSaving(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Client not found
          </h1>
          <button
            onClick={() => router.push('/dashboard/clients')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
                Edit Client
              </h1>
              <p className="text-gray-600 mt-2">
                Update client information and contact details
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/dashboard/clients')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white shadow-lg rounded-lg p-8"
        >
          <div className="space-y-6">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="inline w-4 h-4 mr-1" />
                Client Name *
              </label>
              <input
                type="text"
                value={client.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="Enter client name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <EnvelopeIcon className="inline w-4 h-4 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={client.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="client@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="inline w-4 h-4 mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={client.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BuildingOfficeIcon className="inline w-4 h-4 mr-1" />
                Address
              </label>
              <textarea
                value={client.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main Street&#10;City, State 12345&#10;Country"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="inline w-4 h-4 mr-1" />
                Contact Person
              </label>
              <input
                type="text"
                value={client.contactPerson || ''}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Primary contact person"
              />
            </div>

            {/* Tax Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Number / VAT ID
              </label>
              <input
                type="text"
                value={client.taxNumber || ''}
                onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="TAX123456789"
              />
            </div>
          </div>

          {/* Form Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => router.push('/dashboard/clients')}
                className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}