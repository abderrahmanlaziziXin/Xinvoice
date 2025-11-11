import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserIdWithFallback } from '@/lib/auth-utils';

// Define the schema for AI-generated invoice items
const InvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be positive'),
  rate: z.number().min(0.01, 'Rate must be positive'),
  amount: z.number(),
  taxRate: z.number().min(0).max(1).default(0),
});

const AIInvoiceItemsResponseSchema = z.object({
  items: z.array(InvoiceItemSchema),
  reasoning: z.string().optional(),
});

const AIInvoiceItemsRequestSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  currency: z.string().default('USD'),
  defaultTaxRate: z.number().min(0).max(1).default(0.08),
  targetTotal: z.number().optional(),
  targetItemCount: z.number().min(1).max(10).optional(),
});

// POST /api/ai/generate-invoice-items - Generate invoice items using AI
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdWithFallback();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required. Please sign in to use AI features.' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = AIInvoiceItemsRequestSchema.parse(body);

    // Check if we have AI providers configured
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const provider = process.env.LLM_PROVIDER || 'openai';

    if (!openaiKey && !geminiKey) {
      // Provide demo response when no API keys are configured
      const demoItems = generateDemoItems(validatedData);
      return NextResponse.json({
        success: true,
        items: demoItems,
        reasoning: "Demo mode: Generated sample items based on your description. Configure OpenAI or Gemini API keys for real AI generation.",
        demo: true,
        timestamp: new Date().toISOString()
      });
    }

    try {
      let aiResponse: any;

      if (provider === 'openai' && openaiKey) {
        aiResponse = await generateWithOpenAI(validatedData, openaiKey);
      } else if (provider === 'gemini' && geminiKey) {
        aiResponse = await generateWithGemini(validatedData, geminiKey);
      } else {
        throw new Error('No valid AI provider configured');
      }

      // Validate the AI response
      const validatedResponse = AIInvoiceItemsResponseSchema.parse(aiResponse);

      return NextResponse.json({
        success: true,
        items: validatedResponse.items,
        reasoning: validatedResponse.reasoning,
        timestamp: new Date().toISOString()
      });

    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      return NextResponse.json({
        error: 'Failed to generate invoice items. Please try again or create items manually.',
        items: [],
        fallback: true
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error generating AI invoice items:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request format',
        details: error.errors,
        items: []
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Internal server error',
      items: []
    }, { status: 500 });
  }
}

async function generateWithOpenAI(data: z.infer<typeof AIInvoiceItemsRequestSchema>, apiKey: string) {
  // Parse user request for specific requirements
  const parsedRequest = parseUserRequest(data.description);
  const targetTotal = data.targetTotal || parsedRequest.targetTotal;
  const targetItemCount = data.targetItemCount || parsedRequest.itemCount;
  
  let systemPrompt = `You are an AI assistant that helps generate professional invoice items based on user descriptions. 

Your task is to:
1. Analyze the user's description of products/services
2. Generate appropriate invoice line items with realistic quantities, rates, and descriptions
3. Calculate amounts correctly (quantity * rate)
4. Apply appropriate tax rates if applicable
5. Return a structured JSON response

Guidelines:
- Be specific and professional in descriptions
- Use realistic market rates for the currency provided
- Break down complex services into logical line items
- Include reasonable quantities
- Calculate amounts precisely (amount = quantity * rate)
- Use the provided default tax rate unless the item should be tax-exempt`;

  if (targetItemCount) {
    systemPrompt += `
- Generate exactly ${targetItemCount} line items`;
  }

  if (targetTotal) {
    systemPrompt += `
- CRITICAL: The total amount across all items must equal exactly ${targetTotal}
- Distribute this total amount logically across the items based on their relative importance/complexity`;
  }

  systemPrompt += `

Return your response as valid JSON matching this exact schema:
{
  "items": [
    {
      "description": "Professional service or product description",
      "quantity": 1.0,
      "rate": 100.00,
      "amount": 100.00,
      "taxRate": 0.08
    }
  ],
  "reasoning": "Brief explanation of your choices"
}`;

  let userPrompt = `Generate invoice items for: "${data.description}"

Currency: ${data.currency}
Default tax rate: ${(data.defaultTaxRate * 100).toFixed(1)}%`;

  if (targetTotal || targetItemCount) {
    userPrompt += `\n\nSpecial Requirements:`;
    if (targetItemCount) userPrompt += `\n- Generate exactly ${targetItemCount} items`;
    if (targetTotal) userPrompt += `\n- Total amount must equal exactly ${targetTotal}`;
  }

  userPrompt += `\n\nPlease create appropriate line items with realistic pricing and quantities.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content received from OpenAI');
  }

  return JSON.parse(content);
}

async function generateWithGemini(data: z.infer<typeof AIInvoiceItemsRequestSchema>, apiKey: string) {
  // Parse user request for specific requirements
  const parsedRequest = parseUserRequest(data.description);
  const targetTotal = data.targetTotal || parsedRequest.targetTotal;
  const targetItemCount = data.targetItemCount || parsedRequest.itemCount;
  
  let prompt = `Generate professional invoice items based on this description: "${data.description}"

Currency: ${data.currency}
Default tax rate: ${(data.defaultTaxRate * 100).toFixed(1)}%

Create appropriate line items with:
- Professional descriptions
- Realistic quantities and rates for ${data.currency}
- Correct calculations (amount = quantity * rate)
- Appropriate tax rates`;

  if (targetItemCount) {
    prompt += `\n- Generate exactly ${targetItemCount} line items`;
  }

  if (targetTotal) {
    prompt += `\n- CRITICAL: The total amount across all items must equal exactly ${targetTotal}`;
    prompt += `\n- Distribute this total amount logically across the items`;
  }

  if (targetTotal || targetItemCount) {
    prompt += `\n\nSpecial Requirements:`;
    if (targetItemCount) prompt += `\n- Must create exactly ${targetItemCount} items`;
    if (targetTotal) prompt += `\n- Total must equal exactly ${targetTotal}`;
  }

  prompt += `

Respond with valid JSON only:
{
  "items": [
    {
      "description": "Service/product description",
      "quantity": 1.0,
      "rate": 100.00,
      "amount": 100.00,
      "taxRate": 0.08
    }
  ],
  "reasoning": "Brief explanation"
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error('No content received from Gemini');
  }

  // Extract JSON from the response (Gemini might wrap it in markdown)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in Gemini response');
  }

  return JSON.parse(jsonMatch[0]);
}

function generateDemoItems(data: z.infer<typeof AIInvoiceItemsRequestSchema>) {
  const description = data.description.toLowerCase();
  
  // Parse user request for total amount and item count
  const parsedRequest = parseUserRequest(data.description);
  
  const targetTotal = data.targetTotal || parsedRequest.targetTotal || null;
  const targetItemCount = data.targetItemCount || parsedRequest.itemCount || null;
  
  // Get base items based on description
  let baseItems: any[] = [];
  
  if (description.includes('website') || description.includes('web')) {
    baseItems = [
      { description: "Website Design & Development", weight: 0.5 },
      { description: "Responsive Mobile Optimization", weight: 0.15 },
      { description: "SEO Setup & Configuration", weight: 0.1 },
      { description: "Content Management System", weight: 0.15 },
      { description: "Testing & Quality Assurance", weight: 0.1 }
    ];
  } else if (description.includes('logo') || description.includes('design')) {
    baseItems = [
      { description: "Logo Design - Initial Concepts", weight: 0.4 },
      { description: "Logo Revisions & Refinements", weight: 0.25 },
      { description: "Final Logo Files & Formats", weight: 0.15 },
      { description: "Brand Guidelines Document", weight: 0.1 },
      { description: "Social Media Assets", weight: 0.1 }
    ];
  } else if (description.includes('consultation') || description.includes('consulting')) {
    baseItems = [
      { description: "Initial Consultation & Assessment", weight: 0.3 },
      { description: "Strategy Development", weight: 0.25 },
      { description: "Implementation Planning", weight: 0.2 },
      { description: "Follow-up Sessions", weight: 0.15 },
      { description: "Documentation & Reports", weight: 0.1 }
    ];
  } else if (description.includes('content') || description.includes('writing')) {
    baseItems = [
      { description: "Content Research & Planning", weight: 0.2 },
      { description: "Content Writing & Creation", weight: 0.4 },
      { description: "Editing & Proofreading", weight: 0.15 },
      { description: "SEO Optimization", weight: 0.15 },
      { description: "Content Publishing & Formatting", weight: 0.1 }
    ];
  } else {
    // Generic service items
    baseItems = [
      { description: "Project Planning & Setup", weight: 0.2 },
      { description: "Core Service Delivery", weight: 0.4 },
      { description: "Quality Review & Testing", weight: 0.15 },
      { description: "Client Communication & Updates", weight: 0.15 },
      { description: "Final Delivery & Support", weight: 0.1 }
    ];
  }
  
  // Determine final item count and total
  const finalItemCount = targetItemCount || Math.min(baseItems.length, 5);
  const finalTotal = targetTotal || getDefaultTotal(description);
  
  // Generate items with distributed pricing
  return generateItemsWithPricing(baseItems, finalItemCount, finalTotal, data.defaultTaxRate);
}

function parseUserRequest(description: string): { targetTotal?: number, itemCount?: number } {
  const result: { targetTotal?: number, itemCount?: number } = {};
  
  // Parse total amount (supports various formats)
  const totalPatterns = [
    /(\d+(?:,\d{3})*)\s*(?:dollar|usd|\$)/i,
    /\$\s*(\d+(?:,\d{3})*)/i,
    /total.*?(\d+(?:,\d{3})*)/i,
    /(\d+(?:,\d{3})*)\s*total/i
  ];
  
  for (const pattern of totalPatterns) {
    const match = description.match(pattern);
    if (match) {
      result.targetTotal = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }
  
  // Parse item count
  const itemPatterns = [
    /(\d+)\s*(?:separate\s*)?items?/i,
    /generate\s*(\d+)/i,
    /(\d+)\s*different/i,
    /(\d+)\s*parts?/i
  ];
  
  for (const pattern of itemPatterns) {
    const match = description.match(pattern);
    if (match) {
      result.itemCount = parseInt(match[1]);
      break;
    }
  }
  
  return result;
}

function getDefaultTotal(description: string): number {
  const desc = description.toLowerCase();
  
  if (desc.includes('website') || desc.includes('web')) return 3800;
  if (desc.includes('logo') || desc.includes('design')) return 1150;
  if (desc.includes('consultation') || desc.includes('consulting')) return 800;
  if (desc.includes('content') || desc.includes('writing')) return 625;
  
  return 700; // Generic default
}

function generateItemsWithPricing(
  baseItems: { description: string, weight: number }[],
  itemCount: number,
  total: number,
  taxRate: number
) {
  // Select the top items based on count needed
  const selectedItems = baseItems.slice(0, itemCount);
  
  // Normalize weights for selected items
  const totalWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);
  const normalizedItems = selectedItems.map(item => ({
    ...item,
    normalizedWeight: item.weight / totalWeight
  }));
  
  // Distribute total amount based on weights
  const items = normalizedItems.map((item, index) => {
    const amount = Math.round(total * item.normalizedWeight * 100) / 100;
    
    return {
      description: item.description,
      quantity: 1,
      rate: amount,
      amount: amount,
      taxRate: taxRate
    };
  });
  
  // Adjust for rounding errors to match exact total
  const currentTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const difference = Math.round((total - currentTotal) * 100) / 100;
  
  if (difference !== 0 && items.length > 0) {
    items[0].rate += difference;
    items[0].amount += difference;
  }
  
  return items;
}