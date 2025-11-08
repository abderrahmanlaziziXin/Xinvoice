import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { resolveUserId } from '../../../lib/request-user';

const prisma = new PrismaClient();

const UpdateSettingsSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  taxNumber: z.string().optional(),
  defaultCurrency: z.string().min(3).max(3),
  defaultLocale: z.string(),
  defaultTaxRate: z.number().min(0).max(1),
  defaultTerms: z.string().optional(),
});

export async function GET() {
  try {
    console.log('Settings GET - Resolving user...');
    
    const userId = resolveUserId();
    if (!userId) {
      console.log('Settings GET - No user ID found');
      return NextResponse.json({ 
        error: 'Unauthorized: set DEFAULT_USER_ID or enable DEMO_MODE=true.' 
      }, { status: 401 });
    }

    console.log('Settings GET - User ID:', userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log('Settings GET - User not found, creating demo user...');
      // Auto-create user for demo purposes
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@demo.local`,
          name: 'Demo User',
          companyName: 'Demo Company',
          defaultCurrency: 'USD',
          defaultLocale: 'en-US',
          defaultTaxRate: 0.08,
        }
      });
      console.log('Settings GET - Created demo user:', newUser.id);
      return NextResponse.json({ user: newUser });
    }

    console.log('Settings GET - User found:', user.id);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings. Check server logs for details.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('Settings PUT - Starting update process...');
    
    const userId = resolveUserId();
    if (!userId) {
      console.log('Settings PUT - No user ID found');
      return NextResponse.json({ 
        error: 'Unauthorized: set DEFAULT_USER_ID or enable DEMO_MODE=true.' 
      }, { status: 401 });
    }

    console.log('Settings PUT - User ID:', userId);

    const body = await request.json();
    console.log('Settings PUT - Request body:', JSON.stringify(body, null, 2));
    
    const validatedData = UpdateSettingsSchema.parse(body);
    console.log('Settings PUT - Validated data:', JSON.stringify(validatedData, null, 2));

    // First check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log('Settings PUT - User not found, creating...');
      user = await prisma.user.create({
        data: {
          id: userId,
          email: validatedData.email,
          name: validatedData.name || 'Demo User',
          companyName: validatedData.companyName || 'Demo Company',
          companyAddress: validatedData.companyAddress,
          companyPhone: validatedData.companyPhone,
          website: validatedData.website || null,
          taxNumber: validatedData.taxNumber,
          defaultCurrency: validatedData.defaultCurrency,
          defaultLocale: validatedData.defaultLocale,
          defaultTaxRate: validatedData.defaultTaxRate,
          defaultTerms: validatedData.defaultTerms,
        }
      });
      console.log('Settings PUT - Created new user:', user.id);
    } else {
      console.log('Settings PUT - Updating existing user...');
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          name: validatedData.name,
          email: validatedData.email,
          companyName: validatedData.companyName,
          companyAddress: validatedData.companyAddress,
          companyPhone: validatedData.companyPhone,
          website: validatedData.website || null,
          taxNumber: validatedData.taxNumber,
          defaultCurrency: validatedData.defaultCurrency,
          defaultLocale: validatedData.defaultLocale,
          defaultTaxRate: validatedData.defaultTaxRate,
          defaultTerms: validatedData.defaultTerms,
        },
      });
      console.log('Settings PUT - Updated user:', user.id);
    }

    return NextResponse.json({ 
      success: true,
      user: user,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating user settings:', error);

    if (error instanceof z.ZodError) {
      console.log('Settings PUT - Validation error:', error.errors);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors[0].message,
          field: error.errors[0].path.join('.')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to save settings. Check server logs for details.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Add POST method for backward compatibility
export async function POST(request: NextRequest) {
  return PUT(request);
}