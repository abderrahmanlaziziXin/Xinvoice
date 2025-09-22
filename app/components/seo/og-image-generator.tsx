/**
 * Open Graph Image Generator
 * Creates optimized social media preview images
 */

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function generateOGImage(
  title: string = "Xinvoice - AI-Powered Document Generation",
  description: string = "Create professional invoices, NDAs, and business documents with AI automation",
  theme: 'light' | 'dark' = 'light'
) {
  const width = 1200
  const height = 630

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a',
          backgroundImage: theme === 'light' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #2D1B69 0%, #11998E 100%)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            textAlign: 'center',
            background: theme === 'light' 
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(0, 0, 0, 0.8)',
            borderRadius: '24px',
            backdropFilter: 'blur(10px)',
            border: theme === 'light' 
              ? '1px solid rgba(255, 255, 255, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px',
              fontSize: '40px',
            }}
          >
            ✨
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '56px',
              fontWeight: '800',
              margin: '0 0 24px 0',
              color: theme === 'light' ? '#1a1a1a' : '#ffffff',
              lineHeight: '1.1',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: '24px',
              margin: '0 0 32px 0',
              color: theme === 'light' ? '#666666' : '#cccccc',
              lineHeight: '1.4',
              maxWidth: '700px',
            }}
          >
            {description}
          </p>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {['🤖 AI-Powered', '🌍 11+ Languages', '📄 Batch Processing', '💰 28+ Currencies'].map((feature) => (
              <div
                key={feature}
                style={{
                  padding: '12px 20px',
                  background: theme === 'light' 
                    ? 'rgba(102, 126, 234, 0.1)'
                    : 'rgba(102, 126, 234, 0.2)',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: theme === 'light' ? '#667eea' : '#ffffff',
                  border: `1px solid ${theme === 'light' ? '#667eea20' : '#667eea40'}`,
                }}
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  )
}