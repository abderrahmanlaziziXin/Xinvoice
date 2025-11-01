import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = 'demo-user-1';

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
    const user = await prisma.user.findUnique({
      where: { id: DEMO_USER_ID },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = UpdateSettingsSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: DEMO_USER_ID },
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

    return NextResponse.json({ 
      success: true,
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user settings:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}