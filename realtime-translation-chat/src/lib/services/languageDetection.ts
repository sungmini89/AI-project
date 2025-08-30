import { franc } from 'franc'

const LANGUAGE_MAP: Record<string, string> = {
  'cmn': 'zh', // Chinese (Mandarin)
  'eng': 'en', // English
  'spa': 'es', // Spanish
  'fra': 'fr', // French
  'deu': 'de', // German
  'ita': 'it', // Italian
  'por': 'pt', // Portuguese
  'rus': 'ru', // Russian
  'jpn': 'ja', // Japanese
  'kor': 'ko', // Korean
  'ara': 'ar', // Arabic
  'hin': 'hi', // Hindi
  'tha': 'th', // Thai
  'vie': 'vi', // Vietnamese
  'nld': 'nl', // Dutch
  'pol': 'pl', // Polish
  'swe': 'sv', // Swedish
  'dan': 'da', // Danish
  'nor': 'no', // Norwegian
  'fin': 'fi', // Finnish
  'heb': 'he', // Hebrew
  'tur': 'tr', // Turkish
  'ukr': 'uk', // Ukrainian
  'ces': 'cs', // Czech
  'hun': 'hu', // Hungarian
  'ron': 'ro', // Romanian
  'cat': 'ca', // Catalan
  'hrv': 'hr', // Croatian
  'slk': 'sk', // Slovak
  'slv': 'sl', // Slovenian
  'est': 'et', // Estonian
  'lav': 'lv', // Latvian
  'lit': 'lt', // Lithuanian
}

/**
 * Detect language using franc library with character-based detection for short text
 * Falls back to 'en' for undetected languages
 */
export function detectLanguage(text: string): string {
  // Clean text (remove extra spaces, line breaks)
  const cleanText = text.trim().replace(/\s+/g, ' ')
  
  // Character-based detection for short text
  if (cleanText.length < 10) {
    // Japanese detection (hiragana, katakana, kanji)
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(cleanText)) {
      console.log('🎌 Short text detected as Japanese by character analysis')
      return 'ja'
    }
    // Korean detection (hangul)
    if (/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(cleanText)) {
      console.log('🇰🇷 Short text detected as Korean by character analysis')
      return 'ko'
    }
    // Chinese detection (CJK ideographs)
    if (/[\u4E00-\u9FFF]/.test(cleanText)) {
      console.log('🇨🇳 Short text detected as Chinese by character analysis')
      return 'zh'
    }
    // Arabic detection
    if (/[\u0600-\u06FF]/.test(cleanText)) {
      return 'ar'
    }
    // Russian/Cyrillic detection
    if (/[\u0400-\u04FF]/.test(cleanText)) {
      return 'ru'
    }
    
    return 'en' // Fallback for other short texts
  }
  
  try {
    const detected = franc(cleanText)
    console.log(`🔍 Franc detected language: ${detected} for text: "${cleanText}"`)
    
    // Return ISO 639-1 code if found in mapping
    if (detected && LANGUAGE_MAP[detected]) {
      return LANGUAGE_MAP[detected]
    }
    
    // Check if detected code is already ISO 639-1 (2 letters)
    if (detected && detected.length === 2) {
      return detected
    }
    
    return 'en' // Fallback to English
  } catch (error) {
    console.error('Language detection error:', error)
    return 'en'
  }
}

/**
 * Get supported languages list
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
] as const

export function getLanguageName(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code)
  return lang?.name || code.toUpperCase()
}

export function isLanguageSupported(code: string): boolean {
  return SUPPORTED_LANGUAGES.some(l => l.code === code)
}