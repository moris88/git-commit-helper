import { existsSync, readFileSync } from 'fs'
import { osLocaleSync } from 'os-locale'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let translations = {}
let currentLocale = 'en'

try {
  const locale = osLocaleSync() || 'en-US'
  currentLocale = locale.split('-')[0]
  const langFile = resolve(__dirname, `../locales/${currentLocale}.json`)

  if (existsSync(langFile)) {
    translations = JSON.parse(readFileSync(langFile, 'utf-8'))
  } else {
    // Fallback to English if the system's language is not supported
    currentLocale = 'en'
    const fallbackFile = resolve(__dirname, '../locales/en.json')
    translations = JSON.parse(readFileSync(fallbackFile, 'utf-8'))
  }
} catch (error) {
  console.error('Failed to load translation files:', error)
  // In case of error, load English as a fallback
  try {
    currentLocale = 'en'
    const fallbackFile = resolve(__dirname, '../locales/en.json')
    translations = JSON.parse(readFileSync(fallbackFile, 'utf-8'))
  } catch (fallbackError) {
    console.error('Failed to load fallback translation file:', fallbackError)
    translations = {} // No translations available
  }
}

export function getLocale() {
  return currentLocale
}

export function t(key, replacements = {}) {
  let translation = translations[key] || key
  for (const placeholder in replacements) {
    translation = translation.replace(
      new RegExp(`\\{${placeholder}\\}`, 'g'),
      replacements[placeholder]
    )
  }
  return translation
}
