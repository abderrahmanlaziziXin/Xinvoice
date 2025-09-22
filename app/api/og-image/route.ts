/**
 * Dynamic Open Graph Image Generation API
 * Generates optimized social media preview images dynamically
 */

import { generateOGImage } from '../../components/seo/og-image-generator'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const title = searchParams.get('title') || 'Xinvoice - AI-Powered Document Generation'
    const description = searchParams.get('description') || 'Create professional invoices, NDAs, and business documents with AI automation'
    const theme = searchParams.get('theme') as 'light' | 'dark' || 'light'
    
    const imageResponse = await generateOGImage(title, description, theme)
    
    return new Response(imageResponse.body, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, immutable, no-transform, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Error generating OG image:', error)
    
    return new Response('Failed to generate image', {
      status: 500,
    })
  }
}