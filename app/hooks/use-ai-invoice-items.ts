import { useState } from 'react';
import { useToast } from './use-toast';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxRate: number;
}

interface AIGenerateItemsRequest {
  description: string;
  currency?: string;
  defaultTaxRate?: number;
}

interface AIGenerateItemsResponse {
  success: boolean;
  items: InvoiceItem[];
  reasoning?: string;
  error?: string;
  fallback?: boolean;
}

export function useAIInvoiceItems() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { addToast } = useToast();

  const generateItems = async (request: AIGenerateItemsRequest): Promise<InvoiceItem[]> => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/generate-invoice-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: request.description,
          currency: request.currency || 'USD',
          defaultTaxRate: request.defaultTaxRate || 0.08,
        }),
      });

      const data: AIGenerateItemsResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate invoice items');
      }

      if (data.success && data.items && data.items.length > 0) {
        addToast({
          type: 'success',
          message: `AI generated ${data.items.length} invoice item${data.items.length > 1 ? 's' : ''} successfully!`,
        });

        if (data.reasoning) {
          console.log('AI Reasoning:', data.reasoning);
        }

        return data.items;
      } else {
        throw new Error('No items were generated');
      }

    } catch (error) {
      console.error('Error generating AI invoice items:', error);
      
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to generate AI invoice items. Please try again.',
      });

      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateItems,
    isGenerating,
  };
}