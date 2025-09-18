import jsPDF from 'jspdf'
import { Locale } from '../../../packages/core/schemas'
import { isRTL } from '../i18n'

interface FontVariant {
  key: string
  vfsName: string
  fontName: string
  style: 'normal' | 'bold'
  url: string
}

interface FontConfig {
  primaryFontFamily: string
  secondaryFontFamily?: string
  variants: FontVariant[]
}

const RTL_LOCALES = new Set<Locale>([
  'ar-SA',
  'ar-AE',
  'ar-EG',
  'ar-DZ',
  'ar-MA',
  'ar-TN',
])

const FONT_CONFIGS: Record<string, FontConfig> = {
  default: {
    primaryFontFamily: 'NotoSans',
    secondaryFontFamily: 'NotoSans',
    variants: [
      {
        key: 'notosans-regular',
        vfsName: 'NotoSans-Regular.ttf',
        fontName: 'NotoSans',
        style: 'normal',
        url: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNb4g.ttf',
      },
      {
        key: 'notosans-bold',
        vfsName: 'NotoSans-Bold.ttf',
        fontName: 'NotoSans',
        style: 'bold',
        url: 'https://fonts.gstatic.com/s/notosans/v36/o-0NIpQlx3QUlC5A4PNr5TRA.ttf',
      },
    ],
  },
  arabic: {
    primaryFontFamily: 'NotoNaskhArabic',
    secondaryFontFamily: 'NotoNaskhArabic',
    variants: [
      {
        key: 'notonaskh-regular',
        vfsName: 'NotoNaskhArabic-Regular.ttf',
        fontName: 'NotoNaskhArabic',
        style: 'normal',
        url: 'https://fonts.gstatic.com/s/notonaskharabic/v21/taiFGn5y_w0ifkv0DyEKY5Z0MKJDNiIDOBcH.ttf',
      },
      {
        key: 'notonaskh-bold',
        vfsName: 'NotoNaskhArabic-Bold.ttf',
        fontName: 'NotoNaskhArabic',
        style: 'bold',
        url: 'https://fonts.gstatic.com/s/notonaskharabic/v21/taiIGn5y_w0ifkv0DyEKY5Z0MKJDNyqJOYoBSslP.ttf',
      },
    ],
  },
  'zh-CN': {
    primaryFontFamily: 'NotoSansSC',
    variants: [
      {
        key: 'notosans-sc-regular',
        vfsName: 'NotoSansSC-Regular.otf',
        fontName: 'NotoSansSC',
        style: 'normal',
        url: 'https://fonts.gstatic.com/s/notosanssc/v19/k3kJo84MPvpLmixcA63oeALZTYKlEwoy.ttf',
      },
      {
        key: 'notosans-sc-bold',
        vfsName: 'NotoSansSC-Bold.otf',
        fontName: 'NotoSansSC',
        style: 'bold',
        url: 'https://fonts.gstatic.com/s/notosanssc/v19/k3kHo84MPvpLmixcA63oeALZhaKIExkzL_NP.ttf',
      },
    ],
  },
  'ja-JP': {
    primaryFontFamily: 'NotoSansJP',
    variants: [
      {
        key: 'notosans-jp-regular',
        vfsName: 'NotoSansJP-Regular.otf',
        fontName: 'NotoSansJP',
        style: 'normal',
        url: 'https://fonts.gstatic.com/s/notosansjp/v63/-F63fjptAgt5VM-kVkqdyU8n1lYTFA.ttf',
      },
      {
        key: 'notosans-jp-bold',
        vfsName: 'NotoSansJP-Bold.otf',
        fontName: 'NotoSansJP',
        style: 'bold',
        url: 'https://fonts.gstatic.com/s/notosansjp/v63/-F6sfjptAgt5VM-kVkqdyU8n1pJWez0s.ttf',
      },
    ],
  },
  'ko-KR': {
    primaryFontFamily: 'NotoSansKR',
    variants: [
      {
        key: 'notosans-kr-regular',
        vfsName: 'NotoSansKR-Regular.otf',
        fontName: 'NotoSansKR',
        style: 'normal',
        url: 'https://fonts.gstatic.com/s/notosanskr/v40/Pby6FmXiEBPT4ITbgNA9cg.ttf',
      },
      {
        key: 'notosans-kr-bold',
        vfsName: 'NotoSansKR-Bold.otf',
        fontName: 'NotoSansKR',
        style: 'bold',
        url: 'https://fonts.gstatic.com/s/notosanskr/v40/Pby7FmXiEBPT4ITbgNA-ZjcvNA.ttf',
      },
    ],
  },
}

const loadedFonts = new Set<string>()
const loadingFonts = new Map<string, Promise<void>>()

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    const chunkArray = Array.from(chunk) as number[]
    binary += String.fromCharCode.apply(null, chunkArray)
  }
  return btoa(binary)
}

async function ensureFontLoaded(variant: FontVariant): Promise<void> {
  if (loadedFonts.has(variant.key)) {
    return
  }

  if (loadingFonts.has(variant.key)) {
    return loadingFonts.get(variant.key)!
  }

  if (typeof fetch === 'undefined') {
    throw new Error('Font loading requires fetch to be available (browser environment)')
  }

  const loadPromise = (async () => {
    const response = await fetch(variant.url)
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${variant.url}`)
    }

    const buffer = await response.arrayBuffer()
    const base64 = arrayBufferToBase64(buffer)
    const api = (jsPDF as any).API
    if (!api || typeof api.addFileToVFS !== 'function') {
      throw new Error('jsPDF font API is not available')
    }

    api.addFileToVFS(variant.vfsName, base64)
    api.addFont(variant.vfsName, variant.fontName, variant.style, 'Identity-H')

    loadedFonts.add(variant.key)
  })().finally(() => {
    loadingFonts.delete(variant.key)
  })

  loadingFonts.set(variant.key, loadPromise)
  await loadPromise
}

function resolveFontConfig(locale: Locale): FontConfig {
  if (FONT_CONFIGS[locale]) {
    return FONT_CONFIGS[locale]
  }

  if (RTL_LOCALES.has(locale)) {
    return FONT_CONFIGS.arabic
  }

  return FONT_CONFIGS.default
}

export interface LocaleFontPreparationResult {
  primaryFont: string
  secondaryFont: string
  monospaceFont: string
  direction: 'ltr' | 'rtl'
}

export async function prepareFontsForLocale(locale: Locale): Promise<LocaleFontPreparationResult> {
  const config = resolveFontConfig(locale)
  await Promise.all(config.variants.map(ensureFontLoaded))

  return {
    primaryFont: config.primaryFontFamily,
    secondaryFont: config.secondaryFontFamily ?? config.primaryFontFamily,
    monospaceFont: config.primaryFontFamily,
    direction: isRTL(locale) ? 'rtl' : 'ltr',
  }
}
